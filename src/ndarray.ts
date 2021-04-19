import { IndexError } from "./exception";
import { Shape } from "./shape";
import { ElementType, getTypeConstructor, isScalar } from "./utils";


interface NumericArray extends ArrayLike<number> {
  [n: number]: number;
  fill: (value: number) => this;
}


export namespace nd {

  export function array(dummy: any, dtype: ElementType='f64'): NdArray {
    let shape_arr: Uint32Array;

    try {
      shape_arr = Shape.getShapeFromDummy(dummy);
    } catch(e) {
      throw new IndexError("The given array is not iterable. ");
    } 

    if (!Shape.checkShapeUnify(dummy, shape_arr)) {
      throw new IndexError(`The given array is not fit to shape ${shape_arr}`);
    }

    const shape = new Shape(shape_arr);

    const typed_constructor = getTypeConstructor(dtype);
    const buffer = new typed_constructor(shape.size);

    console.log(shape);

    fromDummy(dummy, buffer, 0);
    return new NdArray(shape, dtype, buffer);
  }

  function fromDummy(dummy: any, buffer: NumericArray, t: number) {
    const length: number = dummy.length === undefined ? 0 : dummy.length;
    const isScalarVector = isScalar(dummy[0]);

    console.log(dummy, length, isScalarVector);

    if (isScalarVector) {
      for (let i = 0; i < length; i++) buffer[t + i] = dummy[i];
    } else {
      for (let i = 0; i < length; i++) {
        fromDummy(dummy[i], buffer, t + i * length);
      }
    }
  }

  export function zeros(shape: Array<number>, dtype: ElementType='f64'): NdArray {
    return new NdArray(shape, dtype).fill(0);
  }

  export function ones(shape: Array<number>, dtype: ElementType='f64'): NdArray {
    return new NdArray(shape, dtype).fill(1);
  }

  export function random(shape: Array<number>): NdArray {
    const r = zeros(shape);
    const buffer = r.buffer;
    for (let i = 0; i < r.size; i++) buffer[i] = Math.random();
    return r;
  }

  function unaryOperate(operand: NdArray, operator: (x: number) => number): NdArray {
    const size = operand.size;
    const buffer = new Float64Array(size);
    const originBuffer = operand.buffer;
    for (let i = 0; i < size; i++) buffer[i] = operator(originBuffer[i]);
    return new NdArray(operand.shape, "f64", buffer);
  }

  export const sin = (operand: NdArray) => unaryOperate(operand, Math.sin);
  export const cos = (operand: NdArray) => unaryOperate(operand, Math.cos);
  export const tan = (operand: NdArray) => unaryOperate(operand, Math.tan);
  export const sinh = (operand: NdArray) => unaryOperate(operand, Math.sinh);
  export const cosh = (operand: NdArray) => unaryOperate(operand, Math.cosh);
  export const tanh = (operand: NdArray) => unaryOperate(operand, Math.tanh);
  export const exp = (operand: NdArray) => unaryOperate(operand, Math.exp);
  export const log = (operand: NdArray) => unaryOperate(operand, Math.log);
}


export class NdArray {

  private readonly shape_obj: Shape;
  private readonly dtype: ElementType;

  private readonly typed_constructor: new (n: number) => NumericArray;
  private readonly _buffer: NumericArray;

  constructor(shape: Shape | ArrayLike<number>, dtype: ElementType, buffer: NumericArray | null = null) {
    this.shape_obj = shape instanceof Shape ? shape : new Shape(shape);
    this.dtype = dtype;
    this.typed_constructor = getTypeConstructor(dtype);
    this._buffer = buffer === null ? new this.typed_constructor(this.shape_obj.size) : buffer;
  }

  get dim(): number {
    return this.shape_obj.dim;
  }

  get size(): number {
    return this.shape_obj.size;
  }

  get shape(): Uint32Array {
    return this.shape_obj.shape;
  }

  get buffer(): NumericArray {
    return this._buffer;
  }

  fill(value: number): NdArray {
    this._buffer.fill(value);
    return this;
  }

  at(...index: Array<number>): number {
    return this._buffer[this.shape_obj.absoluteIndex(index)];
  }

  reshape(newShapeArray: Array<number>): NdArray {
    const newShape = this.shape_obj.reshape(newShapeArray);
    return new NdArray(newShape, this.dtype, this._buffer);
  }

  flat(): NdArray {
    const newShape = this.shape_obj.reshape([this.shape_obj.size, ]);
    return new NdArray(newShape, this.dtype, this._buffer);
  }

  unaryOperate(operator: (x: number) => number): NdArray {
    const size = this.size;
    for (let i = 0; i < size; i++) this._buffer[i] = operator(this._buffer[i]);
    return this;
  }

