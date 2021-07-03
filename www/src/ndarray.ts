import * as kernel from "ndarray-kernel";
import { IndexError } from "./exception";

import Shape from "./shape";
import { between, ElementType, getByteLength, getTypeConstructor, isScalar, TypedNumericArray } from "./utils";


export class nd {

  static array(dummy: any, dtype: ElementType = 'f64'): NdArray {
    let shape_arr: Uint32Array;

    try {
      shape_arr = Shape.getShapeFromDummy(dummy);
    } catch (e) {
      throw new IndexError("The given array is not iterable. ");
    }

    if (!Shape.checkShapeUnify(dummy, shape_arr)) {
      throw new IndexError(`The given array is not fit to shape ${shape_arr}`);
    }

    const shape = new Shape(shape_arr);
    
    const size = shape.size;
    const byteLength = getByteLength(dtype);
    const totalLength = size * byteLength;

    const wasmMemory = kernel.wasm_memory().buffer;
    const ptr = kernel.alloc(totalLength)

    const _constructor = getTypeConstructor(dtype);
    const view = new _constructor(wasmMemory, ptr, size);

    nd.fromDummy(dummy, view, 0);
    return new NdArray(shape, dtype, ptr);
  }

  private static fromDummy(dummy: any, buffer: TypedNumericArray, t: number) {
    const length: number = dummy.length === undefined ? 0 : dummy.length;
    const isScalarVector = isScalar(dummy[0]);
    const width = dummy[0].length;

    if (isScalarVector) {
      for (let i = 0; i < length; i++) buffer[t + i] = dummy[i];
    } else {
      for (let i = 0; i < length; i++) nd.fromDummy(dummy[i], buffer, t + i * width);
    }
  }

  private static unaryOperation(a: NdArray, op: string) {
    // @ts-ignore
    const opr = kernel[`unary_${op}_${a.dtype}`];
    const new_ptr = kernel.alloc(a.size * 8);
    opr(a.size, a.ptr, new_ptr);
    return new NdArray(a.shape_obj, "f64", new_ptr);
  }

  static random(shape: ArrayLike<number>, dtype: ElementType = 'u8') {
    const arr = new NdArray(shape, dtype);
    for (let i = 0; i < arr.size; i++) arr.buffer[i] = 255 * Math.random();
    return arr;
  }

  static sin(a: NdArray) {
    return nd.unaryOperation(a, "sin");
  }

  static cos(a: NdArray) {
    return nd.unaryOperation(a, "cos");
  }

  static tan(a: NdArray) {
    return nd.unaryOperation(a, "tan");
  }

  // binaryOperate(operator: (a: number, b: number) => number, operand: number | NdArray, dtype: ElementType="f64"): NdArray {
  //   if (operand instanceof NdArray) {
  //     return this.binaryOperateNdarray(operator, operand, dtype);
  //   } else {
  //     return this.binaryOperateScalar(operator, operand, dtype);
  //   }
  // }

  
  static all(a: NdArray) {
    // @ts-ignore
    const opr = kernel[`reduce_all_${a.dtype}`];
    return opr(a.size, a.ptr);
  }

  // any() {
  //   for (let i = 0; i < this.size; i++) {
  //     if (this.buffer[i] !== 0) return true;
  //   }
  //   return false;
  // }

  // count() {
  //   let c = 0;
  //   for (let i = 0; i < this.size; i++) {
  //     if (this.buffer[i] !== 0) c += 1;
  //   }
  //   return c;
  // }

}

export class NdArray {

  private readonly _shape_obj: Shape;
  private readonly _dtype: ElementType;

  private readonly _ptr: number;
  private dataview: TypedNumericArray | null;

  constructor(shape: Shape | ArrayLike<number>, dtype: ElementType, existedBuffer?: number) {
    this._shape_obj = shape instanceof Shape ? shape : new Shape(shape);
    this._dtype = dtype;

    const size = this._shape_obj.size;

    const byteLength = getByteLength(this._dtype);
    this._ptr = existedBuffer || kernel.alloc(size * byteLength);
    this.dataview = null;
  }

  get ptr(): number {
    return this._ptr;
  }

  get dtype(): ElementType {
    return this._dtype;
  }

  get dim(): number {
    return this.shape_obj.dim;
  }

  get size(): number {
    return this.shape_obj.size;
  }

  get shape(): Uint32Array {
    return this._shape_obj.shape;
  }

  get shape_obj(): Shape {
    return this._shape_obj;
  }

  get buffer(): TypedNumericArray {
    if (this.dataview === null || this.dataview.length !== this.size) {
      const wasmMemory = kernel.wasm_memory().buffer;
      const _constructor = getTypeConstructor(this._dtype);
      this.dataview = new _constructor(wasmMemory, this._ptr, this.size);
    }
    return this.dataview;
  }

  fill(value: number): NdArray {
    this.buffer.fill(value);
    return this;
  }

  at(...index: Array<number>): number {
    const t = this.shape_obj.flatIndex(index);
    return this.buffer[t];
  }
  
  private prettyString(curSlice: Array<number>, maxLength: number | null = null): string {
    maxLength = maxLength === null ? Math.round(100 ** (1.0 / this.dim)) : maxLength!;
    const maxDigital = 3;

    const level: number = curSlice.length;
    const withoutPaddingHead = level === 0 || curSlice[level - 1] === 0;

    const buf = []
    const l = this.shape_obj.at(level);

    if (level === this.dim - 1) {
      for (let i = 0; i < l; i++) {
        const element = this.at(...curSlice, i);
        const present = this.dtype[0] === 'f' ? element.toFixed(maxDigital) : `${element}`;
        buf.push(present);
        if (i > maxLength) {
          buf.push(" ...");
          break;
        }
      }
      return `${withoutPaddingHead ? "" : " ".repeat(level)}[${buf.join(", ")}]`;
    } else {
      for (let i = 0; i < l; i++) {
        buf.push(this.prettyString([...curSlice, i]));
        if (i > maxLength) {
          buf.push(" ...");
          break;
        }
      }
      return `${withoutPaddingHead ? "" : ' '.repeat(level)}[${buf.join(", \n")}]`;
    }
  }

  toString(): string {
    return this.prettyString([]);
  }

  show(): void {
    console.log(`${this.shape_obj.toString()} ${this.dtype}\n${this.toString()}`);
  }
}
