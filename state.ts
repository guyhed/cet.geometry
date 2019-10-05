/// <amd-module name='cet.geometry/state'/>
/// <reference path ="./jsxgraph/jsx.d.ts"/>

import geo = require('cet.geometry/geo');
import BoardPoint = require('cet.geometry/board-point');
import brd = require('cet.geometry/board');
import BoardSegment = require('cet.geometry/board-segment');
import BoardCycle = require('cet.geometry/board-cycle');
import utils = require('cet.geometry/board-utils');
import BoardPolygon = require('cet.geometry/board-polygon');
import BoardGrid = require('cet.geometry/board-grid');


export const Point = geo.Point;
export type Point = geo.Point;
export const Segment = geo.Segment;
export type Segment = geo.Segment;
export const Polygon = geo.Polygon;
export type Polygon = geo.Polygon;

var JXG: any = window['JXG'];

interface StatePoint {
  x: number;
  y: number;
}
interface StateSegment {
  pointIndices: number[];
}
interface StatePolygon {
  pointIndices: number[];
  color: string;
}
export class State {
  points: StatePoint[] = [];
  segments: StateSegment[] = [];
  polygons: StatePolygon[] = [];
  mode: brd.Interaction = brd.Interaction.addSegment;
  // angleTools: ProtractorState[] = [];
  // lengthTools: RulerState[] = [];
  // drawCanvas: string = '';

}

export function getState(board: brd.Board): State {
  const state = new State();
  let idCounter = 0
  const indexDictionary: { [key: string]: number } = {};
  state.points = board._points.map(p => {
    const jp = p.jsxPoint;
    const index = idCounter++;
    indexDictionary[jp.id] = index;
    return <StatePoint>{ x: jp.X(), y: jp.Y() };
  })
  state.segments = board._segments.map(s => {
    return { pointIndices: s.parents.map(p => indexDictionary[p.jsxPoint.id]) };
  });
  state.polygons = board._polygons.map(pol => {
    return {
      pointIndices: pol.parents.map(p => indexDictionary[p.jsxPoint.id]),
      color: pol.color
    };
  });
  state.mode = board.getMode();
  return state;
}

export function setState(board: brd.Board, state: State) {
  const points = state.points.forEach(p => board.addPoint(new Point(p.x, p.y)));
  state.segments.forEach(s => {
    board.addSegment(points[s.pointIndices[0]], points[s.pointIndices[1]]);
  });
  state.polygons.forEach(pol => {
    const cycle = new BoardCycle(pol.pointIndices.map(i => points[i]));
    board.addPolygon(cycle, pol.color);
  })
  board.update();
  board.setMode(state.mode);
}

export function getPolygons(state: State): Polygon[] {
  const points = state.points.map(p => new Point(p.x, p.y));
  return state.polygons.map(sp => new Polygon(sp.pointIndices.map(i => points[i])));
}

export function getSegments(state: State): Segment[] {
  const points = state.points.map(p => new Point(p.x, p.y));
  return state.segments.map(s => new Segment(points[s.pointIndices[0]], points[s.pointIndices[1]]));
}