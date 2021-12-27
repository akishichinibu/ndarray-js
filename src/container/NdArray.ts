import allocator, { dtypeWasmName } from "src/allocator";
import { IndexError, RunningTimeError } from "src/exception";
import { shape } from "src/shape";
import { getTypeConstructor, NumericArray, Ptr, ScalerType } from "src/type";
import { Shape } from "./Shape";
import wasm from "src/wasm";


interface NdArrayConstructProps {
  shape: Shape;
  dtype?: ScalerType;
  bufferPtr?: Ptr;
}


export class NdArray {
  readonly dtype: ScalerType;
  readonly bufferPtr: Ptr;
  readonly shapeObj: Shape;

  constructor(props: NdArrayConstructProps) {
    this.shapeObj = props.shape;
    this.dtype = props.dtype ?? "f64";

    if (!dtypeWasmName.has(this.dtype)) {
      throw new RunningTimeError(`Invalid data type ${this.dtype}`);
    }

    this.bufferPtr = props.bufferPtr ?? allocator.allocateWasm(this.dtype, this.shapeObj.size);
  }

  get dim(): number {
    return this.shapeObj.dim;
  }

  get size(): number {
    return this.shapeObj.size;
  }

  get shape() {
    return this.shapeObj.shape;
  }

  get buffer(): NumericArray {
    const name = dtypeWasmName.get(this.dtype)!;
    return wasm[`__get${name}ArrayView`](this.bufferPtr);
  }

  fill(value: number): NdArray {
    this.buffer.fill(value);
    return this;
  }

  at(...index: Array<number>): number {
    return this.buffer[this.shapeObj.linearIndex(index)];
  }

  reshape(newShapeArray: Array<number>): NdArray {
    const newShape = this.shapeObj.reshape(newShapeArray);
    return new NdArray({
      shape: newShape,
      dtype: this.dtype,
      bufferPtr: this.bufferPtr,
    });
  }

  flat(): NdArray {
    const newShape = this.shapeObj.reshape([this.shapeObj.size,]);
    return new NdArray({
      shape: newShape,
      dtype: this.dtype,
      bufferPtr: this.bufferPtr,
    });
  }

  fillBy(other: NdArray) {
    if (this.size !== other.size) {
      throw new Error("");
    }

    for (let i = 0; i < this.size; i++) this.buffer[i] = other.buffer[i];
    return this;
  }

  // /**
  //  * Execute the unary operation for current array inplace.
  //  * The type convension will NOT be handled, 
  //  * so if you execute `sin` within an array whose type is i8, 
  //  * you will get the result within interger.
  //  * 
  //  * You can use this method to avoid the copy of the buffer. 
  //  * @param operator the operator
  //  * @returns current array with executed result
  //  */
  // unaryOperate(operator: (x: number) => number): NdArray {
  //   const size = this.size;
  //   for (let i = 0; i < size; i++) this.buffer[i] = operator(this.buffer[i]);
  //   return this;
  // }

  // sin = () => this.unaryOperate(Math.sin);
  // cos = () => this.unaryOperate(Math.cos);
  // tan = () => this.unaryOperate(Math.tan);
  // sinh = () => this.unaryOperate(Math.sinh);
  // cosh = () => this.unaryOperate(Math.cosh);
  // tanh = () => this.unaryOperate(Math.tanh);

  // exp = () => this.unaryOperate(Math.exp);
  // log = () => this.unaryOperate(Math.log);
  // bitNot = () => this.unaryOperate((a) => ~a);
  // logicalNot = () => this.unaryOperate((a) => a === 0 ? 1 : 0);

  // binaryOperateScalar(operator: (a: number, b: number) => number, operand: number, dtype: ScalerType): NdArray {
  //   const typed_constructor = getTypeConstructor(dtype);
  //   const result = new typed_constructor(this.size);
  //   for (let i = 0; i < this.shapeObj.size; i++) result[i] = operator(this.buffer[i], operand);
  //   return new NdArray({
  //     shape: this.shapeObj,
  //     dtype,
  //     buffer: result,
  //   });
  // }

