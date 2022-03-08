let radius = 50;

export default function polygon() {
    let gr = new createjs.Graphics();
    let sh = new createjs.Shape(gr);

    gr.beginFill('red');
    gr.drawCircle(0, 0, radius);

    sh.on('tick', updateShape)
    sh.radius = radius;
    sh.pace = getRandomIntInclusive(1, 4);
    sh.unit = 1;

    return sh;
}

function updateShape(e) {
    let tg = e.currentTarget;
    let g = tg.graphics;

    g.clear();
    g.beginFill('red');

    tg.radius += tg.pace * tg.unit;

    if (tg.radius > 100) {
        tg.unit = -1;
    } else if (tg.radius < 10) {
        tg.unit = 1;
    }

    g.drawCircle(0, 0, tg.radius)
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
