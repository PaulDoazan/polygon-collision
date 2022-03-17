let side = 29;
let colors = ["#063e7b", "#ececd1", "#f0ce57", "#f45a3c", "#f09548"]
let maxCount = 120;
let strStyle = 1;

export default function polygon(polygon, stage, newProjected) {
    let poly = polygon;
    let gr = new createjs.Graphics();
    let sh = new createjs.Shape(gr);

    let strokeColor = 'rgba(0,0,0,0.5)';

    // let fillColor = colors[getRandomIntInclusive(0, colors.length - 1)];
    let fillColor = polygon.color;
    if (strStyle) {
        gr.setStrokeStyle(strStyle);
        gr.beginStroke(fillColor);
    }
    gr.beginFill(fillColor);
    gr.moveTo(poly.coords[0].x, poly.coords[0].y);

    poly.coords.map((coord, index) => {
        if (index > 0) {
            gr.lineTo(coord.x, coord.y);
        }
    })

    sh.on('tick', updateShape)
    sh.side = side;

    if (newProjected) {
        let reversed = [];
        poly.coords.map((coord, index) => {
            if (index > 0) {
                reversed.push({coords:{ x: coord.x, y: coord.y }});
            }
        })
        reversed.push({coords:{ x: poly.coords[0].x, y: poly.coords[0].y }});

        let random = getRandomIntInclusive(50, 200);
        let angle = getRandomIntInclusive(0, 314);

        reversed.map((r) => {
            r.coords.x += Math.cos(angle / 100) * random;
            r.coords.y += Math.sin(angle / 100) * random;
        })
        sh.updated = reversed;
    } else {
        sh.projected = poly;
    }

    sh.poly = poly;
    sh.fillColor = sh.color = fillColor;
    sh.strokeColor = strokeColor;
    sh.unit = 1;

    stage.on('targetDown', (e) => {
        onTargetDown(e, sh);
    })

    stage.on('targetMove', (e) => {
        onTargetMove(e, sh)
    })

    stage.on('targetUp', (e) => {
        onTargetUp(e, sh);
    })

    return sh;
}

function onTargetDown(e, sh) {
    //detectCollision(e, sh);
}

function onTargetMove(e, sh) {
    detectCollision(e, sh);
}

function onTargetUp(e, sh) {
    sh.count = 0;
    //if (sh.projected && sh.projected[0].x !== sh.coords[0].y && sh.projected[0].y !== sh.coords[0].y) sh.count = 0;
    sh.projected = {coords: sh.coords};
    sh.fillColor = sh.color;
}

function updateShape(e) {
    let tg = e.currentTarget;
    let g = tg.graphics;

    if (tg.projected) {
        if (tg.count < maxCount) {
            tg.count++;
            let factor = easeOutQuint(tg.count / maxCount);
            let starting;

            if (tg.updated) {
                starting = tg.updated;
            } else {
                starting = tg.poly;
            }

            tg.interCoords = [];

            tg.projected.coords.map((projectedCoord, i) => {
                tg.interCoords.push({ x: starting.coords[i].x + (projectedCoord.x - starting.coords[i].x) * factor, y: starting.coords[i].y + (projectedCoord.y - starting.coords[i].y) * factor });
            })

            g.clear();
            g.setStrokeStyle(strStyle);
            g.beginStroke(tg.fillColor);
            g.beginFill(tg.fillColor);
            g.moveTo(tg.interCoords[0].x, tg.interCoords[0].y);

            tg.interCoords.map((c, index) => {
                if (index > 0) {
                    g.lineTo(c.x, c.y);
                }
            })
        } else {
            tg.updated = tg.projected;
            tg.projected = tg.interCoords = null;
            tg.count = 0;
        }
    }
}

