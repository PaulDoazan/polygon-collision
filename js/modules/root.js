import Polygon from './polygon.js';
import ClickArea from './clickArea.js';
import ducuing from '../json/ducuing.json' assert { type: "json" };;
//import ducuing from '../json/ducuing.json';

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

    ducuing.default.map((shape) => {
        let polygon = new Polygon(shape, stage);
        polygons.push(polygon);
        container.addChild(polygon);
    })
    ducuing.bottom.map((shape) => {
        let polygon = new Polygon(shape, stage);
        polygons.push(polygon);
        container.addChild(polygon);
    })
    ducuing.mouth.map((shape) => {
        let polygon = new Polygon(shape, stage);
        polygons.push(polygon);
        container.addChild(polygon);
    })
    ducuing.ears.map((shape) => {
        let polygon = new Polygon(shape, stage);
        polygons.push(polygon);
        container.addChild(polygon);
    })
    ducuing.eyes.map((shape) => {
        let polygon = new Polygon(shape, stage);
        polygons.push(polygon);
        container.addChild(polygon);
    })
    ducuing.hair.map((shape) => {
        let polygon = new Polygon(shape, stage);
        polygons.push(polygon);
        container.addChild(polygon);
    })


    let clickArea = new ClickArea();
    stage.addChild(clickArea);
}