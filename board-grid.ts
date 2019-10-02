import geo = require('cet.geometry/geo');
import BoardSegment = require('cet.geometry/board-segment');
import BoardPoint = require('cet.geometry/board-point');
import BoardPolygon = require('cet.geometry/board-polygon');
import brd = require('cet.geometry/board');
import utils = require('cet.geometry/board-utils');

const Point = geo.Point;
type Point = geo.Point;
const Segment = geo.Segment;
type Segment = geo.Segment;

class BoardGrid {
    board: brd.Board;
    jsxBoard: JsxBoard;
    unitLength: number;
    jsxPoints: JsxPoint[] = [];
    jsxSegments: JsxSegment[] = [];

    constructor(board: brd.Board, jsxBoard, unitLength: number, width: number, height: number, gridType: brd.GridType, withSegments: boolean) {
        this.board = board;
        this.jsxBoard = jsxBoard;
        this.unitLength = unitLength;
        this.drawGrid(width, height, gridType, withSegments);

    }



    drawGrid(width: number, height: number, gridType: brd.GridType, withSegments: boolean) {
        const points = (gridType === brd.GridType.triangular ? BoardGrid.getTriangularGridPoints : BoardGrid.getSquareGridPonts)(this.unitLength, width, height);
        points.forEach(p => this.addGridPoint(p));
        if (withSegments) {
            this.drawGridSegments();
        }
    }

    addGridPoint(p: Point) {
        const gridPointAttr = { size: 3, fixed: true, fillColor: '#ccc', strokeColor: '#ccc', withLabel: false, showInfoBox: false };
        const pt = this.jsxBoard.create('point', [p.x, p.y], gridPointAttr);
        this.jsxPoints.push(pt);
    }

    drawGridSegments() {
        const gridSegmentAttr = { fixed: true, strokeColor: '##ddd', withLabel: false };
        const n = this.jsxPoints.length;
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                if (this.areNeightbours(this.jsxPoints[i], this.jsxPoints[j])) {
                    this.jsxSegments.push(this.jsxBoard.create('segment', [this.jsxPoints[i], this.jsxPoints[j]], gridSegmentAttr));
                }
            }
        }
    }

    areNeightbours(pa: JsxPoint, pb: JsxPoint): boolean {
        const dx = pa.X() - pb.X();
        const dy = pa.Y() - pb.Y();
        const distance = Math.sqrt(dx * dx + dy * dy);
        return Math.abs(distance / this.unitLength - 1) < 0.0001;
    }

    getCloseGridPoint(point: Point): Point {
        const { jsxPoint, distance } = this.getClosestJsxGridPoint(point);
        return distance < this.unitLength / 5 ? new Point(jsxPoint.X(), jsxPoint.Y()) : null;
    }

    getClosestJsxGridPoint(point: Point) {
        var minDist = Number.MAX_VALUE;
        var closetPt = null;
        this.jsxPoints.forEach(pt => {
            let d = Point.distance(new Point(pt.X(), pt.Y()), point);
            if (d < minDist) {
                closetPt = pt;
                minDist = d;
            }
        });
        return { jsxPoint: closetPt, distance: minDist };
    }

    markClosestGridPoint(p: Point, oldClosest: JsxPoint): JsxPoint {
        const { jsxPoint, distance } = this.getClosestJsxGridPoint(p);
        if (oldClosest) oldClosest.setAttribute({ fillOpacity: 1, size: 2 });
        if (distance < this.unitLength) {
            jsxPoint.setAttribute({ fillOpacity: 0.5, size: 3 });
        }
        //}
        return jsxPoint;
    }

    unmarkAllGridPoints() {
        this.jsxPoints.forEach(pt => {
            pt.setAttribute({ fillOpacity: 1, size: 2 });
        });
    }

    movePointSetToGrid(points: BoardPoint[]) {
        let translation = new Point(0, 0);
        let prevTranslation = new Point(Number.MAX_VALUE, Number.MAX_VALUE);
        while (!translation.similarTo(prevTranslation)) {
            prevTranslation = translation;
            let vecs = points.map(p => {
                const newPos = Point.add(p.getPoint(), translation);
                const gp = this.markClosestGridPoint(newPos, null);
                return Point.subtruct(new Point(gp.X(), gp.Y()), p.getPoint());
            });
            translation = utils.getMax(vecs, v => v.norm());
        }
        points.forEach(p => p.translate(translation));
    }



    static getSquareGridPonts(unitLength: number, width: number, height: number) :Point[]{
        const points: Point[] = [];
        for (let i = 0; i <= height; i++) {
            for (let j = 0; j <= width; j++) {
                points.push(new Point(j * unitLength, i * unitLength));
            }
        }
        return points;
    }

    static getTriangularGridPoints(unitLength: number, width: number, height: number) :Point[] {
        const points: Point[] = [];
        const unitHeight = unitLength * Math.sqrt(3) / 2;
        for (let i = 0; i <= height; i++) {
            let rowWidth = i % 2 == 1 ? width - 1 : width;
            let d = i % 2 == 1 ? unitLength / 2 : 0;
            for (let j = 0; j <= rowWidth; j++) {
                points.push(new Point(j * unitLength + d, i * unitHeight));
            }
        }
        return points;
    }


}

export = BoardGrid