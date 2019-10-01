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

var JXG: any = window['JXG'];




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

  constructor({ element, unitLength = 50, width = 10, height = 10, gridType = GridType.square }) {
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
    this.jsxBoard.on('move', event => this.redrawPolygons());
    const jsxGridBoard = JXG.JSXGraph.initBoard(boardId + '_grid', this.getBoardAttributes(marginWidth));
    this.grid = new BoardGrid(this, jsxGridBoard, unitLength, width, height, gridType, false);
    this.setMode(Interaction.addSegment);
    this.candidate = new CandidatePoint(this);
  }

  getBoardAttributes(marginWidth: number) {
    return {
      boundingbox: [-marginWidth, -marginWidth, this.width + marginWidth, this.height + marginWidth],
      keepaspectratio: true, axis: false, grid: false, showNavigation: false, showCopyright: false,
      pan: { enable: false }
    }
  }

  _mode: Interaction;
  setMode(mode: Interaction) {
    this._mode = mode;
    if (mode !== Interaction.addSegment && this.candidate) {
      this.jsxBoard.removeObject(this.candidate);
      this.candidate = null;
    }
    this._points.forEach(p => p.setFixed(mode === Interaction.addSegment));
  }
  getMode(): Interaction {
    return this._mode;
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
      const parents = segment.parents.slice();
      this.removeSegment(segment);
      parents.forEach(p => this.addSegment(currentPoint, p));
    } else {
      const newPoint = this.addPoint(point, null);
      this.addSegment(currentPoint, newPoint);
      //console.log('down', boardPoint.jsxPoint.id, newPoint.jsxPoint.id, Date.now());
    }
    return currentPoint;
  }


  getBoardPoint(point: Point): BoardPoint {
    const boardPoint = this._points.find(p => {
      return Point.distance(p.getPoint(), point) < this.unitLength / 20;
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
  addPoint(p: Point | JsxPoint, color: string) {
    const point = new BoardPoint(this, p);
    if (color) point.setColor(color);
    this._points.push(point);
    return point;
  }

  removePoint(pt: BoardPoint) {
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
        boardPoint.children.slice().forEach(s => this.removeSegment(<BoardSegment>s));
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
        this.update();
        this._updateFrameId = null;
      })
    }
  }

  update() {
    //console.log('before: points', this._points, 'segments', this._segments);
    if (!this._points.some(p => p.isDropping)) {
      this._points.slice().forEach(p => !p.hasMouseDown && this.removeFlatAngles(p));
      this._segments.slice().forEach(s => this.removeDuplicateSegment(s));
      this._points.slice().forEach(p => !p.hasMouseDown && this.removeDuplicatePoint(p));
      this._points.slice().forEach(p => this.removeIfChildless(p));
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

