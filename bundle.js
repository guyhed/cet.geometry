/// <amd-module name='cet.geometry/geo'/>
define("cet.geometry/geo", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _tolerance = 0.000001;
    function simeq(x, y) {
        return Math.abs(x - y) < _tolerance;
    }
    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        static subtruct(pa, pb) {
            return new Point(pa.x - pb.x, pa.y - pb.y);
        }
        static add(pa, pb) {
            return new Point(pa.x + pb.x, pa.y + pb.y);
        }
        static distance(pa, pb) {
            const dp = Point.subtruct(pa, pb);
            return dp.norm();
        }
        static dilate(p, n) {
            return new Point(n * p.x, n * p.y);
        }
        vectorTo(node) {
            return Point.subtruct(node, this);
        }
        norm() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }
        similarTo(p) {
            return simeq(this.x, p.x) && simeq(this.y, p.y);
        }
        cross(node) {
            return this.x * node.y - this.y * node.x;
        }
        dot(node) {
            return this.x * node.x + this.y * node.y;
        }
    }
    exports.Point = Point;
    class Segment {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        vector() {
            return Point.subtruct(this.b, this.a);
        }
        similarTo(segment) {
            return (this.a.similarTo(segment.a) && this.b.similarTo(segment.b))
                || (this.a.similarTo(segment.b) && this.b.similarTo(segment.a));
        }
        hasPoint(point) {
            return simeq(Point.distance(point, this.a) + Point.distance(point, this.b), Point.distance(this.b, this.a));
        }
        getIntersection(seg, allowExternal, alloWColinear) {
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
        getProjection(point) {
            const v = this.vector();
            const u = Point.subtruct(point, this.a);
            const l = v.dot(u) / v.norm();
            return Point.add(this.a, Point.dilate(v, l / v.norm()));
        }
    }
    exports.Segment = Segment;
    class Polygon {
        constructor(vertices) {
            this.vertices = vertices;
            if (this.area() < 0)
                vertices = this.vertices.reverse();
            this.n = vertices.length;
            this.segments = this.vertices.map((v, i) => new Segment(v, vertices[(i + 1) % this.n]));
        }
        isSelfIntersect() {
            for (let i = 0; i < this.n; i++) {
                for (let j = i + 2; j < (i == 0 ? this.n - 1 : this.n); j++) {
                    if (this.segments[i].getIntersection(this.segments[j], false, true)) {
                        return true;
                    }
                }
            }
            return false;
        }
        hasPoint(node) {
            // ray-casting algorithm based on
            // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
            var x = node.x, y = node.y;
            var inside = false;
            for (var i = 0, j = this.n - 1; i < this.n; j = i++) {
                var xi = this.vertices[i].x, yi = this.vertices[i].y;
                var xj = this.vertices[j].x, yj = this.vertices[j].y;
                var intersect = ((yi > y) != (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect)
                    inside = !inside;
            }
            return inside;
        }
        area() {
            var s = 0;
            var nodes = this.vertices;
            for (var i = 0; i < nodes.length; i++) {
                s += nodes[i].cross(nodes[(i + 1) % nodes.length]);
            }
            return -s / 2;
        }
    }
    exports.Polygon = Polygon;
});
/// <amd-module name='cet.geometry/board-segment'/>
/// <reference path ="./jsxgraph/jsx.d.ts"/>
define("cet.geometry/board-segment", ["require", "exports", "cet.geometry/geo", "cet.geometry/board"], function (require, exports, geo, brd) {
    "use strict";
    const Point = geo.Point;
    const Segment = geo.Segment;
    var JXG = window['JXG'];
    class BoardSegment {
        constructor(board, parents) {
            this.isDragged = false;
            this.parents = parents;
            this.board = board;
            const color = parents[0].jsxPoint.getAttribute('strokeColor');
            this.jsxSegment = this.board.jsxBoard.create('segment', parents.map(p => p.jsxPoint), { strokeWidth: 2, strokeColor: color, highlightStrokeColor: color, highlightStrokeOpacity: 0.7 });
            parents.forEach(p => p.addChild(this));
            this.jsxSegment.on('drag', () => this.onDrag());
            this.jsxSegment.on('up', () => this.onUp());
        }
        getSegment() {
            return new Segment(this.parents[0].getPoint(), this.parents[1].getPoint());
        }
        onDown() {
            if (this.board.getMode() === brd.Interaction.deletion) {
                this.board.removeSegment(this);
            }
        }
        onDrag() {
            this.isDragged = true;
            this.parents.forEach(p => p.markClosestGridPoint());
        }
        onUp() {
            if (this.isDragged) {
                this.board.grid.movePointSetToGrid(this.parents);
            }
            this.isDragged = false;
        }
        remove() {
            this.parents.forEach(p => p.removeChild(this));
            this.board.jsxBoard.removeObject(this.jsxSegment);
        }
        setColor(color) {
            this.jsxSegment.setAttribute({
                fillColor: color, strokeColor: color,
                highlightFillColor: color, highlightStrokeColor: color
            });
        }
        sameParents(segment) {
            return (this.parents[0] === segment.parents[1] && this.parents[1] === segment.parents[0]) || (this.parents[0] === segment.parents[0] && this.parents[1] === segment.parents[1]);
        }
    }
    return BoardSegment;
});
/// <amd-module name='cet.geometry/board-utils'/>
define("cet.geometry/board-utils", ["require", "exports", "cet.geometry/geo"], function (require, exports, geo) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Point = geo.Point;
    exports.Segment = geo.Segment;
    // used to locate cycles
    function getPaths(source, sink, visited) {
        if (source === sink)
            return [[sink]];
        const next = source.neighbours.filter(n => !visited.includes(n));
        visited.push(source);
        const paths = next.map(n => this.getPaths(n, sink, visited.slice()))['flat']();
        paths.forEach(a => a.push(source));
        return paths;
    }
    exports.getPaths = getPaths;
    function getMax(ar, calc) {
        let max = Number.NEGATIVE_INFINITY;
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
    exports.getMax = getMax;
});
/// <amd-module name='cet.geometry/board-polygon'/>
/// <reference path ="./jsxgraph/jsx.d.ts"/>
define("cet.geometry/board-polygon", ["require", "exports", "cet.geometry/geo"], function (require, exports, geo) {
    "use strict";
    const Point = geo.Point;
    const Segment = geo.Segment;
    var JXG = window['JXG'];
    class BoardPolygon {
        constructor(board, parents, color) {
            this.isDragged = false;
            this.parents = parents;
            this.board = board;
            this.color = color;
            this.jsxPolygon = this.board.jsxBoard.create('polygon', parents.map(p => p.jsxPoint), { hasInnerPoints: true, fillColor: color, highlightFillColor: color, highlightFillOpacity: 0.7 });
            parents.forEach(p => p.addChild(this));
            this.jsxPolygon.on('drag', () => this.onDrag());
            this.jsxPolygon.on('up', () => this.onUp());
        }
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
    return BoardPolygon;
});
/// <amd-module name='cet.geometry/board-point'/>
define("cet.geometry/board-point", ["require", "exports", "cet.geometry/geo", "cet.geometry/board"], function (require, exports, geo, brd) {
    "use strict";
    const Point = geo.Point;
    const Segment = geo.Segment;
    class BoardPoint {
        constructor(board, initPoint) {
            this.hasMouseDown = false;
            this.children = [];
            this.neighbours = [];
            this.isDropping = false;
            this.board = board;
            this.dropCallback = BoardPoint.prototype.dropCallback.bind(this);
            if (initPoint instanceof Point) {
                this.jsxPoint = board.jsxBoard.create('point', [initPoint.x, initPoint.y], this.getNewPointAttributes());
            }
            else {
                this.jsxPoint = initPoint;
                this.jsxPoint.setAttribute(this.getNewPointAttributes());
            }
            this.setColor("#EC934E");
            this.closestGridPoint = null;
            this.jsxPoint.on('down', () => this.onDown());
            this.jsxPoint.on('drag', () => this.onDrag());
            this.jsxPoint.on('up', () => this.onUp());
        }
        addChild(child) {
            this.children.push(child);
        }
        removeChild(child) {
            this.children.splice(this.children.indexOf(child), 1);
        }
        getNeighbours() {
            this.neighbours = this.children
                .filter(child => child.parents.length == 2 && child.parents.includes(this))
                .map(child => child.parents.find(p => p !== this));
            return this.neighbours;
        }
        markClosestGridPoint() {
            this.closestGridPoint = this.board.grid.markClosestGridPoint(this.getPoint(), this.closestGridPoint);
        }
        moveToClosestGridPoint() {
            this.markClosestGridPoint();
            const translation = Point.subtruct(new Point(this.closestGridPoint.X(), this.closestGridPoint.Y()), this.getPoint());
            this.translate(translation);
        }
        vectorToClosestGridPoint() {
            this.markClosestGridPoint();
            return Point.subtruct(new Point(this.closestGridPoint.X(), this.closestGridPoint.Y()), this.getPoint());
        }
        translate(v) {
            this.isDropping = true;
            this.jsxPoint.moveTo([this.jsxPoint.X() + v.x, this.jsxPoint.Y() + v.y], 100, { callback: this.dropCallback });
        }
        onDown() {
            this.hasMouseDown = true;
            this.setFixed(this.board.getMode() === brd.Interaction.addSegment);
        }
        onDrag() {
            this.markClosestGridPoint();
        }
        onUp() {
            this.moveToClosestGridPoint();
            this.hasMouseDown = false;
        }
        dropCallback() {
            this.isDropping = false;
            this.board.grid.unmarkAllGridPoints();
            this.board.update();
        }
        getPoint() {
            return new Point(this.jsxPoint.X(), this.jsxPoint.Y());
        }
        remove() {
            this.board.jsxBoard.removeObject(this.jsxPoint);
        }
        setColor(color) {
            this.jsxPoint.setAttribute({
                fillColor: color, strokeColor: color,
                highlightFillColor: color, highlightStrokeColor: color
            });
        }
        getColor() {
            return this.jsxPoint.getAttribute('fillColor');
        }
        setFixed(fixed) {
            this.jsxPoint.setAttribute({ fixed });
        }
        getNewPointAttributes() {
            return {
                size: 4, fixed: false, withLabel: false,
                highlightFillOpacity: 0.6
            };
        }
    }
    return BoardPoint;
});
/// <amd-module name='cet.geometry/candidate-point'/>
define("cet.geometry/candidate-point", ["require", "exports", "cet.geometry/geo", "cet.geometry/board"], function (require, exports, geo, brd) {
    "use strict";
    const Point = geo.Point;
    const Segment = geo.Segment;
    class CandidatePoint {
        constructor(board) {
            this.pointerIsOut = false;
            this.gridPoint = null;
            this.segment = null;
            this.board = board;
            this.onMove = CandidatePoint.prototype.onMove.bind(this);
            this.onDown = CandidatePoint.prototype.onDown.bind(this);
            this.board.jsxBoard.on('move', this.onMove);
            this.board.jsxBoard.on('out', event => { this.pointerIsOut = true; console.log('out'); });
            this.board.jsxBoard.on('over', event => { this.pointerIsOut = false; console.log('over'); });
            this.createNewCandidate();
        }
        moveTo(point) {
            this.jsxPoint.moveTo([point.x, point.y]);
        }
        onMove(event) {
            let show = false;
            this.gridPoint = null;
            this.segment = null;
            const coords = this.board.getCoords(event);
            if (this.board.getMode() === brd.Interaction.addSegment && !this.pointerIsOut && event.buttons == 0) {
                const point = new Point(coords[0], coords[1]);
                const gridPoint = this.board.grid.getCloseGridPoint(point);
                if (gridPoint) {
                    this.gridPoint = gridPoint;
                    this.moveTo(gridPoint);
                    show = true;
                }
                const { segments } = this.board.getObjectUnderMouse();
                const projection = segments[0] && segments[0].getSegment().getProjection(point);
                if (projection) {
                    this.segment = segments[0];
                    const gridPointOnSegment = gridPoint && this.segment.getSegment().hasPoint(gridPoint);
                    if (!gridPointOnSegment)
                        this.moveTo(projection);
                    show = true;
                }
            }
            this.setVisible(show);
        }
        setVisible(visible) {
            this.jsxPoint.setAttribute({ visible });
        }
        toPoint() {
            return new Point(this.jsxPoint.X(), this.jsxPoint.Y());
        }
        onDown() {
            const jsxPoint = this.jsxPoint;
            const segment = this.segment;
            this.createNewCandidate();
            this.board.addCandidate(jsxPoint, segment);
        }
        createNewCandidate() {
            if (this.jsxPoint)
                this.jsxPoint.off('down', this.onDown);
            this.segment = null;
            this.gridPoint = null;
            const color = "#EC934E";
            this.jsxPoint = this.board.jsxBoard.create('point', [0, 0], {
                visible: false, size: 5, fixed: false, withLabel: false,
                fillColor: color, strokeColor: color, fillOpacity: 0.6,
                highlightFillColor: color, highlightStrokeColor: color,
                highlightFillOpacity: 0.6
            });
            this.jsxPoint.on('down', this.onDown);
        }
    }
    return CandidatePoint;
});
/// <amd-module name='cet.geometry/board-cycle'/>
define("cet.geometry/board-cycle", ["require", "exports", "cet.geometry/geo", "cet.geometry/board-utils"], function (require, exports, geo, utils) {
    "use strict";
    const Point = geo.Point;
    const Segment = geo.Segment;
    const Polygon = geo.Polygon;
    class BoardCycle {
        constructor(points) {
            this.points = points;
            this.length = points.length;
        }
        getPolygon() {
            return new Polygon(this.points.map(p => p.getPoint()));
        }
        area() {
            return this.getPolygon().area();
        }
        isSelfIntersect() {
            return this.getPolygon().isSelfIntersect();
        }
        shareSegment(cycle) {
            return this.getNumberOfSharedSegments(cycle) > 0;
        }
        hasSamePoints(cycle) {
            return this.length == cycle.length && this.getNumberOfSharedSegments(cycle) == this.length;
        }
        getNumberOfSharedSegments(cycle) {
            const l = this.length;
            let numberOfShared = 0;
            for (let i = 0; i < l; i++) {
                for (let j = 0; j < l; j++) {
                    let pi0 = this.points[i];
                    let pi1 = this.points[(i + 1) % l];
                    let pj0 = cycle.points[j];
                    let pj1 = cycle.points[(j + 1) % l];
                    if ((pi0 === pj0 && pi1 === pj1) || (pi0 === pj1 && pi1 === pj0)) {
                        numberOfShared++;
                    }
                }
            }
            return numberOfShared;
        }
        static getCycles(points) {
            points.forEach(p => p.getNeighbours());
            let cycles = points.map(p => {
                const cycPoints = p.neighbours.map(n => utils.getPaths(n, p, []))['flat']();
                let cycs = cycPoints.map(a => new BoardCycle(a));
                cycs = BoardCycle.cullCycles(cycs.filter(c => !c.isSelfIntersect()));
                return cycs;
            })['flat']();
            cycles = BoardCycle.cullCycles(cycles);
            return cycles;
        }
        static similarCycles(cyc1, cyc2) {
            if (cyc2.length != cyc1.length)
                return false;
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
        static cullCycles(cycles) {
            return cycles.filter((a, index) => {
                return a.points.length > 2 && cycles.slice(0, index).every(c => !BoardCycle.similarCycles(c, a));
            });
        }
        static groupCycles(cycles) {
            const groups = [];
            cycles.forEach(cycle => {
                const matchedGroups = groups.filter(g => g.some(c => cycle.shareSegment(c)));
                if (matchedGroups.length > 0) {
                    for (let i = 1; i < matchedGroups.length; i++) {
                        groups.splice(groups.indexOf(matchedGroups[i]), 1);
                        matchedGroups[0] = matchedGroups[0].concat(matchedGroups[i]);
                    }
                    matchedGroups[0].push(cycle);
                }
                else {
                    groups.push([cycle]);
                }
            });
            return groups;
        }
        static getLargestAreaCycles(cycles) {
            //console.log('cycles', cycles);
            const groups = BoardCycle.groupCycles(cycles);
            const largestCycles = groups.map(g => {
                let largest = null;
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
    return BoardCycle;
});
define("board-grid", ["require", "exports", "cet.geometry/geo", "cet.geometry/board", "cet.geometry/board-utils"], function (require, exports, geo, brd, utils) {
    "use strict";
    const Point = geo.Point;
    const Segment = geo.Segment;
    class BoardGrid {
        constructor(board, jsxBoard, unitLength, width, height, gridType, withSegments) {
            this.jsxPoints = [];
            this.jsxSegments = [];
            this.board = board;
            this.jsxBoard = jsxBoard;
            this.unitLength = unitLength;
            this.drawGrid(width, height, gridType, withSegments);
        }
        drawGrid(width, height, gridType, withSegments) {
            const points = (gridType === brd.GridType.triangular ? BoardGrid.getTriangularGridPoints : BoardGrid.getSquareGridPonts)(this.unitLength, width, height);
            points.forEach(p => this.addGridPoint(p));
            if (withSegments) {
                this.drawGridSegments();
            }
        }
        addGridPoint(p) {
            const gridPointAttr = { size: 3, fixed: true, fillColor: '#ccc', strokeColor: '#ccc', withLabel: false };
            const pt = this.jsxBoard.create('point', [p.x, p.y], gridPointAttr);
            this.jsxPoints.push(pt);
        }
        drawGridSegments() {
            const gridSegmentAttr = { fixed: true, strokeColor: '#ccc', withLabel: false };
            const n = this.jsxPoints.length;
            for (let i = 0; i < n; i++) {
                for (let j = i + 1; j < n; j++) {
                    if (this.areNeightbours(this.jsxPoints[i], this.jsxPoints[j])) {
                        this.jsxSegments.push(this.jsxBoard.create('segment', [this.jsxPoints[i], this.jsxPoints[j]], gridSegmentAttr));
                    }
                }
            }
        }
        areNeightbours(pa, pb) {
            const dx = pa.X() - pb.X();
            const dy = pa.Y() - pb.Y();
            const distance = Math.sqrt(dx * dx + dy * dy);
            return Math.abs(distance / this.unitLength - 1) < 0.0001;
        }
        getCloseGridPoint(point) {
            const { jsxPoint, distance } = this.getClosestJsxGridPoint(point);
            return distance < this.unitLength / 5 ? new Point(jsxPoint.X(), jsxPoint.Y()) : null;
        }
        getClosestJsxGridPoint(point) {
            var minDist = Number.MAX_VALUE;
            var closetPt = null;
            this.jsxPoints.forEach(pt => {
                let d = Point.distance(new Point(pt.X(), pt.Y()), point);
                if (d < minDist) {
                    closetPt = pt;
                    minDist = d;
                }
            });
            return { jsxPoint: closetPt, distance: minDist };
        }
        markClosestGridPoint(p, oldClosest) {
            const { jsxPoint, distance } = this.getClosestJsxGridPoint(p);
            if (oldClosest)
                oldClosest.setAttribute({ fillOpacity: 1, size: 2 });
            if (distance < this.unitLength) {
                jsxPoint.setAttribute({ fillOpacity: 0.5, size: 3 });
            }
            //}
            return jsxPoint;
        }
        unmarkAllGridPoints() {
            this.jsxPoints.forEach(pt => {
                pt.setAttribute({ fillOpacity: 1, size: 2 });
            });
        }
        movePointSetToGrid(points) {
            let translation = new Point(0, 0);
            let prevTranslation = new Point(Number.MAX_VALUE, Number.MAX_VALUE);
            while (!translation.similarTo(prevTranslation)) {
                prevTranslation = translation;
                let vecs = points.map(p => {
                    const newPos = Point.add(p.getPoint(), translation);
                    const gp = this.markClosestGridPoint(newPos, null);
                    return Point.subtruct(new Point(gp.X(), gp.Y()), p.getPoint());
                });
                translation = utils.getMax(vecs, v => v.norm());
            }
            points.forEach(p => p.translate(translation));
        }
        static getSquareGridPonts(unitLength, width, height) {
            const points = [];
            for (let i = 0; i <= height; i++) {
                for (let j = 0; j <= width; j++) {
                    points.push(new Point(j * unitLength, i * unitLength));
                }
            }
            return points;
        }
        static getTriangularGridPoints(unitLength, width, height) {
            const points = [];
            const unitHeight = unitLength * Math.sqrt(3) / 2;
            for (let i = 0; i <= height; i++) {
                let rowWidth = i % 2 == 1 ? width - 1 : width;
                let d = i % 2 == 1 ? unitLength / 2 : 0;
                for (let j = 0; j <= rowWidth; j++) {
                    points.push(new Point(j * unitLength + d, i * unitHeight));
                }
            }
            return points;
        }
    }
    return BoardGrid;
});
/// <amd-module name='cet.geometry/board'/>
/// <reference path ="./jsxgraph/jsx.d.ts"/>
define("cet.geometry/board", ["require", "exports", "cet.geometry/geo", "cet.geometry/board-point", "cet.geometry/candidate-point", "cet.geometry/board-segment", "cet.geometry/board-cycle", "cet.geometry/board-polygon", "board-grid"], function (require, exports, geo, BoardPoint, CandidatePoint, BoardSegment, BoardCycle, BoardPolygon, BoardGrid) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Point = geo.Point;
    exports.Segment = geo.Segment;
    var JXG = window['JXG'];
    var GridType;
    (function (GridType) {
        GridType[GridType["square"] = 0] = "square";
        GridType[GridType["triangular"] = 1] = "triangular";
    })(GridType = exports.GridType || (exports.GridType = {}));
    var Interaction;
    (function (Interaction) {
        Interaction[Interaction["addSegment"] = 0] = "addSegment";
        Interaction[Interaction["text"] = 1] = "text";
        Interaction[Interaction["move"] = 2] = "move";
        Interaction[Interaction["area"] = 3] = "area";
        Interaction[Interaction["draw"] = 4] = "draw";
        Interaction[Interaction["freeMove"] = 5] = "freeMove";
        Interaction[Interaction["deletion"] = 6] = "deletion";
        Interaction[Interaction["clearText"] = 7] = "clearText";
    })(Interaction = exports.Interaction || (exports.Interaction = {}));
    class Board {
        constructor({ element, unitLength = 50, width = 10, height = 10, gridType = GridType.square }) {
            this._points = [];
            this._nextPolygonColorIndex = 0;
            this._polygons = [];
            this._segments = [];
            this._updateFrameId = null;
            const heightRatio = gridType == GridType.triangular ? Math.sqrt(3) / 2 : 1;
            this.width = width * unitLength;
            this.height = height * unitLength * heightRatio;
            this.unitLength = unitLength;
            const marginWidth = 10;
            const boardId = (element.id || 'cetjsx' + (Board._idCounter++)) + "_jsxBoard";
            element.innerHTML = '<div id="' + boardId + '_container" style="width:' + (this.width + 2 * marginWidth) + 'px;height:' + (this.height + 2 * marginWidth) + 'px;position:relative;">'
                + '<div id="' + boardId + '_grid" style="position:absolute;top:0;left:0;bottom:0;right:0;"></div>'
                + '<div id="' + boardId + '" style="position:absolute;top:0;left:0;bottom:0;right:0;"></div>'
                + '</div>';
            this.jsxBoard = JXG.JSXGraph.initBoard(boardId, this.getBoardAttributes(marginWidth));
            this.jsxBoard.on('up', event => this.updateFrame());
            this.jsxBoard.on('move', event => this.redrawPolygons());
            const jsxGridBoard = JXG.JSXGraph.initBoard(boardId + '_grid', this.getBoardAttributes(marginWidth));
            this.grid = new BoardGrid(this, jsxGridBoard, unitLength, width, height, gridType, false);
            this.setMode(Interaction.addSegment);
            this.candidate = new CandidatePoint(this);
        }
        getBoardAttributes(marginWidth) {
            return {
                boundingbox: [-marginWidth, -marginWidth, this.width + marginWidth, this.height + marginWidth],
                keepaspectratio: true, axis: false, grid: false, showNavigation: false, showCopyright: false,
                pan: { enable: false }
            };
        }
        setMode(mode) {
            this._mode = mode;
            if (mode !== Interaction.addSegment && this.candidate) {
                this.jsxBoard.removeObject(this.candidate);
                this.candidate = null;
            }
            this._points.forEach(p => p.setFixed(mode === Interaction.addSegment));
        }
        getMode() {
            return this._mode;
        }
        getObjectUnderMouse() {
            const ids = [];
            for (let id in this.jsxBoard.highlightedObjects)
                ids.push(id);
            const points = this._points.filter(p => ids.includes(p.jsxPoint.id));
            const segments = this._segments.filter(s => ids.includes(s.jsxSegment.id));
            const polygons = this._polygons.filter(pol => ids.includes(pol.jsxPolygon.id));
            return { points, segments, polygons };
        }
        getCoords(event) {
            return this.jsxBoard.getUsrCoordsOfMouse(event);
        }
        addCandidate(jsxPoint, segment) {
            const point = new exports.Point(jsxPoint.X(), jsxPoint.Y());
            const boardPoint = this.getBoardPoint(point);
            const currentPoint = this.addPoint(jsxPoint, null);
            if (boardPoint) {
                this.addSegment(currentPoint, boardPoint);
            }
            else if (segment) {
                const parents = segment.parents.slice();
                this.removeSegment(segment);
                parents.forEach(p => this.addSegment(currentPoint, p));
            }
            else {
                const newPoint = this.addPoint(point, null);
                this.addSegment(currentPoint, newPoint);
                //console.log('down', boardPoint.jsxPoint.id, newPoint.jsxPoint.id, Date.now());
            }
            return currentPoint;
        }
        getBoardPoint(point) {
            const boardPoint = this._points.find(p => {
                return exports.Point.distance(p.getPoint(), point) < this.unitLength / 20;
            });
            return boardPoint;
        }
        getBoardSegment(point) {
            const boardSegment = this._segments.find(s => {
                return s.getSegment().hasPoint(point);
            });
            return boardSegment;
        }
        addPoint(p, color) {
            const point = new BoardPoint(this, p);
            if (color)
                point.setColor(color);
            this._points.push(point);
            return point;
        }
        removePoint(pt) {
            this._points.splice(this._points.indexOf(pt), 1);
            pt.remove();
        }
        replacePointsInSegments(fromPoint, toPoint) {
            const oldSegs = this._segments.filter(s => s.parents.includes(fromPoint));
            oldSegs.forEach(s => this.replaceSegmentParent(s, fromPoint, toPoint));
        }
        replacePointsInOneSegment(fromPoint, toPoint) {
            const segment = this._segments.find(s => s.parents.includes(fromPoint));
            if (segment) {
                this.replaceSegmentParent(segment, fromPoint, toPoint);
            }
        }
        replaceSegmentParent(segment, fromPoint, toPoint) {
            const i = segment.parents.indexOf(fromPoint);
            const parents = segment.parents.slice();
            this.removeSegment(segment);
            parents[i] = toPoint;
            let newSegment = null;
            if (parents[0] !== parents[1]) {
                newSegment = this.addSegment(parents[0], parents[1]);
                this.removeDuplicateSegment(newSegment);
            }
        }
        redrawPolygons() {
            const cycles = BoardCycle.getLargestAreaCycles(BoardCycle.getCycles(this._points));
            const colors = cycles.map(cycle => {
                const polygon = this._polygons.find(pol => cycle.hasSamePoints(new BoardCycle(pol.parents)));
                return polygon ? polygon.color : null;
            });
            this._polygons.slice().forEach(p => this.removePolygon(p));
            cycles.forEach((c, i) => this.addPolygon(c, colors[i]));
        }
        getNextColor() {
            const color = Board.polygonColors[this._nextPolygonColorIndex];
            this._nextPolygonColorIndex = (this._nextPolygonColorIndex + 1) % Board.polygonColors.length;
            return color;
        }
        addPolygon(cycle, color = null) {
            color = color || this.getNextColor();
            const pol = new BoardPolygon(this, cycle.points, color);
            this._polygons.push(pol);
            return pol;
        }
        removePolygon(pol) {
            this._polygons.splice(this._polygons.indexOf(pol), 1);
            pol.remove();
        }
        addSegment(ptA, ptB) {
            const seg = new BoardSegment(this, [ptA, ptB]);
            this._segments.push(seg);
            return seg;
        }
        removeSegment(seg) {
            this._segments.splice(this._segments.indexOf(seg), 1);
            seg.remove();
        }
        removeDuplicatePoint(boardPoint) {
            var simPoint = this.findTweenPoint(boardPoint);
            if (simPoint && !simPoint.hasMouseDown) {
                this.replacePointsInSegments(boardPoint, simPoint);
            }
        }
        removeFlatAngles(boardPoint) {
            const neighbours = boardPoint.getNeighbours();
            if (neighbours.length == 2) {
                const p = boardPoint.getPoint();
                const seg = new exports.Segment(neighbours[0].getPoint(), neighbours[1].getPoint());
                if (seg.hasPoint(p)) {
                    boardPoint.children.slice().forEach(s => this.removeSegment(s));
                    this.removePoint(boardPoint);
                    this.addSegment(neighbours[0], neighbours[1]);
                }
            }
        }
        findTweenPoint(boardPoint) {
            var point = boardPoint.getPoint();
            var simPoint = this._points.find(p => boardPoint !== p && exports.Point.distance(point, p.getPoint()) < this.unitLength / 5);
            return simPoint;
        }
        updateFrame() {
            if (!this._updateFrameId) {
                this._updateFrameId = requestAnimationFrame(() => {
                    this.update();
                    this._updateFrameId = null;
                });
            }
        }
        update() {
            //console.log('before: points', this._points, 'segments', this._segments);
            if (!this._points.some(p => p.isDropping)) {
                this._points.slice().forEach(p => !p.hasMouseDown && this.removeFlatAngles(p));
                this._segments.slice().forEach(s => this.removeDuplicateSegment(s));
                this._points.slice().forEach(p => !p.hasMouseDown && this.removeDuplicatePoint(p));
                this._points.slice().forEach(p => this.removeIfChildless(p));
            }
            this.redrawPolygons();
            //console.log('after: points', this._points, 'segments', this._segments);
        }
        removeDuplicateSegment(segment) {
            if (this._segments.some(s => s !== segment && s.sameParents(segment))) {
                this.removeSegment(segment);
            }
        }
        removeIfChildless(p) {
            if (!this._segments.some(s => s.parents.includes(p))) {
                this.removePoint(p);
                return true;
            }
            return false;
        }
    }
    exports.Board = Board;
    Board._idCounter = 0;
    Board.polygonColors = ['blue', 'green', 'orange', 'cyan', 'yellow'];
});
//# sourceMappingURL=bundle.js.map