import { Shape } from './container';

namespace sp {
  export function shape(shapeArr: ArrayLike<number>) {
    return new Shape(shapeArr);
  }

  export function ones(dim: number): Shape {
    const buffer = new Array<number>(dim).fill(1);
    return shape(buffer);
  }
}

export default sp;
