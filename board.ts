/// <amd-module name='cet.geometry/board'/>
/// <reference path ="./jsxgraph/jsx.d.ts"/>

import geo = require('cet.geometry/geo');
import BoardPoint = require('cet.geometry/board-point');
import CandidatePoint = require('cet.geometry/candidate-point');
import BoardSegment = require('cet.geometry/board-segment');
import BoardCycle = require('cet.geometry/board-cycle');
import utils = require('cet.geometry/board-utils');
import BoardPolygon = require('cet.geometry/board-polygon');
import BoardGrid = require('cet.geometry/board-grid');


export const Point = geo.Point;
export type Point = geo.Point;
export const Segment = geo.Segment;
export type Segment = geo.Segment;

const JXG: any = window['JXG'];
export const touch = utils.isMobileOrTablet();



export enum GridType {
  square,
  triangular,
}

export enum Interaction {
  addSegment,
  text,
  move,
  area,
  draw,
  freeMove,
  deletion,
  clearText
}


export class Board {
  jsxBoard: JsxBoard;
  width: number;
  height: number;
  unitLength: number;
  candidate: CandidatePoint;
  grid: BoardGrid;

  static _idCounter = 0;

  constructor(element: HTMLElement, { unitLength = 40, width = 10, height = 10, gridType = GridType.square, showGridSegments = true, }) {
    const heightRatio = gridType == GridType.triangular ? Math.sqrt(3) / 2 : 1;
    this.width = width * unitLength;
    this.height = height * unitLength * heightRatio;
    this.unitLength = unitLength;
    const marginWidth = 10;
    const boardId = (element.id || 'cetjsx' + (Board._idCounter++)) + "_jsxBoard";
    (<HTMLElement>element).innerHTML = '<div id="' + boardId + '_container" style="width:' + (this.width + 2 * marginWidth) + 'px;height:' + (this.height + 2 * marginWidth) + 'px;position:relative;">'
      + '<div id="' + boardId + '_grid" style="position:absolute;top:0;left:0;bottom:0;right:0;"></div>'
      + '<div id="' + boardId + '" style="position:absolute;top:0;left:0;bottom:0;right:0;"></div>'
      + '</div>'
    this.jsxBoard = JXG.JSXGraph.initBoard(boardId, this.getBoardAttributes(marginWidth));
    this.jsxBoard.on('up', event => this.updateFrame());
    this.jsxBoard.on('move', event => this.onMove(event));
    this.jsxBoard.on('down', event => this.onDown(event));
    if (touch) this.preventTouchScroll(element);
    const jsxGridBoard = JXG.JSXGraph.initBoard(boardId + '_grid', this.getBoardAttributes(marginWidth));
    this.grid = new BoardGrid(this, jsxGridBoard, unitLength, width, height, gridType, showGridSegments);
    this.setMode(Interaction.addSegment);
    this.candidate = new CandidatePoint(this, element);
  }

  preventTouchScroll(element: HTMLElement) {
    const handler = (event: Event) => { event.stopPropagation(); event.preventDefault() }
    element.addEventListener('touchmove', handler);
    element.addEventListener('touchstart', handler);
  }


  getBoardAttributes(marginWidth: number) {
    return {
      boundingbox: [-marginWidth, -marginWidth, this.width + marginWidth, this.height + marginWidth],
      keepaspectratio: true, axis: false, grid: false, showNavigation: false, showCopyright: false,
      pan: { enabled: false },
      zoom: { min: 1, max: 1 }
    }
  }

  _mode: Interaction;
  setMode(mode: Interaction) {
    this._mode = mode;
    const fixed = ![Interaction.move, Interaction.freeMove].includes(mode);
    this._points.forEach(p => p.setFixed(fixed));
  }
  getMode(): Interaction {
    return this._mode;
  }

  onDown(event: Event) {
    if (this._mode === Interaction.deletion) {
      this.deleteObjectUnderMouse(event);
    }
  }

  onMove(event: Event) {
    this.redrawPolygons();
  }

