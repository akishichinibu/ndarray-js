import allocator from 'src/allocator';
import wasm from 'src/wasm';

import sp from 'src/shape';
import { Ptr } from 'src/type';
import { IndexError, RunningTimeError } from 'src/exception';
import { between, isScalar } from 'src/utils';

import { checkIfShapeUnifyGenerator } from './utils';
import { PtrBase } from './PtrBase';

abstract class BaseShapePtr extends PtrBase {
  readonly dim: number;
  readonly ptr: Ptr;

  constructor(shapeArray: ArrayLike<number>) {
    super();
    this.dim = shapeArray.length;

    if (this.dim == 0) {
      throw new IndexError("The dimension of the shape cann't not be 0. ");
    }

    this.ptr = allocator.allocateWasm((4 * this.dim + 1) * Uint32Array.BYTES_PER_ELEMENT);
    this.shape.set(shapeArray);

    wasm.shape.init(this.dim, this.ptr);
  }

  private get ptrBuffer() {
    return new Uint32Array(wasm.memory?.buffer!, this.ptr, 4 * this.dim + 1);
  }

  private offsetView(d: number) {
    const t = d * this.dim * Uint32Array.BYTES_PER_ELEMENT;
    return new Uint32Array(wasm.memory?.buffer!, this.ptr + t, this.dim);
  }

  get shape() {
    return this.offsetView(0);
  }

  get projection() {
    return this.offsetView(1);
  }

  get restrict() {
    return this.offsetView(2);
  }

  get buffer() {
    return this.offsetView(3);
  }

  get size() {
    return this.ptrBuffer[4 * this.dim];
  }
}

class BaseShape extends BaseShapePtr {
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

    await BaseShape.checkIfShapeUnify(anyArray, s);

    const buffer = allocator.allocateU32(s.length);
    for (let i = 0; i < s.length; i++) buffer[i] = s[i];
    return buffer;
  }

  at(pos: number) {
    if (!between(pos, 0, this.dim)) {
      throw new IndexError(`The position [${pos}] is out of bound [${this.shape}]. `);
    }
    return this.shape[pos];
  }

  linearIndex(indexs: ArrayLike<ArrayLike<number>>) {
    const [inputPtr, input] = allocator.allocateWasmU32(indexs.length * this.dim);

    for (let u = 0; u < indexs.length; u++) {
      const index = indexs[u];

      if (index.length !== this.dim) {
        throw new IndexError(`The length of indexs [${u}] should be equal to ${this.dim}`);
      }

      for (let i = 0; i < this.dim; i++) {
        if (!between(index[i], 0, this.shape[i])) {
          throw new IndexError(`The index [${index[i]}] is out of bounds of dimension [${this.shape[i]}]`);
        }

        input[u * this.dim + i] = index[i];
      }
    }

    const [outputPtr, output] = allocator.allocateWasmU32(indexs.length);

    wasm.shape.calcLinearIndex(this.dim, this.ptr, inputPtr, outputPtr);
    allocator.freeWasm(inputPtr);
    return output;
  }

  // reverseLinearIndex(indexs: ArrayLike<number>) {
  //   const [inputPtr, input] = allocator.allocateWasmU32(indexs.length);

  //   for (let u = 0; u < indexs.length; u++) {
  //     const index = indexs[u];
  //     if (!between(index, 0, this.size)) {
  //       throw new IndexError(`The index [${index}] is out of bounds of [${this.shape}]`);
  //     }

  //     input[u] = index;
  //   }

  //   const [outputPtr, output] = allocator.allocateWasmU32(indexs.length * this.dim);
  //   wasm.shape.calcLinearReverseIndex(this.dim, this.ptr, inputPtr, outputPtr);

  //   return output;
  // }

  boardcastUnsafe(index: Uint32Array) {
    for (let i = 0; i < this.dim; i++) this.buffer[i] = this.buffer[i] === 1 ? 0 : index[i];
    return this.buffer;
  }

  binaryOperation(otherShape: BaseShape) {
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
}

export class Shape extends BaseShape {
  reshape(newShapeArr: ArrayLike<number>) {
    const newShape = sp.shape(newShapeArr);

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

  toString() {
    return `(${Array.from(this.shape).join(' x ')}) [${this.size}]`;
  }
}
