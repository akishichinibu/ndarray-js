import allocator from "src/allocator";
import wasm from "src/wasm";

import { IndexError, RunningTimeError } from "src/exception";
import { shape } from "src/shape";
import { between, isScalar, isScalarArray } from "src/utils";
import { calcProjection, calcRestrict, calcSize, checkIfShapeUnifyGenerator, calcLinearIndex, calcLinearReverseIndex } from "./utils";
import { Ptr } from "src/type";


export class Shape {

  readonly dim: number;
  readonly size: number;
  readonly shapePtr: Ptr;

  private readonly projectionPtr: Ptr;
  private readonly restrictPtr: Ptr;
  private readonly bufferPtr: Ptr;

  constructor(shapeArray: ArrayLike<number>) {
    this.dim = shapeArray.length;

    if (this.dim == 0) {
      throw new IndexError("The dimension of the shape cann't not be 0. ");
    }

    this.shapePtr = allocator.allocateU32Wasm(this.dim, Array.from(shapeArray));
    console.log(this.dim, this.shapePtr);
    console.log(this.shape);

    this.size = wasm.calcSize(this.dim, this.shapePtr);

    this.projectionPtr = allocator.allocateU32Wasm(this.dim);
    wasm.calcProjection(this.dim, this.shapePtr, this.projectionPtr);

    this.restrictPtr = allocator.allocateU32Wasm(this.dim);
    wasm.calcRestrict(this.dim, this.shapePtr, this.restrictPtr);

    this.bufferPtr = allocator.allocateU32Wasm(this.dim);
  }

  get shape(): Uint32Array {
    return wasm.__getUint32Array(this.shapePtr);
  }

  get projection(): Uint32Array {
    return wasm.__getUint32Array(this.projectionPtr);
  }

  get restrict(): Uint32Array {
    return wasm.__getUint32Array(this.restrictPtr);
  }

  get buffer(): Uint32Array {
    return wasm.__getUint32Array(this.bufferPtr);
  }

  private moveToBuffer(values: ArrayLike<number>) {
    for (let i = 0; i < this.dim; i++) this.buffer[i] = values[i];
  }

  linearIndex(index: ArrayLike<number>) {
    for (let i = 0; i < this.dim; i++) {
      if (!between(index[i], 0, this.shape[i])) {
        throw new IndexError(`The index [${index[i]}] is out of bounds of dimension [${this.shape[i]}]`);
      }
    }

    this.moveToBuffer(index);
    return wasm.calcLinearIndex(this.dim, this.bufferPtr, this.projectionPtr);
  }

  reverseLinearIndex(index: number) {
    if (!between(index, 0, this.size)) {
      throw new IndexError(`The index [${index}] is out of bounds of [${this.shape}]`);
    }

    wasm.calcLinearReverseIndex(this.dim, index, this.projectionPtr, this.restrictPtr, this.bufferPtr);
    return this.buffer;
  }

  boardcastUnsafe(index: Uint32Array) {
    for (let i = 0; i < this.dim; i++) this.buffer[i] = this.buffer[i] === 1 ? 0 : index[i];
    return this.buffer;
  }

  binaryOperation(otherShape: Shape): Shape {
    if (this.dim !== otherShape.dim) {
      throw new RunningTimeError(`Can not execute binary operation between ${this.shape} and ${otherShape.shape}, the dim doesn't match. `);
    }

    const resultShape = new Uint32Array(this.dim);

    for (let i = 0; i < this.dim; i++) {
      if (this.shape[i] === otherShape.shape[i]) {
        resultShape[i] = this.shape[i];
      } else if (this.shape[i] === 1) {
        resultShape[i] = otherShape.shape[i];
      } else if (otherShape.shape[i] === 1) {
        resultShape[i] = this.shape[i];
      } else {
        throw new RunningTimeError(`Can not execute binary operation between ${this.shape} and ${otherShape.shape} at dim ${i}. `);
      }
    }

    return new Shape(resultShape);
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

  static async getShapeFromAnyArray(anyArray: any): Promise<Uint32Array> {
    if (isScalar(anyArray)) {
      return allocator.allocateU32(0);
    }

    const s = [];
    for (let r = anyArray; !isScalar(r); r = r[0]) s.push(r.length);

    await Shape.checkIfShapeUnify(anyArray, s);

    const buffer = allocator.allocateU32(s.length);
    for (let i = 0; i < s.length; i++) buffer[i] = s[i];
    return buffer;
  }

  toString() {
    return `(${Array.from(this.shape).join(" x ")}) [${this.size}]`;
  }
}