  deleteObjectUnderMouse(event: Event) {
    const jsxObjects = this.jsxBoard.getAllObjectsUnderMouse(event);
    const point = this._points.find(p => jsxObjects.includes(p.jsxPoint));
    if (point) {
      this.removePoint(point);
      this.update();
    } else {
      const segment = this._segments.find(s => jsxObjects.includes(s.jsxSegment));
      if (segment) {
        this.removeSegment(segment);
        this.update();
      }
    }
  }

  getObjectUnderMouse() {
    const ids = [];
    for (let id in this.jsxBoard.highlightedObjects) ids.push(id);
    const points = this._points.filter(p => ids.includes(p.jsxPoint.id));
    const segments = this._segments.filter(s => ids.includes(s.jsxSegment.id));
    const polygons = this._polygons.filter(pol => ids.includes(pol.jsxPolygon.id));
    return { points, segments, polygons };
  }

  getCoords(event): number[] {
    return this.jsxBoard.getUsrCoordsOfMouse(event);
  }

  addCandidate(jsxPoint: JsxPoint, segment: BoardSegment): BoardPoint {
    const point = new Point(jsxPoint.X(), jsxPoint.Y());
    const boardPoint = this.getBoardPoint(point);
    const currentPoint = this.addPoint(jsxPoint, null);
    if (boardPoint) {
      this.addSegment(currentPoint, boardPoint);
    } else if (segment) {
      this.addPointOnSegment(segment, currentPoint);
    } else {
      const gridPoint = this.grid.getCloseGridPoint(currentPoint.getPoint());
      if (gridPoint) {
        const newPoint = this.addPoint(this.grid.getCloseGridPoint(currentPoint.getPoint()), null);
        this.addSegment(currentPoint, newPoint);
      }
    }
    return currentPoint;
  }

  addPointOnSegment(segment: BoardSegment, point: BoardPoint) {
    const parents = segment.parents.slice();
    this.removeSegment(segment);
    parents.forEach(p => this.addSegment(point, p));
  }


  getBoardPoint(point: Point): BoardPoint {
    const boardPoint = this._points.find(p => {
      const radius = touch ? this.unitLength / 2 : this.unitLength / 20;
      return Point.distance(p.getPoint(), point) < this.unitLength / 10;
    });
    return boardPoint;
  }

  getBoardSegment(point: Point): BoardSegment {
    const boardSegment = this._segments.find(s => {
      return s.getSegment().hasPoint(point);
    });
    return boardSegment;
  }

  _points: BoardPoint[] = [];
  addPoint(p: Point | JsxPoint, color: string = null) {
    const point = new BoardPoint(this, p);
    if (color) point.setColor(color);
    this._points.push(point);
    return point;
  }

  removePoint(pt: BoardPoint) {
    const segmentChildren: BoardSegment[] = this._segments.filter(s => s.parents.includes(pt));
    segmentChildren.forEach(s => this.removeSegment(s));
    this._points.splice(this._points.indexOf(pt), 1);
    pt.remove();
  }

  replacePointsInSegments(fromPoint: BoardPoint, toPoint: BoardPoint) {
    const oldSegs = this._segments.filter(s => s.parents.includes(fromPoint));
    oldSegs.forEach(s => this.replaceSegmentParent(s, fromPoint, toPoint));
  }

  replacePointsInOneSegment(fromPoint: BoardPoint, toPoint: BoardPoint) {
    const segment = this._segments.find(s => s.parents.includes(fromPoint));
    if (segment) {
      this.replaceSegmentParent(segment, fromPoint, toPoint);
    }
  }

  replaceSegmentParent(segment: BoardSegment, fromPoint: BoardPoint, toPoint: BoardPoint) {
    const i = segment.parents.indexOf(fromPoint);
    const parents = segment.parents.slice();
    this.removeSegment(segment);
    parents[i] = toPoint;
    let newSegment: BoardSegment = null;
    if (parents[0] !== parents[1]) {
      newSegment = this.addSegment(parents[0], parents[1]);
      this.removeDuplicateSegment(newSegment);
    }
  }

