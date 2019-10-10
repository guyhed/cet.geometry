/// <amd-module name='cet.geometry/board/board-cycle'/>

import geo = require('cet.geometry/eval/geo');
import utils = require('cet.geometry/board/board-utils');
import BoardPoint = require('cet.geometry/board/board-point');
import BoardSegment = require('cet.geometry/board/board-segment');

const Point = geo.Point;
type Point = geo.Point;
const Segment = geo.Segment;
type Segment = geo.Segment;
const Polygon = geo.Polygon;
type Polygon = geo.Polygon;

class BoardCycle {
    points: BoardPoint[];
    length: number;
    constructor(points: BoardPoint[]) {
        this.points = points;
        this.length = points.length;
    }

    getPolygon(): Polygon {
        return new Polygon(this.points.map(p => p.getPoint()));
    }

    area(): number {
        return this.getPolygon().area();
    }

    isSelfIntersect() {
        return this.getPolygon().isSelfIntersect();
    }

    shareSegment(cycle: BoardCycle) :boolean{ 
        return this.getNumberOfSharedSegments(cycle) > 0;
    }

    hasSamePoints(cycle: BoardCycle):boolean {
        return this.length == cycle.length && this.getNumberOfSharedSegments(cycle) == this.length;
    }

    getNumberOfSharedSegments(cycle: BoardCycle):number {
        const l = this.length;
        const cl = cycle.length;
        let numberOfShared = 0;
        for (let i = 0; i < l; i++) {
            for (let j = 0; j < cl; j++) {
                let pi0 = this.points[i];
                let pi1 = this.points[(i + 1) % l];
                let pj0 = cycle.points[j];
                let pj1 = cycle.points[(j + 1) % cl];
                if ((pi0 === pj0 && pi1 === pj1) || (pi0 === pj1 && pi1 === pj0)) {
                    numberOfShared ++;
                }
            }
        }
        return numberOfShared;
    }

    static getCycles(points: BoardPoint[]): BoardCycle[] {
        points.forEach(p => p.getNeighbours());
        let cycles: BoardCycle[] = points.map(p => {
            const cycPoints: BoardPoint[][] = p.neighbours.map(n => utils.getPaths(n, p, []))['flat']();
            let cycs = cycPoints.map(a => new BoardCycle(a));
            cycs = BoardCycle.cullCycles(cycs.filter(c => !c.isSelfIntersect()));
            return cycs;
        })['flat']();
        cycles = BoardCycle.cullCycles(cycles);
        return cycles;
    }

    static similarCycles(cyc1: BoardCycle, cyc2: BoardCycle): boolean {
        if (cyc2.length != cyc1.length) return false;
        const points1 = cyc1.points;
        const points2 = cyc2.points;
        const l = cyc1.length;
        for (let i = 0; i < l; i++) {
            if (points1.every((p, index) => p === points2[(index + i) % l])
                || points1.every((p, index) => p === points2[(l - index + i) % l])) {
                return true;
            }
        }
        return false;
    }

    static cullCycles(cycles: BoardCycle[]): BoardCycle[] {
        return cycles.filter((a, index) => {
            return a.points.length > 2 && cycles.slice(0, index).every(c => !BoardCycle.similarCycles(c, a));
        });
    }

    static groupCycles(cycles: BoardCycle[]): BoardCycle[][] {
        const groups: BoardCycle[][] = [];
        cycles.forEach(cycle => {
            const matchedGroups = groups.filter(g => g.some(c => cycle.shareSegment(c)));
            if (matchedGroups.length > 0) {
                for (let i = 1; i < matchedGroups.length; i++) {
                    groups.splice(groups.indexOf(matchedGroups[i]), 1);
                    matchedGroups[0] = matchedGroups[0].concat(matchedGroups[i]);
                }
                matchedGroups[0].push(cycle);
            } else {
                groups.push([cycle]);
            }
        });
        return groups;
    }

    static getLargestAreaCycles(cycles: BoardCycle[]): BoardCycle[] {
        //console.log('cycles', cycles);
        const groups = BoardCycle.groupCycles(cycles);
        const largestCycles = groups.map(g => {
            let largest: BoardCycle = null;
            let area = -1;
            g.forEach(c => {
                if (c.area() > area) {
                    area = c.area();
                    largest = c;
                }
            });
            return largest;
        });
        //console.log('largestCycles', largestCycles);
        return largestCycles;
    }
}






export = BoardCycle