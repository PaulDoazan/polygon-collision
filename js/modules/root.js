import Polygon from './polygon.js';

let polygons = [];

export default function root(stage) {
    let mainMc = new createjs.MovieClip();
    stage.addChild(mainMc);

    for (let l = 0; l < 30; l++) {
        for (let c = 0; c < 50; c++) {
            let polygon = new Polygon();

            polygon.x = (c + 1) * 20;
            polygon.y = (l + 1) * 20;

            polygons.push(polygon);

            mainMc.addChild(polygon);
        }
    }
}
