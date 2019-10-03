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

var JXG: any = window['JXG'];

export class State {
  segments: Segment[] = [];
  mode: brd.Interaction = brd.Interaction.addSegment;
 // angleTools: ProtractorState[] = [];
 // lengthTools: RulerState[] = [];
 // drawCanvas: string = '';

}

export function getState(board: brd.Board):State {
  const state = new State();
  state.segments = board._segments.map(s => s.getSegment());
  state.mode = board.getMode();
  return state;
}

export function setState(board: brd.Board, state: State) {
  state.segments.forEach(s => {
    const parents = [s.a, s.b].map(p => board.addPoint(p, null));
    board.addSegment(parents[0], parents[1]);
    parents.forEach(p => board.removeDuplicatePoint(p));
  });
  board.setMode(state.mode);
}