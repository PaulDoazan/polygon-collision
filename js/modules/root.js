import Polygon from './polygon.js';
import ClickArea from './clickArea.js';

let polygons = [];
let size = 15;
let marginX = 100;
let marginY = 100;

export default function root(stage) {
    let container = new createjs.MovieClip();
    stage.addChild(container);
    stage.polygons = polygons;

    for (let l = 0; l < 40; l++) {
        for (let c = 0; c < 55; c++) {
            let polygon = new Polygon({ x: marginX + (c + 1) * size, y: marginY + (l + 1) * size }, stage);
            polygons.push(polygon);
            container.addChild(polygon);
        }
    }

    let clickArea = new ClickArea();
    stage.addChild(clickArea);
}