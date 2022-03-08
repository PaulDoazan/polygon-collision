let side = 14;
let colors = ["#063e7b", "#ececd1", "#f0ce57", "#f45a3c", "#f09548"]

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

    stage.on('targetMove', (e) => {
        onTargetMove(e, sh)
    })

    return sh;
}

function onTargetMove(e, sh) {
    detectCollision(e, sh)
}

function updateShape(e) {
    let tg = e.currentTarget;
    let g = tg.graphics;

    g.clear();
    g.beginFill(tg.fillColor);
    if (tg.provisoryCoords) {

    } else {
        g.drawRect(tg.coords.x - side / 2, tg.coords.y - side / 2, tg.side, tg.side);
    }
}

function detectCollision(e, sh) {
    let dx = e.coords.x - (sh.coords.x);
    let dy = e.coords.y - (sh.coords.y);
    let distance = Math.sqrt((dx * dx) + (dy * dy));

    // if the distance is less than the sum of the circle's
    // radii, the circles are touching!
    if (distance <= e.radius) {
        let angle = Math.atan2(dy, dx);
        sh.coords.x = e.coords.x - Math.cos(angle) * e.radius;
        sh.coords.y = e.coords.y - Math.sin(angle) * e.radius;
    }
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
