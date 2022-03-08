import Polygon from './polygon.js';

let polygons = [];

export default function root(stage) {
    let mainMc = new createjs.MovieClip();
    mainMc.x = 50;
    mainMc.y = 100;
    stage.addChild(mainMc);

    for (let l = 0; l < 30; l++) {
        for (let c = 0; c < 60; c++) {
            let polygon = new Polygon();

            polygon.x = (c + 1) * 15;
            polygon.y = (l + 1) * 15;

            polygons.push(polygon);

            mainMc.addChild(polygon);
        }
    }
}
