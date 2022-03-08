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
    gr.drawRect(coords.x - side / 2, coords.y - side / 2, side, side);

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
    let dx = e.coords.x - (currentCoords.x);
    let dy = e.coords.y - (currentCoords.y);
    let distance = Math.sqrt((dx * dx) + (dy * dy));

    // if the distance is less than the sum of the circle's
    // radii, the circles are touching!
    if (distance <= e.radius) {
        let angle = Math.atan2(dy, dx);
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