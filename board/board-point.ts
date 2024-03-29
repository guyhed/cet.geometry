﻿/// <amd-module name='cet.geometry/board/board-point'/>


import geo = require('cet.geometry/logic/geo');
import BoardSegment = require('cet.geometry/board/board-segment');
import BoardPolygon = require('cet.geometry/board/board-polygon');
import brd = require('cet.geometry/board/board');

const Point = geo.Point;
type Point = geo.Point;
const Segment = geo.Segment;
type Segment = geo.Segment;




class BoardPoint {
  closestGridPoint: JsxPoint;
  jsxPoint: JsxPoint;
  hasMouseDown: boolean = false;
  board: brd.Board;
  children: Array<BoardSegment | BoardPolygon> = [];
  neighbours: Array<BoardPoint> = [];

  constructor(board: brd.Board, initPoint: Point | JsxPoint) {
    this.board = board;
    this.dropCallback = BoardPoint.prototype.dropCallback.bind(this);
    if (initPoint instanceof Point) {
      this.jsxPoint = board.jsxBoard.create('point', [initPoint.x, initPoint.y], this.getNewPointAttributes());
    } else {
      this.jsxPoint = initPoint;
      this.jsxPoint.setAttribute(this.getNewPointAttributes());
    }
    this.setColor("#EC934E");
    this.closestGridPoint = null;

    this.jsxPoint.on('down', () => this.onDown());
    this.jsxPoint.on('drag', () => this.onDrag());
    this.jsxPoint.on('up', () => this.onUp());
  }

  addChild(child: BoardSegment | BoardPolygon) {
    this.children.push(child);
  }

  removeChild(child: BoardSegment | BoardPolygon) {
    this.children.splice(this.children.indexOf(child), 1);
  }

  getNeighbours(): BoardPoint[] {
    Array
    this.neighbours = this.children
      .filter(child => child.parents.length == 2 && child.parents.includes(this))
      .map(child => child.parents.find(p => p !== this));
    return this.neighbours;
  }

  markClosestGridPoint() {
    this.closestGridPoint = this.board.grid.markClosestGridPoint(this.getPoint(), this.closestGridPoint);
  }

  moveToClosestGridPoint() {
    this.markClosestGridPoint();
    const translation = Point.subtruct(new Point(this.closestGridPoint.X(), this.closestGridPoint.Y()), this.getPoint());
    this.translate(translation);
  }

  vectorToClosestGridPoint(): Point {
    this.markClosestGridPoint();
    return Point.subtruct(new Point(this.closestGridPoint.X(), this.closestGridPoint.Y()), this.getPoint());
  }

  isDropping = false;
  translate(v: Point) {
    this.isDropping = true;
    this.jsxPoint.moveTo([this.jsxPoint.X() + v.x, this.jsxPoint.Y() + v.y], 100, { callback: this.dropCallback });
  }

  onDown() {
    this.hasMouseDown = true;
    this.setFixed(this.board.getMode() === brd.Interaction.addSegment);
  }

  onDrag() {
    this.markClosestGridPoint();
  }

  onUp() {
    this.moveToClosestGridPoint();
    this.hasMouseDown = false;
  }

  dropCallback() {
    this.isDropping = false;
    this.board.grid.unmarkAllGridPoints();
    this.board.updateFrame();
  }

  getPoint(): Point {
    return new Point(this.jsxPoint.X(), this.jsxPoint.Y())
  }

  distanceTo(point: Point): number {
    return Point.distance(this.getPoint(), point);
  }

  remove() {
    this.board.jsxBoard.removeObject(this.jsxPoint);
  }

  setColor(color: string) {
    this.jsxPoint.setAttribute({
      fillColor: color, strokeColor: color,
      highlightFillColor: color, highlightStrokeColor: color
    })
  }
  getColor(): string {
    return this.jsxPoint.getAttribute('fillColor');
  }

  setFixed(fixed: boolean) {
    this.jsxPoint.setAttribute({ fixed });
  }

  getNewPointAttributes() {
    return {
      size: 4, fixed: false, withLabel: false, showInfoBox: false,
      fillOpacity: 0.5,
      highlightFillOpacity: 1,
    };
  }

}

export = BoardPoint