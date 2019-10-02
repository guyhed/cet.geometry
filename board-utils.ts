/// <amd-module name='cet.geometry/board-utils'/>

import geo = require('cet.geometry/geo');
import BoardPoint = require('cet.geometry/board-point');
import BoardSegment = require('cet.geometry/board-segment');

export const Point = geo.Point;
export type Point = geo.Point;
export const Segment = geo.Segment;
export type Segment = geo.Segment;

// used to locate cycles
export function getPaths(source: BoardPoint, sink: BoardPoint, visited: Array<BoardPoint>): BoardPoint[][] {
  if (source === sink) return [[sink]];
  const next = source.neighbours.filter(n => !visited.includes(n));
  visited.push(source);
  const paths: BoardPoint[][] = next.map(n => this.getPaths(n, sink, visited.slice()))['flat']();
  paths.forEach(a => a.push(source));
  return paths;
}

export function getMax<T>(ar: Array<T>, calc: (e: T) => number): T {
  let max: number = Number.NEGATIVE_INFINITY;
  let maxElement = null;
  ar.forEach(el => {
    let n = calc(el);
    if (n > max) {
      max = n;
      maxElement = el;
    }
  });
  return maxElement;
}
