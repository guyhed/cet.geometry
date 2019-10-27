/// <amd-module name='cet.geometry/board/board-grid'/>


import geo = require('cet.geometry/logic/geo');
import BoardSegment = require('cet.geometry/board/board-segment');
import BoardPoint = require('cet.geometry/board/board-point');
import BoardPolygon = require('cet.geometry/board/board-polygon');
import brd = require('cet.geometry/board/board');
import utils = require('cet.geometry/board/board-utils');

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
  points: Point[] = [];
  segments: Segment[] = [];

  constructor(board: brd.Board, jsxBoard, unitLength: number, width: number, height: number, gridType: brd.GridType, showSegments: boolean) {
    this.board = board;
    this.jsxBoard = jsxBoard;
    this.unitLength = unitLength;
    this.drawGrid(width, height, gridType, showSegments);
  }

  drawPreset(segments: Segment[], polygons: geo.Polygon[]) {
    segments.forEach(s => {
      this.jsxBoard.create('segment', [s.a, s.b].map(p => this.getClosestJsxGridPoint(p).jsxPoint), { fixed: true, strokeColor: '#999', withLabel: false });
    });
    polygons.forEach(pol => {
      this.jsxBoard.create('polygon', pol.vertices.map(p => this.getClosestJsxGridPoint(p).jsxPoint), { fixed: true, fillColor: '#eee', withLabel: false });
    });
  }

  drawGrid(width: number, height: number, gridType: brd.GridType, showSegments: boolean) {
    const points = (gridType === brd.GridType.triangular ? BoardGrid.getTriangularGridPoints : BoardGrid.getSquareGridPonts)(this.unitLength, width, height);
    points.forEach(p => this.addGridPoint(p));
    this.createGridSegments(showSegments);
  }

  addGridPoint(p: Point) {
    const gridPointAttr = { size: 1, fixed: true, 
      fillColor: '#ccc', strokeColor: '#ccc',
      highlightFillColor: '#ccc', highlightStrokeColor: '#ccc',
       withLabel: false, showInfoBox: false };
    const pt = this.jsxBoard.create('point', [p.x, p.y], gridPointAttr);
    this.jsxPoints.push(pt);
    this.points.push(p);
  }

  createGridSegments(visible: boolean) {
    const gridSegmentAttr = { fixed: true, strokeColor: '#e2e2e2', withLabel: false, visible };
    const n = this.jsxPoints.length;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (this.areNeightbours(this.jsxPoints[i], this.jsxPoints[j])) {
          this.jsxSegments.push(this.jsxBoard.create('segment', [this.jsxPoints[i], this.jsxPoints[j]], gridSegmentAttr));
          this.segments.push(new Segment(this.points[i], this.points[j]));
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
    const maxDist = brd.touch ? this.unitLength : this.unitLength / 5;
    return distance < maxDist ? new Point(jsxPoint.X(), jsxPoint.Y()) : null;
  }

  getClosestJsxGridPoint(point: Point) {
    const dist = pt => Point.distance(new Point(pt.X(), pt.Y()), point)
    const jsxPoint = utils.getMin(this.jsxPoints, pt => dist(pt));
    const distance = dist(jsxPoint);
    return { jsxPoint, distance };
  }

  getClosestGridSegment(point: Point) {
    const segment = utils.getMin(this.segments, s => {
      const proj = s.getProjection(point);
      return proj ? Point.distance(point, proj) : Number.MAX_VALUE;
    });
    return segment;
  }

  markClosestGridPoint(p: Point, oldClosest: JsxPoint): JsxPoint {
    const { jsxPoint, distance } = this.getClosestJsxGridPoint(p);
    if (oldClosest) oldClosest.setAttribute({ fillOpacity: 1, size: 1 });
    if (distance < this.unitLength) {
      jsxPoint.setAttribute({ fillOpacity: 0.5, size: 3 });
    }
    return jsxPoint;
  }

  unmarkAllGridPoints() {
    this.jsxPoints.forEach(pt => {
      pt.setAttribute({ fillOpacity: 1, size: 1 });
    });
  }

  movePointSetToGrid(points: BoardPoint[]) {
    let translation = new Point(0, 0);
    let prevTranslation = new Point(Number.MAX_VALUE, Number.MAX_VALUE);
    while (!translation.equals(prevTranslation)) {
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



  static getSquareGridPonts(unitLength: number, width: number, height: number): Point[] {
    const points: Point[] = [];
    for (let i = 0; i <= height; i++) {
      for (let j = 0; j <= width; j++) {
        points.push(new Point(j * unitLength, i * unitLength));
      }
    }
    return points;
  }

  static getTriangularGridPoints(unitLength: number, width: number, height: number): Point[] {
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