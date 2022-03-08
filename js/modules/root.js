import Polygon from './polygon.js';

let polygons = [];

export default function root(stage) {
    let mainMc = new createjs.MovieClip();
    stage.addChild(mainMc);

    for (let i = 0; i < 10; i++) {
        let polygon = new Polygon();

        polygon.x = (i + 1) * 100;
        polygon.y = 200;

        polygons.push(polygon);

        mainMc.addChild(polygon);
    }
}
