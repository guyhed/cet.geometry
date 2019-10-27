/// <amd-module name='cet.geometry/app/geoboard'/>

import geo = require('cet.geometry/logic/geo');
import BoardPoint = require('cet.geometry/board/board-point');
import brd = require('cet.geometry/board/board');
import BoardSegment = require('cet.geometry/board/board-segment');
import BoardCycle = require('cet.geometry/board/board-cycle');
import utils = require('cet.geometry/board/board-utils');
import BoardPolygon = require('cet.geometry/board/board-polygon');
import BoardGrid = require('cet.geometry/board/board-grid');

import stt = require('cet.geometry/app/state');



class Geoboard {
  board: brd.Board;
  constructor(element: HTMLElement, settings: brd.BoardSettings, preset:stt.Preset) {
    this.board = new brd.Board(element, settings);
    stt.setPreset(this.board,preset);
    this.board.setChangeCallback(() => this.triggerChange());
  }

  setState(state:stt.State){
    this.board.clear();
    stt.setState(this.board,state);
  }

  getState():stt.State {
    return stt.getState(this.board);
  }

  setMode(mode:brd.Interaction) {
    this.board.setMode(mode);
  }

  _changeCallbacks: Array<() => void> = [];
  triggerChange() {
    this._changeCallbacks.forEach(c => c());
  }

  onChange(callback: () => void): () => void {
    this._changeCallbacks.push(callback);
    return callback;
  }

  offChange(callback: () => void) {
    const index = this._changeCallbacks.indexOf(callback);
    if (index > -1) this._changeCallbacks.splice(index, 1);
  }


}

export = Geoboard

