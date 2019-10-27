/// <amd-module name='cet.geometry/board/candidate-point'/>


import geo = require('cet.geometry/logic/geo');
import BoardSegment = require('cet.geometry/board/board-segment');
import BoardPolygon = require('cet.geometry/board/board-polygon');
import brd = require('cet.geometry/board/board');
import utils = require('cet.geometry/board/board-utils');

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
    if (brd.touch) {
      this.onTouchDown = CandidatePoint.prototype.onTouchDown.bind(this);
      this.board.jsxBoard.on('down', this.onTouchDown);
    } else {
      this.onMove = CandidatePoint.prototype.onMove.bind(this);
      this.onDown = CandidatePoint.prototype.onDown.bind(this);
      this.onBoardOut = CandidatePoint.prototype.onBoardOut.bind(this);
      this.createNewCandidate();
      this.registerDOMevents();
      this.board.jsxBoard.on('move', this.onMove);
    }
  }

  registerDOMevents() {
    this.container, addEventListener('mouseout', this.onBoardOut);
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
    if (this.board.getMode() === brd.Interaction.addSegment && event.buttons == 0) {
      const coords = this.board.getCoords(event);
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
    const color = "#dba";
    this.jsxPoint = this.board.jsxBoard.create('point', [0, 0], {
      visible: false, size: 3, fixed: false, withLabel: false, showInfoBox: false,
      fillColor: color, strokeColor: color, fillOpacity: 0.5,
      highlightFillColor: color, highlightStrokeColor: color,
      highlightFillOpacity: 0.5
    });
    this.jsxPoint.on('down', this.onDown);
  }

  onTouchDown(event) {
    if (this.board.getMode() !== brd.Interaction.addSegment) return;
    const coords = this.board.getCoords(event);
    const touchPoint = new Point(coords[0], coords[1]);
    const closestPoint = utils.getMin(this.board._points, bp => bp.distanceTo(touchPoint));
    const closestSegment = utils.getMin(this.board._segments, bs => bs.distanceTo(touchPoint));
    const distanceToSegment = closestSegment ? closestSegment.distanceTo(touchPoint) : Number.MAX_VALUE;
    const distanceToPoint = closestPoint ? closestPoint.distanceTo(touchPoint) : Number.MAX_VALUE;
    if (distanceToSegment < distanceToPoint && distanceToSegment < this.board.unitLength / 2) {
      const newPoint = this.board.addPoint(this.board.grid.getCloseGridPoint(touchPoint));
      this.board.addPointOnSegment(closestSegment, newPoint);
      newPoint.setFixed(true);
    } else {
      const seg = this.board.grid.getClosestGridSegment(touchPoint);
      const parents = [seg.a, seg.b].map(p => this.board.addPoint(p));
      parents.forEach(p => p.setFixed(true));
      this.board.addSegment(parents[0], parents[1]);
    }
    this.board.update();
  }
}


export = CandidatePoint