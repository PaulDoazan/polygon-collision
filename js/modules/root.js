import Polygon from './polygon.js';
import ClickArea from './clickArea.js';

let polygons = [];
let size = 30;
let marginX = 275;
let marginY = 100;

/*let marginX = 412;
let marginY = 200;*/

export default function root(stage) {
    let container = new createjs.MovieClip();
    stage.addChild(container);
    stage.polygons = polygons;

    for (let l = 0; l < 15; l++) {
        for (let c = 0; c < 15; c++) {
            let coords = [
                { x: marginX + (c + 1) * size - size / 2, y: marginY + (l + 1) * size - size / 2 },
                { x: marginX + (c + 1) * size + size / 2, y: marginY + (l + 1) * size - size / 2 },
                { x: marginX + (c + 1) * size - size / 2, y: marginY + (l + 1) * size + size / 2 }
            ]
            let polygon = new Polygon(coords, stage);
            polygons.push(polygon);
            container.addChild(polygon);

            let coords2 = [
                { x: marginX + (c + 1) * size + size / 2, y: marginY + (l + 1) * size - size / 2 },
                { x: marginX + (c + 1) * size + size / 2, y: marginY + (l + 1) * size + size / 2 },
                { x: marginX + (c + 1) * size - size / 2, y: marginY + (l + 1) * size + size / 2 }
            ]
            let polygon2 = new Polygon(coords2, stage);
            polygons.push(polygon2);
            container.addChild(polygon2);
        }
    }

    let clickArea = new ClickArea();
    stage.addChild(clickArea);
}