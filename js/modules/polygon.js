let side = 24;
let colors = ["#063e7b", "#ececd1", "#f0ce57", "#f45a3c", "#f09548"]
let targetMoving = false;
let maxCount = 120;

export default function polygon(coords, stage) {
    let gr = new createjs.Graphics();
    let sh = new createjs.Shape(gr);

    let strokeColor = 'rgba(0,0,0,0.5)';

    let fillColor = colors[getRandomIntInclusive(0, colors.length - 1)];
    gr.beginFill(fillColor);
    //gr.drawRect(coords.x - side / 2, coords.y - side / 2, side, side);
    gr.moveTo(coords[0].x, coords[0].y);

    coords.map((coord, index)=>{
        if(index > 0){
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
        onTargetDown();
    })

    stage.on('targetMove', (e) => {
        onTargetMove(e, sh)
    })

    stage.on('targetUp', (e) => {
        onTargetUp(e, sh);
        targetMoving = false;
    })

    return sh;
}

function onTargetDown(e) {
    targetMoving = true;
}

function onTargetMove(e, sh) {
    detectCollision(e, sh);
}

function onTargetUp(e, sh) {
    targetMoving = false;
    sh.count = 0;
}

function updateShape(e) {
    let tg = e.currentTarget;
    let g = tg.graphics;

    if (targetMoving) {
        if (tg.provisoryCoords) {
            g.clear();
            g.beginFill(tg.fillColor);
            g.drawRect(tg.provisoryCoords.x - side / 2, tg.provisoryCoords.y - side / 2, tg.side, tg.side);
        }
    } else {
        if (tg.provisoryCoords) {
            if (tg.count < maxCount) {
                tg.count++;
                let factor = easeOutQuint(tg.count / maxCount);

                let interCoordX = tg.provisoryCoords.x + (tg.coords.x - tg.provisoryCoords.x) * factor;
                let interCoordY = tg.provisoryCoords.y + (tg.coords.y - tg.provisoryCoords.y) * factor;

                g.clear();
                g.beginFill(tg.fillColor);
                g.drawRect(interCoordX - side / 2, interCoordY - side / 2, tg.side, tg.side);
            } else {
                tg.provisoryCoords = null;
                tg.count = 0;
            }
        }
    }
}

function detectCollision(e, sh) {
    let currentCoords;
    if (sh.provisoryCoords) {
        currentCoords = sh.provisoryCoords;
    } else {
        currentCoords = sh.coords;
    }
    // if the distance is less than the sum of the circle's
    // radii, the circles are touching!

    let collision = polyCircle(currentCoords, e.coords.x, e.coords.y, e.radius);
    if (collision) {
        let dx = e.coords.x - (collision.x);
        let dy = e.coords.y - (collision.y);

        let angle = Math.atan2(dy, dx);
        let provisoryCoords = [];
        // WIP move polygon redrawing graphics lineTo ???
        sh.coords.map((coord)=>{
            provisoryCoords.push({x: e.coords.x - Math.cos(angle) * e.radius - side / 2 ,y: e.coords.y - Math.sin(angle) * e.radius - side / 2})
        })
        sh.provisoryCoords = { x: e.coords.x - Math.cos(angle) * e.radius, y: e.coords.y - Math.sin(angle) * e.radius }
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

function polyCircle(vertices, cx, cy, r) {

    // go through each of the vertices, plus
    // the next vertex in the list
    let next = 0;
    for (let current=0; current<vertices.length; current++) {
  
      // get next vertex in list
      // if we've hit the end, wrap around to 0
      next = current+1;
      if (next == vertices.length) next = 0;
  
      // get the PVectors at our current position
      // this makes our if statement a little cleaner
      let vc = vertices[current];    // c for "current"
      let vn = vertices[next];       // n for "next"
  
      // check for collision between the circle and
      // a line formed between the two vertices
      let collision = lineCircle(vc.x,vc.y, vn.x,vn.y, cx,cy,r);
      if (collision) return collision;
    }
  
    // the above algorithm only checks if the circle
    // is touching the edges of the polygon – in most
    // cases this is enough, but you can un-comment the
    // following code to also test if the center of the
    // circle is inside the polygon
  
    // boolean centerInside = polygonPoint(vertices, cx,cy);
    // if (centerInside) return true;
  
    // otherwise, after all that, return false
    return false;
  }

function lineCircle(x1, y1, x2, y2, cx, cy, r) {

    // is either end INSIDE the circle?
    // if so, return true immediately
    let inside1 = pointCircle(x1,y1, cx,cy,r);
    let inside2 = pointCircle(x2,y2, cx,cy,r);
    if (inside1 || inside2) return true;
  
    // get length of the line
    let distX = x1 - x2;
    let distY = y1 - y2;
    let len = Math.sqrt( (distX*distX) + (distY*distY) );
  
    // get dot product of the line and circle
    let dot = ( ((cx-x1)*(x2-x1)) + ((cy-y1)*(y2-y1)) ) / Math.pow(len,2);
  
    // find the closest point on the line
    let closestX = x1 + (dot * (x2-x1));
    let closestY = y1 + (dot * (y2-y1));
  
    // is this point actually on the line segment?
    // if so keep going, but if not, return false
    let onSegment = linePoint(x1,y1,x2,y2, closestX,closestY);
    if (!onSegment) return false;

  
    // get distance to closest point
    distX = closestX - cx;
    distY = closestY - cy;
    let distance = Math.sqrt( (distX*distX) + (distY*distY) );
  
    if (distance <= r) {
      return {x: closestX, y: closestY};
    }
    return false;
  }

  function pointCircle(px, py, cx, cy, r) {

    // get distance between the point and circle's center
    // using the Pythagorean Theorem
    let distX = px - cx;
    let distY = py - cy;
    let distance = Math.sqrt( (distX*distX) + (distY*distY) );
  
    // if the distance is less than the circle's
    // radius the point is inside!
    if (distance <= r) {
      return {x: px, y: py};
    }
    return false;
  }

  function linePoint(x1, y1, x2, y2, px, py) {

    // get distance from the point to the two ends of the line
    let d1 = dist(px,py, x1,y1);
    let d2 = dist(px,py, x2,y2);
  
    // get the length of the line
    let lineLen = dist(x1,y1, x2,y2);
  
    // since floats are so minutely accurate, add
    // a little buffer zone that will give collision
    let buffer = 0.1;    // higher # = less accurate
  
    // if the two distances are equal to the line's
    // length, the point is on the line!
    // note we use the buffer here to give a range,
    // rather than one #
    if (d1+d2 >= lineLen-buffer && d1+d2 <= lineLen+buffer) {
      return true;
    }
    return false;
  }

  function dist(x1,y1, x2,y2){
    let distX = x1 - x2;
    let distY = y1 - y2;
    return Math.sqrt( (distX*distX) + (distY*distY) );
  }