  // binaryOperateNdarray(operator: (a: number, b: number) => number, operand: NdArray, dtype: ScalerType): NdArray {
  //   let resultShape = this.shapeObj.binaryOperation(operand.shapeObj);

  //   const size = resultShape.size;
  //   const typed_constructor = getTypeConstructor(dtype);
  //   const result = new typed_constructor(size);

  //   for (let i = 0; i < size; i++) {
  //     const a = this.buffer[this.shapeObj.linearIndex(this.shapeObj.reverseLinearIndex(i))];
  //     const b = operand.buffer[operand.shapeObj.linearIndex(operand.shapeObj.reverseLinearIndex(i))];
  //     result[i] = operator(a, b);
  //   }

  //   return new NdArray({
  //     shape: resultShape,
  //     dtype,
  //     buffer: result,
  //   });
  // }

  // binaryOperate(operator: (a: number, b: number) => number, operand: number | NdArray, dtype: ScalerType = "f64"): NdArray {
  //   if (operand instanceof NdArray) {
  //     return this.binaryOperateNdarray(operator, operand, dtype);
  //   } else {
  //     return this.binaryOperateScalar(operator, operand, dtype);
  //   }
  // }

  // add = (operand: number | NdArray) => this.binaryOperate((a, b) => a + b, operand);
  // sub = (operand: number | NdArray) => this.binaryOperate((a, b) => a - b, operand);
  // mul = (operand: number | NdArray) => this.binaryOperate((a, b) => a * b, operand);
  // div = (operand: number | NdArray) => this.binaryOperate((a, b) => a / b, operand);
  // pow = (operand: number | NdArray) => this.binaryOperate((a, b) => a ** b, operand);
  // equal = (operand: number | NdArray) => this.binaryOperate((a, b) => a === b ? 1 : 0, operand, "u8");
  // notEqual = (operand: number | NdArray) => this.binaryOperate((a, b) => a !== b ? 1 : 0, operand, "u8");

  // bitAnd = (operand: number | NdArray) => this.binaryOperate((a, b) => a & b, operand, "u32");
  // bitOr = (operand: number | NdArray) => this.binaryOperate((a, b) => a | b, operand, "u32");
  // bitXor = (operand: number | NdArray) => this.binaryOperate((a, b) => a ^ b, operand, "u32");
  // bitShl = (operand: number | NdArray) => this.binaryOperate((a, b) => a << b, operand, "u32");
  // bitShr = (operand: number | NdArray) => this.binaryOperate((a, b) => a >> b, operand, "u32");
  // logicalAnd = (operand: number | NdArray) => this.binaryOperate((a, b) => a && b, operand, "u8");
  // logicalOr = (operand: number | NdArray) => this.binaryOperate((a, b) => a || b ? 1 : 0, operand, "u8");

  // all() {
  //   for (let i = 0; i < this.size; i++) {
  //     if (this.buffer[i] === 0) return false;
  //   }
  //   return true;
  // }

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

  // slice(mask: NdArray) {
  //   if (!mask.shapeObj.isEqual(this.shapeObj)) {
  //     throw new IndexError(`The shape of the mask array [${mask.shape}] must be the same as [${this.shape}]. `);
  //   }

  //   const size = this.size;
  //   const newSize = mask.count();
  //   const buffer = new this.TypedConstructor(newSize);

  //   let t = 0;
  //   for (let i = 0; i < size; i++) {
  //     if (mask.buffer[i] !== 0) {
  //       buffer[t] = this.buffer[i];
  //       t += 1;
  //     }
  //   }

  //   const newShape = shape([newSize,]);

  //   return new NdArray({
  //     shape: newShape,
  //     dtype: this.dtype,
  //     buffer,
  //   });
  // }

  private prettyString(curSlice: Array<number>, maxLength: number | null = null): string {
    maxLength = maxLength === null ? Math.round(100 ** (1.0 / this.dim)) : maxLength!;
    const maxDigital = 3;

    const level: number = curSlice.length;
    const withoutPaddingHead = level === 0 || curSlice[level - 1] === 0;

    const buf = []
    const l = this.shapeObj.at(level);

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
    console.log(`${this.shapeObj.toString()} ${this.dtype}\n${this.toString()}`);
  }
}
