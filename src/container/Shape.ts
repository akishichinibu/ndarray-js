import allocator from "src/allocator";
import { IndexError, RunningTimeError } from "src/exception";
import { shape } from "src/shape";
import { between, isScalar, isScalarArray } from "src/utils";


async function* checkIfShapeUnifyGenerator(anyArray: any, shape: ArrayLike<number>) {
  const dim = shape.length;

  if (dim === 0) {
    yield false;
    return;
  }

  const queue: Array<[any, number]> = [[anyArray, 0], ];

  while (queue.length > 0) {
    const [a, dimth] = queue.shift()!;
    const targetLength = shape[dimth];

    if (a.length !== targetLength) {
      yield false;
    };

    if (dimth === dim - 1) {
      yield isScalarArray(a);
      continue;
    }

    for (let r of a) {
      queue.push([r, dimth + 1]);
    }
  }

  yield true;
}


export class Shape {

  readonly shape: Uint32Array;
  readonly dim: number;

  private readonly projection: Uint32Array;
  private readonly restrict: Uint32Array;
  private readonly buffer: Uint32Array;

  constructor(shapeArray: ArrayLike<number>) {
    this.dim = shapeArray.length;

    if (this.dim == 0) {
      throw new IndexError("The dimension of the shape cann't not be 0. ");
    }

    this.shape = allocator.allocateU32(this.dim);
    for (let i = 0; i < this.dim; i++) this.shape[i] = shapeArray[i];

    this.projection = this.getProjection();
    this.restrict = this.getRestrictFromShape();

    this.buffer = allocator.allocateU32(this.dim);
  }

  private getProjection() {
    const buf = allocator.allocateU32(this.dim);
    buf[0] = 1;
    for (let i = 1; i < this.dim; i++) {
      buf[i] = this.shape[this.dim - i] * buf[i - 1];
    }
    return buf.reverse();
  }

  private getRestrictFromShape() {
    const buf = allocator.allocateU32(this.dim);
    buf[0] = this.shape[this.dim - 1];
    for (let i = 1; i < this.dim; i++) {
      buf[i] = this.shape[this.dim - 1 - i] * buf[i - 1];
    }
    return buf.reverse();
  }

  absoluteIndex(index: ArrayLike<number>) {
    for (let i = 0; i < this.dim; i++) {
      if (!between(index[i], 0, this.shape[i])) {
        throw new IndexError(`The index [${index[i]}] is out of bounds of dimension [${this.shape[i]}]`);
      }
    }

    return this.absoluteIndexUnsafe(index);
  }

  absoluteIndexUnsafe(index: ArrayLike<number>) {
    let result = 0;
    for (let i = 0; i < this.dim; i++) result += index[i] * this.projection[i];
    return result;
  }

  reveseAbsoluteIndexUnsafe(t: number) {
    for (let i = 0; i < this.dim; i++) this.buffer[i] = (t % this.restrict[i]) / this.projection[i];
    return this.buffer;
  }

  boardcastUnsafe(index: Uint32Array) {
    for (let i = 0; i < this.dim; i++) this.buffer[i] = this.buffer[i] === 1 ? 0 : index[i];
    return this.buffer;
  }

  binary(otherShape: Shape): Shape {
    const resultShape = new Uint32Array(this.dim);

    for (let i = 0; i < this.dim; i++) {
      if (this.shape[i] === otherShape.shape[i]) {
        resultShape[i] = this.shape[i];
      } else if (this.shape[i] === 1) {
        resultShape[i] = otherShape.shape[i];
      } else if (otherShape.shape[i] === 1) {
        resultShape[i] = this.shape[i];
      }
    }

    return new Shape(resultShape);
  }

  get size() {
    let size = 1;
    for (let i = 0; i < this.dim; i++) size *= this.shape[i];
    return size;
  }

  /**
   * Return the size at given position. 
   * @param  {number} pos
   */
  at(pos: number) {
    if (!between(pos, 0, this.dim)) {
      throw new IndexError(`The position [${pos}] is out of bound [${this.shape}]. `);
    }
    return this.shape[pos];
  }

  reshape(newShapeArr: ArrayLike<number>): Shape {
    const newShape = shape(newShapeArr);

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
    if (this.dim !== other.dim) {
      return false;
    }

    const n = this.dim;
    for (let i = 0; i < n; i++) {
      if (this.shape[i] !== other.shape[i]) {
        return false;
      }
    }
    return true;
  }

  static async checkIfShapeUnify(anyArray: any, shape: ArrayLike<number>) {
    const task = checkIfShapeUnifyGenerator(anyArray, shape);
    for await (let status of task) {
      if (status === false) {
        return false;
      }
    }

    return true;
  }

  static getShapeFromAnyArray(anyArray: any): Uint32Array {
    if (isScalar(anyArray)) {
      throw new IndexError("The given array is a scalar");
    }

    const s = [];
    for (let r = anyArray; !isScalar(r); r = r[0]) s.push(r.length);

    const buffer = allocator.allocateU32(s.length);
    for (let i = 0; i < s.length; i++) buffer[i] = s[i];
    return buffer;
  }

  toString(): string {
    return `(${Array.from(this.shape).join(" x ")}) [${this.size}]`;
  }
}
