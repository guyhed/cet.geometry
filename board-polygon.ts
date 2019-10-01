/// <amd-module name='cet.geometry/board-polygon'/>
/// <reference path ="./jsxgraph/jsx.d.ts"/>

import geo = require('cet.geometry/geo');
import utils = require('cet.geometry/board-utils');
import BoardPoint = require('cet.geometry/board-point');
import brd = require('cet.geometry/board');

const Point = geo.Point;
type Point = geo.Point;
const Segment = geo.Segment;
type Segment = geo.Segment;


var JXG: any = window['JXG'];


class BoardPolygon {
    parents: BoardPoint[];
    jsxPolygon: JsxPolygon;
    board: brd.Board;
    color:string;

    constructor(board: brd.Board, parents: BoardPoint[], color: string) {
        this.parents = parents;
        this.board = board;
        this.color = color;
        this.jsxPolygon = this.board.jsxBoard.create('polygon', parents.map(p => p.jsxPoint), { hasInnerPoints: true, fillColor: color, highlightFillColor: color, highlightFillOpacity: 0.7 });
        parents.forEach(p => p.addChild(this));
        this.jsxPolygon.on('drag', () => this.onDrag());
        this.jsxPolygon.on('up', () => this.onUp());
    }

    isDragged = false;
    onDrag() {
        this.isDragged = true;
        this.parents.forEach(p => p.markClosestGridPoint());
        return false;
    }

    onUp() {
        if (this.isDragged) {
            this.board.grid.movePointSetToGrid(this.parents);
        }
        this.isDragged = false;
    }

    remove() {
        this.parents.forEach(p => p.removeChild(this));
        this.board.jsxBoard.removeObject(this.jsxPolygon);
    }


}


export = BoardPolygon