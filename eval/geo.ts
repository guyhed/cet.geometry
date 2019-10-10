/// <amd-module name='cet.geometry/eval/geo'/>

var _tolerance = 0.000001;
function simeq(x, y): boolean {
  return Math.abs(x - y) < _tolerance;
}

export class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  static subtruct(pa: Point, pb: Point): Point {
    return new Point(pa.x - pb.x, pa.y - pb.y);
  }
  static add(pa: Point, pb: Point): Point {
    return new Point(pa.x + pb.x, pa.y + pb.y);
  }
  static distance(pa: Point, pb: Point): number {
    const dp = Point.subtruct(pa, pb);
    return dp.norm();
  }
  static dilate(p: Point, n: number) {
    return new Point(n * p.x, n * p.y);
  }
  vectorTo(node: Point): Point {
    return Point.subtruct(node, this);
  }
  norm(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  similarTo(p: Point) {
    return simeq(this.x, p.x) && simeq(this.y, p.y);
  }
  cross(node: Point): number {
    return this.x * node.y - this.y * node.x;
  }
  dot(node: Point): number {
    return this.x * node.x + this.y * node.y;
  }
}

export class Segment {
  a: Point;
  b: Point;
  constructor(a: Point, b: Point) {
    this.a = a;
    this.b = b;
  }

  vector() {
    return Point.subtruct(this.b, this.a);
  }

  similarTo(segment: Segment): boolean {
    return (this.a.similarTo(segment.a) && this.b.similarTo(segment.b))
      || (this.a.similarTo(segment.b) && this.b.similarTo(segment.a));
  }

  hasPoint(point: Point) {
    return simeq(Point.distance(point, this.a) + Point.distance(point, this.b), Point.distance(this.b, this.a));
  }

  getIntersection(seg: Segment, allowExternal: boolean, alloWColinear: boolean): Point {
    // https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
    // solve p + s u = q + t v
    // by cross product with u, and cross product with v.
    var p = this.a;
    var u = this.vector();
    var q = seg.a;
    var v = seg.vector();
    var v_cross_u = v.cross(u);
    var p_minus_q = q.vectorTo(p);
    if (simeq(v_cross_u, 0)) {
      // segments are parallel or colinear
      if (!alloWColinear) {
        return null;
      }
      return this.hasPoint(seg.a) ? seg.a :
        this.hasPoint(seg.b) ? seg.b :
          seg.hasPoint(this.a) ? this.a :
            seg.hasPoint(this.b) ? this.b :
              null;
    }
    var s = p_minus_q.cross(u) / v_cross_u;
    var t = p_minus_q.cross(v) / v_cross_u;
    if (!allowExternal && (t < 0 || t > 1 || s < 0 || s > 1)) {
      return null;
    }
    return new Point(p.x + s * u.x, p.y + s * u.y);
  }

  getProjection(point: Point, allowOutside: boolean = false) {
    const v = this.vector();
    const u = Point.subtruct(point, this.a);
    const vnorm = v.norm();
    const l = v.dot(u) / (vnorm * vnorm);
    if (!allowOutside && (l < 0 || l > 1)) {
      return null;
    }
    return Point.add(this.a, Point.dilate(v, l ));
  }
}

export class Polygon {
  vertices: Point[];
  segments: Segment[];
  n: number;
  constructor(vertices: Point[]) {
    this.vertices = vertices;
    if (this.area() < 0) vertices = this.vertices.reverse();
    this.n = vertices.length;
    this.segments = this.vertices.map((v, i) => new Segment(v, vertices[(i + 1) % this.n]));
  }

  isSelfIntersect(): boolean {
    for (let i = 0; i < this.n; i++) {
      for (let j = i + 2; j < (i == 0 ? this.n - 1 : this.n); j++) {
        if (this.segments[i].getIntersection(this.segments[j], false, true)) {
          return true;
        }
      }
    }
    return false;
  }

  hasPoint(node: Point): boolean {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = node.x, y = node.y;

    var inside = false;
    for (var i = 0, j = this.n - 1; i < this.n; j = i++) {
      var xi = this.vertices[i].x, yi = this.vertices[i].y;
      var xj = this.vertices[j].x, yj = this.vertices[j].y;

      var intersect = ((yi > y) != (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  }

  area(): number { // signed
    var s = 0;
    var nodes = this.vertices;
    for (var i = 0; i < nodes.length; i++) {
      s += nodes[i].cross(nodes[(i + 1) % nodes.length]);
    }
    return -s / 2;
  }
}


