import Polygon from './polygon.js';
import ClickArea from './clickArea.js';

let polygons = [];
let size = 15;
let marginX = 50;
let marginY = 60;

/*let marginX = 412;
let marginY = 200;*/

export default function root(stage) {
    let container = new createjs.MovieClip();
    stage.addChild(container);
    stage.polygons = polygons;

    for (let l = 0; l < 30; l++) {
        for (let c = 0; c < 60; c++) {
            let coords = [
                { x: marginX + (c + 1) * size - size / 2, y: marginY + (l + 1) * size - size / 2 },
                { x: marginX + (c + 1) * size + size / 2, y: marginY + (l + 1) * size - size / 2 },
                { x: marginX + (c + 1) * size + size / 2, y: marginY + (l + 1) * size + size / 2 },
                { x: marginX + (c + 1) * size - size / 2, y: marginY + (l + 1) * size + size / 2 }
            ]
            let polygon = new Polygon(coords, stage);
            polygons.push(polygon);
            container.addChild(polygon);
        }
    }

    let clickArea = new ClickArea();
    stage.addChild(clickArea);
}