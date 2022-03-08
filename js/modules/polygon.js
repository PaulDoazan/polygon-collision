let side = 15;
let colors = ["#063e7b", "#ececd1", "#f0ce57", "#f45a3c", "#f09548"]

export default function polygon() {
    let gr = new createjs.Graphics();
    let sh = new createjs.Shape(gr);

    let strokeColor = 'rgba(0,0,0,0.5)';
    //gr.beginStroke('rgba(0,0,0,0.5)');

    let fillColor = colors[getRandomIntInclusive(0, colors.length - 1)];
    gr.beginFill(fillColor);
    gr.drawRect(0, 0, side, side);

    sh.on('tick', updateShape)
    sh.side = side;
    sh.fillColor = fillColor;
    sh.strokeColor = strokeColor;
    sh.pace = getRandomIntInclusive(1, 4);
    sh.unit = 1;

    return sh;
}

function updateShape(e) {
    let tg = e.currentTarget;
    let g = tg.graphics;

    g.clear();
    //g.beginStroke(tg.strokeColor);
    g.beginFill(tg.fillColor);
    g.drawRect(0, 0, tg.side, tg.side);
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
