/// <amd-module name='cet.geometry/candidate-point'/>


import geo = require('cet.geometry/geo');
import BoardSegment = require('cet.geometry/board-segment');
import BoardPolygon = require('cet.geometry/board-polygon');
import brd = require('cet.geometry/board');

const Point = geo.Point;
type Point = geo.Point;
const Segment = geo.Segment;
type Segment = geo.Segment;

class CandidatePoint {
    jsxPoint: JsxPoint;
    board: brd.Board
    container: HTMLElement;

    constructor(board: brd.Board, container: HTMLElement) {
        this.board = board;
        this.container = container;
        this.onMove = CandidatePoint.prototype.onMove.bind(this);
        this.onDown = CandidatePoint.prototype.onDown.bind(this);
        this.onBoardOut = CandidatePoint.prototype.onBoardOut.bind(this);
        this.board.jsxBoard.on('move', this.onMove);
        this.registerDOMevents();
        this.createNewCandidate();
    }

    registerDOMevents() {
        this.container, addEventListener('mouseout', this.onBoardOut);
        this.container, addEventListener('touchend', this.onBoardOut);
    }

    onBoardOut(event: Event) {
        this.setVisible(false);
    }

    moveTo(point: Point) {
        this.jsxPoint.moveTo([point.x, point.y]);
    }

    gridPoint: Point = null;
    segment: BoardSegment = null;
    onMove(event) {
        let show = false;
        this.gridPoint = null;
        this.segment = null;
        const coords = this.board.getCoords(event);
        if (this.board.getMode() === brd.Interaction.addSegment && event.buttons == 0) {
            const point = new Point(coords[0], coords[1]);
            const gridPoint = this.board.grid.getCloseGridPoint(point);
            if (gridPoint) {
                this.gridPoint = gridPoint;
                this.moveTo(gridPoint);
                show = true;
            }
            const { segments } = this.board.getObjectUnderMouse();
            const projection = segments[0] && segments[0].getSegment().getProjection(point);
            if (projection) {
                this.segment = segments[0];
                const gridPointOnSegment = gridPoint && this.segment.getSegment().hasPoint(gridPoint);
                if (!gridPointOnSegment) this.moveTo(projection);
                show = true;
            }
        }
        this.setVisible(show);
    }

    setVisible(visible: boolean) {
        this.jsxPoint.setAttribute({ visible });
    }

    toPoint() {
        return new Point(this.jsxPoint.X(), this.jsxPoint.Y());
    }

    onDown() {
        const jsxPoint = this.jsxPoint;
        const segment = this.segment;
        this.createNewCandidate();
        this.board.addCandidate(jsxPoint, segment)
    }

    createNewCandidate() {
        if (this.jsxPoint) this.jsxPoint.off('down', this.onDown);
        this.segment = null;
        this.gridPoint = null;
        const color = "#EC934E";
        this.jsxPoint = this.board.jsxBoard.create('point', [0, 0], {
            visible: false, size: 5, fixed: false, withLabel: false, showInfoBox: false,
            fillColor: color, strokeColor: color, fillOpacity: 0.6,
            highlightFillColor: color, highlightStrokeColor: color,
            highlightFillOpacity: 0.6
        });
        this.jsxPoint.on('down', this.onDown);
    }
}

export = CandidatePoint