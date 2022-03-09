let radius = 30;

export default function clickArea() {
    let mc = new createjs.MovieClip();
    let gr = new createjs.Graphics();
    let sh = new createjs.Shape(gr);

    gr.beginFill('rgba(0,0,0,0.01)');
    gr.drawRect(0, 0, 1024, 768);

    mc.addChild(sh);

    mc.on("mousedown", onDown);
    mc.on("pressup", onUp);
    mc.on("pressmove", onMove);

    return mc;
}

function onDown(e) {
    let tg = e.currentTarget;
    let stage = tg.parent;
    let coords = tg.localToGlobal(stage.mouseX, stage.mouseY);

    let g = new createjs.Graphics();
    let s = new createjs.Shape(g);

    //tg.addChild(s);
    tg.targetCircle = s;

    /*g.beginFill("red");
    g.drawCircle(0, 0, radius);*/

    s.x = coords.x;
    s.y = coords.y;

    let event = new createjs.Event("targetDown");
    stage.dispatchEvent(event);
}

function onUp(e) {
    let tg = e.currentTarget;
    let stage = tg.parent;
    tg.removeChild(tg.targetCircle);

    let event = new createjs.Event("targetUp");
    stage.dispatchEvent(event);
}

function onMove(e) {
    let tg = e.currentTarget;
    let stage = tg.parent;
    let coords = tg.localToGlobal(stage.mouseX, stage.mouseY);

    tg.targetCircle.x = coords.x;
    tg.targetCircle.y = coords.y;

    let event = new createjs.Event("targetMove");
    event.coords = coords;
    event.radius = radius;
    stage.dispatchEvent(event);
}