  sin = () => this.unaryOperate(Math.sin);
  cos = () => this.unaryOperate(Math.cos);
  tan = () => this.unaryOperate(Math.tan);
  sinh = () => this.unaryOperate(Math.sinh);
  cosh = () => this.unaryOperate(Math.cosh);
  tanh = () => this.unaryOperate(Math.tanh);

  exp = () => this.unaryOperate(Math.exp);
  log = () => this.unaryOperate(Math.log);
  bitNot = () => this.unaryOperate((a) => ~a);
  logicalNot = () => this.unaryOperate((a) => a === 0 ? 1 : 0);

  binaryOperateScalar(operator: (a: number, b: number) => number, operand: number, dtype: ElementType): NdArray {
    const typed_constructor = getTypeConstructor(dtype);
    const result = new typed_constructor(this.size);
    for (let i = 0; i < this.shape_obj.size; i++) result[i] = operator(this._buffer[i], operand);
    return new NdArray(this.shape_obj, dtype, result);
  }

  binaryOperateNdarray(operator: (a: number, b: number) => number, operand: NdArray, dtype: ElementType): NdArray {
    let resultShape = this.shape_obj.binary(operand.shape_obj);

    const size = resultShape.size;
    const typed_constructor = getTypeConstructor(dtype);
    const result = new typed_constructor(size);

    for (let i = 0; i < size; i++) {
      const a = this._buffer[this.shape_obj.absoluteIndexUnsafe(this.shape_obj.reveseAbsoluteIndexUnsafe(i))];
      const b = operand._buffer[operand.shape_obj.absoluteIndexUnsafe(operand.shape_obj.reveseAbsoluteIndexUnsafe(i))];
      result[i] = operator(a, b);
    }

    return new NdArray(resultShape, dtype, result);
  }

  binaryOperate(operator: (a: number, b: number) => number, operand: number | NdArray, dtype: ElementType="f64"): NdArray {
    if (operand instanceof NdArray) {
      return this.binaryOperateNdarray(operator, operand, dtype);
    } else {
      return this.binaryOperateScalar(operator, operand, dtype);
    }
  }

  add = (operand: number | NdArray) => this.binaryOperate((a, b) => a + b, operand);
  sub = (operand: number | NdArray) => this.binaryOperate((a, b) => a - b, operand);
  mul = (operand: number | NdArray) => this.binaryOperate((a, b) => a * b, operand);
  div = (operand: number | NdArray) => this.binaryOperate((a, b) => a / b, operand);
  pow = (operand: number | NdArray) => this.binaryOperate((a, b) => a ** b, operand);
  equal = (operand: number | NdArray) => this.binaryOperate((a, b) => a === b ? 1 : 0, operand, "u8");
  notEqual = (operand: number | NdArray) => this.binaryOperate((a, b) => a !== b ? 1 : 0, operand, "u8");

  bitAnd = (operand: number | NdArray) => this.binaryOperate((a, b) => a & b, operand, "u32");
  bitOr = (operand: number | NdArray) => this.binaryOperate((a, b) => a | b, operand, "u32");
  bitXor = (operand: number | NdArray) => this.binaryOperate((a, b) => a ^ b, operand, "u32");
  bitShl = (operand: number | NdArray) => this.binaryOperate((a, b) => a << b, operand, "u32");
  bitShr = (operand: number | NdArray) => this.binaryOperate((a, b) => a >> b, operand, "u32");
  logicalAnd = (operand: number | NdArray) => this.binaryOperate((a, b) => a && b, operand, "u8");
  logicalOr = (operand: number | NdArray) => this.binaryOperate((a, b) => a || b ? 1 : 0, operand, "u8");

  all() {
    for (let i = 0; i < this.size; i++) {
      if (this.buffer[i] === 0) return false;
    }
    return true;
  }

  any() {
    for (let i = 0; i < this.size; i++) {
      if (this.buffer[i] !== 0) return true;
    }
    return false;
  }

  count() {
    let c = 0;
    for (let i = 0; i < this.size; i++) {
      if (this.buffer[i] !== 0) c += 1;
    }
    return c;
  }

  slice(mask: NdArray) {
    if (!mask.shape_obj.isEqual(this.shape_obj)) {
      throw new IndexError(`The shape of the mask array [${mask.shape}] must be the same as [${this.shape}]. `);
    }

    const size = this.size;
    const newSize = mask.count();
    const buffer = new this.typed_constructor(newSize);

    let t = 0;
    for (let i = 0; i < size; i++) {
      if (mask.buffer[i] !== 0) {
        buffer[t] = this.buffer[i];
        t += 1;
      }
    }

    return new NdArray([newSize, ], this.dtype, buffer);
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
