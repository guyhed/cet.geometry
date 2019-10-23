/// <amd-module name='cet.geometry/app/state'/>

import geo = require('cet.geometry/eval/geo');
import BoardPoint = require('cet.geometry/board/board-point');
import brd = require('cet.geometry/board/board');
import BoardSegment = require('cet.geometry/board/board-segment');
import BoardCycle = require('cet.geometry/board/board-cycle');
import utils = require('cet.geometry/board/board-utils');
import BoardPolygon = require('cet.geometry/board/board-polygon');
import BoardGrid = require('cet.geometry/board/board-grid');


 const Point = geo.Point;
 type Point = geo.Point;
 const Segment = geo.Segment;
 type Segment = geo.Segment;
 const Polygon = geo.Polygon;
 type Polygon = geo.Polygon;

var JXG: any = window['JXG'];

export interface StatePoint {
  x: number;
  y: number;
}
export interface StateSegment {
  pointIndices: number[];
}
export interface StatePolygon {
  pointIndices: number[];
  color: string;
}

export class Preset {
  points: StatePoint[] = [];
  segments: StateSegment[] = [];
  polygons: StatePolygon[] = [];
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
  const unit = board.unitLength;
  state.points = board._points.map(p => {
    const jp = p.jsxPoint;
    const index = idCounter++;
    indexDictionary[jp.id] = index;
    return <StatePoint>{ x: jp.X() / unit, y: jp.Y() / unit };
  });
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
  const unit = board.unitLength;
  const points = state.points.map(p => board.addPoint(new Point(p.x * unit, p.y * unit)));
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

export function setPreset(board: brd.Board, preset: Preset) { 
  const segments = preset.segments ?  getSegments(preset) : [];
  const polygons = preset.polygons ? getPolygons(preset): [];
  board.grid.drawPreset(segments, polygons);
}

export function getPolygons(state: State | Preset): Polygon[] {
  const points = state.points.map(p => new Point(p.x, p.y));
  return state.polygons.map(sp => new Polygon(sp.pointIndices.map(i => points[i])));
}

export function getSegments(state: State | Preset): Segment[] {
  const points = state.points.map(p => new Point(p.x, p.y));
  return state.segments.map(s => new Segment(points[s.pointIndices[0]], points[s.pointIndices[1]]));
}