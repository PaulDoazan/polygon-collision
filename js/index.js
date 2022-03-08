import root from './modules/root.js'

let canvas;
let stage;

export function initialize() {
    // create a new stage and point it at our canvas:
    canvas = document.getElementById("canvas");
    stage = new createjs.Stage(canvas);
    //stage.setClearColor("#ffffff");

    // start the tick and point it at the window so we can do some work before updating the stage:
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.on("tick", tick);

    root(stage);
}

function tick() {
    stage.update();
}

window.addEventListener('canvasLoaded', initialize);