function detectCollision(e, sh) {
    let current;
    if (sh.interCoords) {
        current.coords = sh.interCoords;
        sh.updated.coords = sh.interCoords;
        sh.count = 0;
    } else if (sh.updated) {
        current = sh.updated;
    } else {
        current = sh.poly;
    }
    // if the distance is less than the sum of the circle's
    // radii, the circles are touching!

    let collision = polygonCircle(current.coords, e.coords.x, e.coords.y, e.radius);
    if (collision) {
        let dx = e.coords.x - (collision.x);
        let dy = e.coords.y - (collision.y);
        let distance = Math.sqrt((dx * dx) + (dy * dy));

        // projection
        let projected = {coords: []};
        let projectionRadius = 30 * (1 + 5 * e.speed);
        let random = getRandomIntInclusive(5, 10);
        let unit = getRandomIntInclusive(0, 1);

        let randomAngle = unit ? (Math.PI / 4) * (random / 10) : -(Math.PI / 4) * (random / 10)
        let angle = e.angle + randomAngle;

        let springBackX = Math.cos(e.angle) * (e.radius - distance) * 2;
        let springBackY = Math.sin(e.angle) * (e.radius - distance) * 2;

        let springedBack = {coords: []};

        current.coords.map((coord) => {
            springedBack.coords.push( { x: coord.x + springBackX, y: coord.y + springBackY });
        })

        sh.updated = springedBack;

        //rotation
        let center = get_polygon_centroid(current.coords);
        let ccx = center.x - (collision.x);
        let ccy = center.y - (collision.y);

        let angleCollisionCenter = Math.atan2(ccy, ccx);
        let diffAngle = e.angle - angleCollisionCenter;

        current.coords.map((coord) => {
            let newCoord = { x: coord.x + springBackX + Math.cos(angle) * projectionRadius, y: coord.y + springBackY + Math.sin(angle) * projectionRadius };
            newCoord = rotate(center, newCoord, diffAngle)
            projected.coords.push(newCoord);
        })

        let reversed = projected.coords.splice(0, 1);
        projected.coords.push(reversed[0]);
        sh.projected = projected;
        sh.count = 0;
    }
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function easeOutQuint(x) {
    return 1 - Math.pow(1 - x, 5);
}

function polygonCircle(vertices, cx, cy, r) {

    // go through each of the vertices, plus
    // the next vertex in the list
    let next = 0;
    for (let current = 0; current < vertices.length; current++) {

        // get next vertex in list
        // if we've hit the end, wrap around to 0
        next = current + 1;
        if (next == vertices.length) next = 0;

        // get the PVectors at our current position
        // this makes our if statement a little cleaner
        let vc = vertices[current];    // c for "current"
        let vn = vertices[next];       // n for "next"

        // check for collision between the circle and
        // a line formed between the two vertices
        let collision = lineCircle(vc.x, vc.y, vn.x, vn.y, cx, cy, r);
        if (collision) return collision;
    }

    // the above algorithm only checks if the circle
    // is touching the edges of the polygon – in most
    // cases this is enough, but you can un-comment the
    // following code to also test if the center of the
    // circle is inside the polygon

    let centerInside = polygonPoint(vertices, cx, cy);
    if (centerInside) return centerInside;

    // otherwise, after all that, return false
    return false;
}

function polygonPoint(vertices, px, py) {
    let collision = false;

    // go through each of the vertices, plus
    // the next vertex in the list
    let next = 0;
    for (let current = 0; current < vertices.length; current++) {

        // get next vertex in list
        // if we've hit the end, wrap around to 0
        next = current + 1;
        if (next == vertices.length) next = 0;

        // get the PVectors at our current position
        // this makes our if statement a little cleaner
        let vc = vertices[current];    // c for "current"
        let vn = vertices[next];       // n for "next"

        // compare position, flip 'collision' variable
        // back and forth
        if (((vc.y >= py && vn.y < py) || (vc.y < py && vn.y >= py)) &&
            (px < (vn.x - vc.x) * (py - vc.y) / (vn.y - vc.y) + vc.x)) {
            collision = !collision;
        }
    }
    if (collision) {
        let closest = closestPointInPolygon(vertices, px, py);
        return { x: closest.x, y: closest.y, inside: true }
    } else {
        return false;
    }
}

function closestPointInPolygon(vertices, px, py) {
    let previousDistance;
    let closest;
    for (let current = 0; current < vertices.length; current++) {

        // get next vertex in list
        // if we've hit the end, wrap around to 0
        let next = current + 1;
        if (next == vertices.length) next = 0;

        let vc = vertices[current];    // c for "current"
        let vn = vertices[next];       // n for "next"

        //let distance = linePoint(vc.x, vc.y, vn.x, vn.y, px, py);
        let distX = vc.x - vn.x;
        let distY = vc.y - vn.y;
        let distance = Math.sqrt((distX * distX) + (distY * distY));

        let dot = (((px - vc.x) * (vn.x - vc.x)) + ((py - vc.y) * (vn.y - vc.y))) / Math.pow(distance, 2);

        let closestX = vc.x + (dot * (vn.x - vc.x));
        let closestY = vc.y + (dot * (vn.y - vc.y));

        let dx = px - closestX;
        let dy = py - closestY;
        let dp = Math.sqrt((dx * dx) + (dy * dy));

        if (previousDistance) {
            if (dp < previousDistance) {
                closest = { x: closestX, y: closestY };
            }
        } else {
            closest = { x: closestX, y: closestY };
        }
        previousDistance = dp;
    }

    return closest;

}

function lineCircle(x1, y1, x2, y2, cx, cy, r) {

    // is either end INSIDE the circle?
    // if so, return true immediately
    let inside1 = pointCircle(x1, y1, cx, cy, r);
    let inside2 = pointCircle(x2, y2, cx, cy, r);
    if (inside1) {
        return { x: x1, y: y1, inside: true };
    } else if (inside2) {
        return { x: x2, y: y2, inside: true };
    }

    // get length of the line
    let distX = x1 - x2;
    let distY = y1 - y2;
    let len = Math.sqrt((distX * distX) + (distY * distY));

    // get dot product of the line and circle
    let dot = (((cx - x1) * (x2 - x1)) + ((cy - y1) * (y2 - y1))) / Math.pow(len, 2);

    // find the closest point on the line
    let closestX = x1 + (dot * (x2 - x1));
    let closestY = y1 + (dot * (y2 - y1));

    // is this point actually on the line segment?
    // if so keep going, but if not, return false
    let onSegment = linePoint(x1, y1, x2, y2, closestX, closestY);
    if (!onSegment) return false;


    // get distance to closest point
    distX = closestX - cx;
    distY = closestY - cy;
    let distance = Math.sqrt((distX * distX) + (distY * distY));

    if (distance <= r) {
        return { x: closestX, y: closestY, inside: true };
    }
    return false;
}

function pointCircle(px, py, cx, cy, r) {

    // get distance between the point and circle's center
    // using the Pythagorean Theorem
    let distX = px - cx;
    let distY = py - cy;
    let distance = Math.sqrt((distX * distX) + (distY * distY));

    // if the distance is less than the circle's
    // radius the point is inside!
    if (distance <= r) {
        return { x: px, y: py };
    }
    return false;
}

function linePoint(x1, y1, x2, y2, px, py) {

    // get distance from the point to the two ends of the line
    let d1 = dist(px, py, x1, y1);
    let d2 = dist(px, py, x2, y2);

    // get the length of the line
    let lineLen = dist(x1, y1, x2, y2);

    // since floats are so minutely accurate, add
    // a little buffer zone that will give collision
    let buffer = 0.1;    // higher # = less accurate

    // if the two distances are equal to the line's
    // length, the point is on the line!
    // note we use the buffer here to give a range,
    // rather than one #
    if (d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer) {
        return lineLen;
    }
    return false;
}

function dist(x1, y1, x2, y2) {
    let distX = x1 - x2;
    let distY = y1 - y2;
    return Math.sqrt((distX * distX) + (distY * distY));
}

function get_polygon_centroid(array) {
    let pts = [...array]
    let first = pts[0], last = pts[pts.length - 1];
    if (first.x != last.x || first.y != last.y) pts.push(first);
    let twicearea = 0,
        x = 0, y = 0,
        nPts = pts.length,
        p1, p2, f;
    for (let i = 0, j = nPts - 1; i < nPts; j = i++) {
        p1 = pts[i]; p2 = pts[j];
        f = p1.x * p2.y - p2.x * p1.y;
        twicearea += f;
        x += (p1.x + p2.x) * f;
        y += (p1.y + p2.y) * f;
    }
    f = twicearea * 3;
    return { x: x / f, y: y / f };
}

function rotate(center, point, angle) {
    let cos = Math.cos(angle),
        sin = Math.sin(angle),
        nx = (cos * (point.x - center.x)) + (sin * (point.y - center.y)) + center.x,
        ny = (cos * (point.y - center.y)) - (sin * (point.x - center.x)) + center.y;
    return { x: nx, y: ny };
}