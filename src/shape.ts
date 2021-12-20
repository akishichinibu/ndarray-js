import { Shape } from "./container";


export function shape(shapeArr: ArrayLike<number>) {
  return new Shape(shapeArr);
}


export function ones(dim: number): Shape {
  return shape(new Array<number>(dim).fill(1));
}


export {
  Shape,
}