  redrawPolygons() {
    const cycles = BoardCycle.getLargestAreaCycles(BoardCycle.getCycles(this._points));
    const colors: string[] = cycles.map(cycle => {
      const polygon = this._polygons.find(pol => cycle.hasSamePoints(new BoardCycle(pol.parents)));
      return polygon ? polygon.color : null;
    })
    this._polygons.slice().forEach(p => this.removePolygon(p));
    cycles.forEach((c, i) => this.addPolygon(c, colors[i]));
  }
  static polygonColors = ['blue', 'green', 'orange', 'cyan', 'yellow'];
  _nextPolygonColorIndex: number = 0;
  getNextColor(): string {
    const color = Board.polygonColors[this._nextPolygonColorIndex];
    this._nextPolygonColorIndex = (this._nextPolygonColorIndex + 1) % Board.polygonColors.length;
    return color
  }

  _polygons: BoardPolygon[] = [];
  addPolygon(cycle: BoardCycle, color: string = null) {
    color = color || this.getNextColor();
    const pol = new BoardPolygon(this, cycle.points, color);
    this._polygons.push(pol);
    return pol;
  }

  removePolygon(pol: BoardPolygon) {
    this._polygons.splice(this._polygons.indexOf(pol), 1);
    pol.remove();
  }

  _segments: BoardSegment[] = [];
  addSegment(ptA: BoardPoint, ptB: BoardPoint) {
    const seg = new BoardSegment(this, [ptA, ptB]);
    this._segments.push(seg);
    return seg;
  }

  removeSegment(seg: BoardSegment) {
    this._segments.splice(this._segments.indexOf(seg), 1);
    seg.remove();
  }


  removeDuplicatePoint(boardPoint: BoardPoint) {
    var simPoint = this.findTweenPoint(boardPoint);
    if (simPoint && !simPoint.hasMouseDown) {
      this.replacePointsInSegments(boardPoint, simPoint);
    }
  }

  removeFlatAngles(boardPoint: BoardPoint) {
    const neighbours = boardPoint.getNeighbours();
    if (neighbours.length == 2) {
      const p = boardPoint.getPoint();
      const seg = new Segment(neighbours[0].getPoint(), neighbours[1].getPoint());
      if (seg.hasPoint(p)) {
        this.removePoint(boardPoint);
        this.addSegment(neighbours[0], neighbours[1]);
      }
    }
  }

  findTweenPoint(boardPoint: BoardPoint): BoardPoint {
    var point = boardPoint.getPoint();
    var simPoint = this._points.find(p => boardPoint !== p && Point.distance(point, p.getPoint()) < this.unitLength / 5);
    return simPoint;
  }

  _updateFrameId: number = null;
  updateFrame() {
    if (!this._updateFrameId) {
      this._updateFrameId = requestAnimationFrame(() => {
        this._updateFrameId = null;
        this.update();
      })
    }
  }

  update() {
    //console.log('before: points', this._points, 'segments', this._segments);
    if (true || !this._points.some(p => p.isDropping || p.hasMouseDown)) {
      this._points.slice().forEach(p => this.removeDuplicatePoint(p));
      this._points.slice().forEach(p => this.removeFlatAngles(p));
      this._segments.slice().forEach(s => this.removeDuplicateSegment(s));
      this._points.slice().forEach(p => this.removeIfChildless(p));
    } else {
      this.updateFrame();
    }
    this.redrawPolygons();
    //console.log('after: points', this._points, 'segments', this._segments);
  }

  removeDuplicateSegment(segment: BoardSegment) {
    if (this._segments.some(s => s !== segment && s.sameParents(segment))) {
      this.removeSegment(segment);
    }
  }

  removeIfChildless(p: BoardPoint): boolean {
    if (!this._segments.some(s => s.parents.includes(p))) {
      this.removePoint(p);
      return true;
    }
    return false;
  }


}

