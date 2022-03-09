let side = 29;
let colors = ["#063e7b", "#ececd1", "#f0ce57", "#f45a3c", "#f09548"]
let maxCount = 120;

export default function polygon(coords, stage) {
    let gr = new createjs.Graphics();
    let sh = new createjs.Shape(gr);

    let strokeColor = 'rgba(0,0,0,0.5)';

    let fillColor = colors[getRandomIntInclusive(0, colors.length - 1)];
    gr.beginFill(fillColor);
    gr.moveTo(coords[0].x, coords[0].y);

    coords.map((coord, index) => {
        if (index > 0) {
            gr.lineTo(coord.x, coord.y);
        }
    })

    sh.on('tick', updateShape)
    sh.side = side;
    sh.coords = coords;
    sh.fillColor = fillColor;
    sh.strokeColor = strokeColor;
    sh.pace = getRandomIntInclusive(1, 4);
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
    //sh.count = 0;
}

function onTargetMove(e, sh) {
    detectCollision(e, sh);
}

function onTargetUp(e, sh) {
    if (sh.projectedCoords && sh.projectedCoords[0].x !== sh.coords[0].y && sh.projectedCoords[0].y !== sh.coords[0].y) sh.count = 0;
    sh.projectedCoords = sh.coords;
}

function updateShape(e) {
    let tg = e.currentTarget;
    let g = tg.graphics;

    if (tg.projectedCoords) {
        if (tg.count < maxCount) {
            tg.count++;
            let factor = easeOutQuint(tg.count / maxCount);
            let startingCoords;

            if (tg.updatedCoords) {
                startingCoords = tg.updatedCoords;
            } else {
                startingCoords = tg.coords;
            }

            tg.interCoords = [];

            tg.projectedCoords.map((projected, i) => {
                tg.interCoords.push({ x: startingCoords[i].x + (projected.x - startingCoords[i].x) * factor, y: startingCoords[i].y + (projected.y - startingCoords[i].y) * factor });
            })

            g.clear();
            g.beginFill(tg.fillColor);
            g.moveTo(tg.interCoords[0].x, tg.interCoords[0].y);

            tg.interCoords.map((c, index) => {
                if (index > 0) {
                    g.lineTo(c.x, c.y);
                }
            })
        } else {
            tg.updatedCoords = tg.projectedCoords;
            tg.projectedCoords = tg.interCoords = null;
            tg.count = 0;
        }
    }
}

function detectCollision(e, sh) {
    let currentCoords;
    if (sh.interCoords) {
        currentCoords = sh.interCoords;
        sh.updatedCoords = sh.interCoords;
        sh.count = 0;
    } else if (sh.updatedCoords) {
        currentCoords = sh.updatedCoords;
    } else {
        currentCoords = sh.coords;
    }
    // if the distance is less than the sum of the circle's
    // radii, the circles are touching!

    let collision = polygonCircle(currentCoords, e.coords.x, e.coords.y, e.radius);
    if (collision) {
        let dx = e.coords.x - (collision.x);
        let dy = e.coords.y - (collision.y);
        let distance = Math.sqrt((dx * dx) + (dy * dy));

        // INSIDE ?????
        let angle = collision.inside ? -Math.atan2(dy, dx) : e.angle;
        if (collision.inside) {
            /*let gr = new createjs.Graphics();
            let sha = new createjs.Shape(gr);

            gr.beginFill('blue');
            gr.drawCircle(collision.x, collision.y, 5);

            sh.parent.addChild(sha);*/

            //angle += Math.PI
        }

        let projectedCoords = [];

        let radius = e.radius * (1 + 5 * e.speed);

        currentCoords.map((coord) => {
            projectedCoords.push({ x: coord.x + Math.cos(e.angle) * radius, y: coord.y + Math.sin(e.angle) * radius })
        })

        sh.projectedCoords = projectedCoords
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
        return { x: x1, y: y1 };
    } else if (inside2) {
        return { x: x2, y: y2 };
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
        return { x: closestX, y: closestY };
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