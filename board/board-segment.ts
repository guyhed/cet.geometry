/// <amd-module name='cet.geometry/board/board-segment'/>

import geo = require('cet.geometry/logic/geo');
import BoardPoint = require('cet.geometry/board/board-point');
import brd = require('cet.geometry/board/board');

const Point = geo.Point;
type Point = geo.Point;
const Segment = geo.Segment;
type Segment = geo.Segment;

declare var window;

var JXG: any = window['JXG'];


class BoardSegment {
  parents: Array<BoardPoint>;
  jsxSegment: JsxSegment;
  board: brd.Board;

  constructor(board: brd.Board, parents: BoardPoint[]) {
    this.parents = parents;
    this.board = board;
    const color = parents[0].jsxPoint.getAttribute('strokeColor');
    this.jsxSegment = this.board.jsxBoard.create('segment', parents.map(p => p.jsxPoint), this.getNewSegmentAttributes(color));
    parents.forEach(p => p.addChild(this));

    this.jsxSegment.on('drag', () => this.onDrag());
    this.jsxSegment.on('up', () => this.onUp());
  }

 getNewSegmentAttributes(color:string) {
   return { strokeWidth: 2, strokeColor: color, highlightStrokeColor: color, strokeOpacity:0.7, highlightStrokeOpacity: 1 }
 }


  getSegment(): Segment {
    return new Segment(this.parents[0].getPoint(), this.parents[1].getPoint());
  }

  onDown() {
    if (this.board.getMode() === brd.Interaction.deletion) {
      this.board.removeSegment(this);
    }
  }

  isDragged = false;
  onDrag() {
    this.isDragged = true;
    this.parents.forEach(p => p.markClosestGridPoint());
  }

  onUp() {
    if (this.isDragged) {
      this.board.grid.movePointSetToGrid(this.parents);
    }
    this.isDragged = false;
  }

  remove() {
    this.parents.forEach(p => p.removeChild(this));
    this.board.jsxBoard.removeObject(this.jsxSegment);
  }

  setColor(color: string) {
    this.jsxSegment.setAttribute({
      fillColor: color, strokeColor: color,
      highlightFillColor: color, highlightStrokeColor: color
    })
  }

  sameParents(segment: BoardSegment): boolean {
    return (this.parents[0] === segment.parents[1] && this.parents[1] === segment.parents[0]) || (this.parents[0] === segment.parents[0] && this.parents[1] === segment.parents[1]);
  }

  distanceTo(point: Point): number {
    const s = this.getSegment();
    const projection = s.getProjection(point);
    const distToProjection = projection ? Point.distance(s.getProjection(point), point) : Number.MAX_VALUE;
    return Math.min(distToProjection, Point.distance(s.a, point), Point.distance(s.b, point));
  }
}


export = BoardSegment