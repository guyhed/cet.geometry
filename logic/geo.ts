/// <amd-module name='cet.geometry/logic/geo'/>

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
  static _origin = new Point(0, 0);
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
  static rotate(point: Point, degrees: number, pivot: Point = Point._origin): Point {
    const angle = degrees * Math.PI / 180;
    const sin = Math.sin(angle), cos = Math.cos(angle);
    const vec = pivot.vectorTo(point);
    return new Point(cos * point.x - sin * point.y, sin * point.x + cos * point.y);
  }
  vectorTo(node: Point): Point {
    return Point.subtruct(node, this);
  }
  norm(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  equals(p: Point) {
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
    return (this.a.equals(segment.a) && this.b.equals(segment.b))
      || (this.a.equals(segment.b) && this.b.equals(segment.a));
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
    return Point.add(this.a, Point.dilate(v, l));
  }
}

export class Polygon {
  vertices: Point[];
  segments: Segment[];
  constructor(vertices: Point[]) {
    this.vertices = vertices;
    const n = vertices.length;
    this.segments = this.vertices.map((v, i) => new Segment(v, vertices[(i + 1) % n]));
  }

  length(): number {
    return this.vertices.length;
  }

  isSelfIntersect(): boolean {
    const n = this.length();
    for (let i = 0; i < n; i++) {
      for (let j = i + 2; j < (i == 0 ? n - 1 : n); j++) {
        if (this.segments[i].getIntersection(this.segments[j], false, true)) {
          return true;
        }
      }
    }
    return false;
  }

  hasPoint(point: Point): boolean {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    const { x, y } = point;
    const n = this.length();

    let inside = false;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      let xi = this.vertices[i].x, yi = this.vertices[i].y;
      let xj = this.vertices[j].x, yj = this.vertices[j].y;

      let intersect = ((yi > y) != (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  }

  signedArea(): number {
    var s = 0;
    var nodes = this.vertices;
    for (var i = 0; i < nodes.length; i++) {
      s += nodes[i].cross(nodes[(i + 1) % nodes.length]);
    }
    return -s / 2;
  }

  area() {
    return Math.abs(this.signedArea());
  }
}

export class Angle {
  p1: Point;
  pivot: Point;
  p2: Point
  public constructor(a: Segment, b: Segment) {
    this.getPoints(a, b);
  }

  getPoints(seg1: Segment, seg2: Segment) {
    if (seg1.a.equals(seg2.a)) {
      this.p1 = seg1.b;
      this.pivot = seg1.a;
      this.p2 = seg2.b;
    } else if (seg1.a.equals(seg2.b)) {
      this.p1 = seg1.b;
      this.pivot = seg1.a;
      this.p2 = seg2.a;
    } else if (seg1.b.equals(seg2.b)) {
      this.p1 = seg1.a;
      this.pivot = seg1.b;
      this.p2 = seg2.a;
    } else if (seg1.b.equals(seg2.a)) {
      this.p1 = seg1.a;
      this.pivot = seg1.b;
      this.p2 = seg2.b;
    } else {
      this.pivot = null;
    }
  }

  isValid(): boolean {
    return !!this.pivot;
  }

  static angleByNodes(p1: Point, pivot: Point, p2: Point, direction: number): number {
    if (direction == 0) throw ("direction cannot be zero");
    var vp1 = pivot.vectorTo(p1);
    var vp2 = pivot.vectorTo(p2);
    var cos = vp1.dot(vp2) / (vp1.norm() * vp2.norm());
    var angle = Math.acos(cos);
    if (vp1.cross(vp2) * direction < 0) {
      angle = 2 * Math.PI - angle;
    }
    return angle * 180 / Math.PI;
  }

  angleSize() {
    return Angle.angleByNodes(this.p1, this.pivot, this.p2, 1);
  }

  size(): number {
    var size = this.angleSize();
    if (size > 180) {
      size = 360 - size;
    }
    return size;
  }

}


