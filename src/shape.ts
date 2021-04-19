import { IndexError, RunningTimeError } from "./exception";
import { between, isScalar } from "./utils";

export namespace sp {

  export function shape(shape_arr: ArrayLike<number>) {
    return new Shape(shape_arr);
  }

  export function ones(dim: number): Shape {
    return shape(new Array<number>(dim).fill(1));
  }

}


export class Shape {

  private readonly _shape: Uint32Array;
  private readonly _dim: number;
  private readonly projection: Uint32Array;
  private readonly restrict: Uint32Array;
  private readonly buffer: Uint32Array;

  constructor(shape_arr: ArrayLike<number>) {
    this._dim = shape_arr.length;

    if (this._dim == 0) {
      throw new IndexError("The dimension of the shape cann't not be 0. ");
    }

    this._shape = new Uint32Array(this._dim);
    for (let i = 0; i < this._dim; i++) this._shape[i] = shape_arr[i];

    this.projection = this.getProjection();
    this.restrict = this.getRestrictFromShape();

    this.buffer = new Uint32Array(this._dim);
  }

  private getProjection(): Uint32Array {
    const buf = new Uint32Array(this._dim);
    buf[0] = 1;
    for (let i = 1; i < this._dim; i++) {
      buf[i] = this._shape[this._dim - i] * buf[i - 1];
    }
    return buf.reverse();
  }

  private getRestrictFromShape(): Uint32Array {
    const buf = new Uint32Array(this._dim);
    buf[0] = this._shape[this._dim - 1];
    for (let i = 1; i < this._dim; i++) {
      buf[i] = this._shape[this._dim - 1 - i] * buf[i - 1];
    }
    return buf.reverse();
  }

  absoluteIndex(index: ArrayLike<number>): number {
    for (let i = 0; i < this._dim; i++) {
      if (!between(index[i], 0, this._shape[i])) {
        throw new IndexError(`The index [${index[i]}] is out of bounds of dimension [${this._shape[i]}]`);
      }
    }

    return this.absoluteIndexUnsafe(index);
  }

  absoluteIndexUnsafe(index: ArrayLike<number>): number {
    let result = 0;
    for (let i = 0; i < this._dim; i++) result += index[i] * this.projection[i];
    return result;
  }

  reveseAbsoluteIndexUnsafe(t: number): Uint32Array {
    for (let i = 0; i < this._dim; i++) this.buffer[i] = (t % this.restrict[i]) / this.projection[i];
    return this.buffer;
  }

  boardcastUnsafe(index: Uint32Array): Uint32Array {
    for (let i = 0; i < this._dim; i++) this.buffer[i] = this.buffer[i] === 1 ? 0 : index[i];
    return this.buffer;
  }

  binary(otherShape: Shape): Shape {
    const resultShape = new Uint32Array(this.dim);

    for (let i = 0; i < this.dim; i++) {
      if (this._shape[i] === otherShape._shape[i]) {
        resultShape[i] = this._shape[i];
      } else if (this._shape[i] === 1) {
        resultShape[i] = otherShape._shape[i];
      } else if (otherShape._shape[i] === 1) {
        resultShape[i] = this._shape[i];
      }
    }

    return new Shape(resultShape);
  }

  get size(): number {
    let size: number = 1;
    for (let i = 0; i < this._dim; i++) size *= this._shape[i];
    return size;
  }

  get dim(): number {
    return this._dim;
  }

  get shape(): Uint32Array {
    return this._shape;
  }

  /**
   * Return the size at given position. 
   * @param  {number} pos
   */
  at(pos: number): number {
    if (!between(pos, 0, this._dim)) {
      throw new IndexError(`The position [${pos}] is out of bound [${this._shape}]. `);
    }
    return this._shape[pos];
  }

  reshape(newShapeArr: ArrayLike<number>): Shape {
    const newShape = sp.shape(newShapeArr);

    if (newShape.size !== this.size) {
      throw new RunningTimeError(`Can not be reshaped to ${newShape} from ${this.shape}. `);
    }

    return newShape;
  }

  binaryWithCheck(otherShape: Shape): void {
    if (this.dim !== otherShape.dim) {
      throw new RunningTimeError(`Can not execute binary operation between ${this.shape} and ${otherShape.shape}. `);
    }

    for (let i = 0; i < this.dim; i++) {
      if (this.shape[i] === otherShape.shape[i]) {
        continue;
      }

      if (this.shape[i] === 1) {
        continue;
      }

      if (otherShape.shape[i] === 1) {
        continue;
      }

      throw new RunningTimeError(`Can not execute binary operation between ${this.shape} and ${otherShape.shape}. `);
    }
  }

  isEqual(other: Shape) {
    if (this._dim !== other._dim) {
      return false;
    }

    const n = this._dim;
    for (let i = 0; i < n; i++) {
      if (this._shape[i] !== other._shape[i]) {
        return false;
      }
    }
    return true;
  }

  static checkShapeUnify(dummy: any, shape: ArrayLike<number>): boolean {
    if (dummy.length !== shape[0]) {
      return false
    };

    if (shape.length === 1) {
      return true;
    }

    const p = Array.from(shape).slice(1);

    for (let r of dummy) {
      if (!this.checkShapeUnify(r, p)) {
        return false;
      };
    }
    
    return true;
  }

  static getShapeFromDummy(dummy: any): Uint32Array {
    if (isScalar(dummy)) {
      throw new IndexError("The given array is a scalar");
    }

    const s = [];
    for (let r = dummy; !isScalar(r); r = r[0]) s.push(r.length);

    return new Uint32Array(s);
  }

  toString(): string {
    return `(${Array.from(this._shape).join(" x ")}) [${this.size}]`;
  }
}
