/// <amd-module name='cet.geometry/app/evaluation'/>

import geo = require('cet.geometry/eval/geo');
import BoardPoint = require('cet.geometry/board/board-point');
import brd = require('cet.geometry/board/board');
import BoardSegment = require('cet.geometry/board/board-segment');
import BoardCycle = require('cet.geometry/board/board-cycle');
import utils = require('cet.geometry/board/board-utils');
import BoardPolygon = require('cet.geometry/board/board-polygon');
import BoardGrid = require('cet.geometry/board/board-grid');
import stt = require('cet.geometry/app/state');


const Point = geo.Point;
type Point = geo.Point;
const Segment = geo.Segment;
type Segment = geo.Segment;
const Polygon = geo.Polygon;
type Polygon = geo.Polygon;

export enum PolygonType {
  triangle,
  equilateralTriangle,
  isoscelesTriangle,
  rightTriangle,
  acuteTriangle,
  obtuseTriangle,
  scaleneTriangle,
  quadrilateral,
  square,
  rectangle,
  rhombus,
  kite,
  parallelogram,
  trapezoid,
  pentagon,
  hexagon,
  septagon,
  octagon,
  isocelesTrapezoid,
  rightTrapezoid,
}

export enum Connective {
  and,
  or
}

export interface Quantity {
  value: number;
  relation: Relation;
}

export enum Relation {
  equal,
  notEqual,
  smaller,
  greater,
  smallerOrEqual,
  greaterOrEqual
}

export enum ObjectType {
  angle,
  polygon,
  segment
}

export interface Evaluation {
  objectType: ObjectType;
  negation: boolean;
  connective: Connective;
}

export interface PolygonEvaluation extends Evaluation {
  area: Quantity;
  perimeter: Quantity;
  type: PolygonType;
  congruent: boolean;
  similar: boolean;
  intersects: boolean;
  contains: boolean;
  outside: boolean;
  inside: boolean;
  hasDiagonal: boolean;
}


export interface SegmentEvaluation extends Evaluation {
  length: Quantity;
  parallel: boolean;
  perpendicular: boolean;
  disjoint: boolean;
  continues: boolean;
  intersects: boolean;
  isDiagonal: boolean;
  contained: boolean;
}

export interface AngleEvaluation extends Evaluation {
  size: Quantity;
  contains: boolean;
}

enum Feedback {
  ignore,
  correct,
  incorrect,
  partial // for external eveluation
}


export function evaluate(state: stt.State, preset: stt.Preset, evaluations: Evaluation[]) {
  const presetPolygon = stt.getPolygons(preset)[0]; // may be undefined
  const presetSegments = stt.getSegments(preset); // may be empty

  const polygonEvaluations = evaluations.filter(e => e.objectType === ObjectType.polygon);
  const polygonFeedbacks = stt.getPolygons(state).map(p => {
    let correct: boolean = undefined;
    polygonEvaluations.forEach(e => {
      const result = evaluatePolygon(p, presetPolygon, <PolygonEvaluation>e);
      correct = accumulateResults(correct, result, e);
    });
    return getFeedback(correct);
  });

  const segmentEvaluations = evaluations.filter(e => e.objectType === ObjectType.polygon);
  const segmentFeedbacks = stt.getSegments(state).map(s => {
    let correct: boolean = undefined;
    segmentEvaluations.forEach(e => {
      const result = evaluateSegment(s, presetSegments, presetPolygon, <SegmentEvaluation>e);
      correct = accumulateResults(correct, result, e);
    });
    return getFeedback(correct);
  });
}

function getFeedback(result: boolean): Feedback {
  return result === undefined ? Feedback.ignore : (result ? Feedback.correct : Feedback.incorrect);
}

function accumulateResults(prev: boolean, added: boolean, evaluation: Evaluation): boolean {
  if (evaluation.negation) {
    added = !added;
  }
  if (prev === undefined) {
    return added;
  } else {
    return evaluation.connective === Connective.and ? prev && added : prev || added;
  }
}

function getPolygonLabelLocation(polygon: geo.Polygon): stt.StatePoint {
  return { x: 0, y: 0 };
}

function evaluatePolygon(pol: geo.Polygon, presetPolygon: geo.Polygon, evaluation: PolygonEvaluation): boolean {
  return false;
}

function evaluateSegment(segment: geo.Segment, presetSegments: geo.Segment[], presetPolygon: geo.Polygon, evealuation: SegmentEvaluation): boolean{
  return false
}

//function evaluateAngle(angle: geo.Angle, presetSegments: geo.Segment[], evealuation: AngleEvaluation): boolean {
//  return false
//}