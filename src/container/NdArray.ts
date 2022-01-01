import { IndexError, RunningTimeError } from 'src/exception';
import { getTypeConstructor, Ptr, ScalerType } from 'src/type';
import constants from 'src/constants';

import { PtrBase } from './PtrBase';
import { Shape } from './Shape';
import { NumericVariableType, VariableType } from 'src/expr/utils';
import { isScalar } from 'src/utils';
import core from 'src/core';

interface NdArrayConstructProps {
  shape: Shape;
  dtype?: ScalerType;
  bufferPtr?: Ptr;
}

abstract class BaseNdArrayPtr extends PtrBase {
  readonly dtype: ScalerType;
  readonly shapeObj: Shape;
  readonly ptr: Ptr;

  constructor(props: NdArrayConstructProps) {
    super();
    this.shapeObj = props.shape;
    this.dtype = props.dtype ?? 'f64';

    if (!constants.dtypeWasmName.has(this.dtype)) {
      throw new RunningTimeError(`Invalid data type ${this.dtype}`);
    }

    this.ptr = props.bufferPtr ?? core.memory.allocateTypedPtr(this.dtype, this.size);
  }

  get buffer() {
    return core.memory.view(this.dtype, this.ptr, 0, this.size);
  }

  get dim() {
    return this.shapeObj.dim;
  }

  get size() {
    return this.shapeObj.size;
  }

  get byteLength() {
    return this.buffer.byteLength;
  }

  get shape() {
    return this.shapeObj.shape;
  }
}

type BinaryOperator = "add" | "sub" | "mul" | "div";

abstract class BaseNdArray extends BaseNdArrayPtr {
  at(...index: Array<number>): number {
    const [t] = this.shapeObj.linearIndex([index]);
    return this.buffer[t];
  }

  fill(value: number | BaseNdArray) {
    if (value instanceof BaseNdArray) {
      if (this.size !== value.size) {
        throw new IndexError(`The size of given value ${value.size} is not equal to size ${this.size}`);
      }

      for (let i = 0; i < this.size; i++) this.buffer[i] = value.buffer[i];
    } else {
      this.buffer.fill(value);
    }

    return this;
  }

  async binaryOperate(operator: BinaryOperator, value: NumericVariableType) {
    if (isScalar(value)) {
      const result = new NdArray({ shape: this.shapeObj });

      const [ptrV, v] = core.memory.allocateTyped("f64", 1);
      v[0] = value;

      const f = core[`operator_binary_scalar2_${operator}_${this.dtype}_f64_${result.dtype}`];
      f(this.size, this.ptr, ptrV, result.ptr);

      core.memory.free(ptrV);
      return result;
    } else {
      const v = await value;
      const resultShape = this.shapeObj.binaryOperation(v.shapeObj);
      const result = new NdArray({ shape: resultShape });

      const f = core[`operator_binary_${operator}_${this.dtype}_${v.dtype}_${result.dtype}`];
      f(this.shapeObj.ptr, this.ptr, v.shapeObj.ptr, v.ptr, result.dim, result.shapeObj.ptr, result.ptr);
      return result;
    }
  }

  async add(value: NumericVariableType) {
    return await this.binaryOperate("add", value);
  }
}

export class NdArray extends BaseNdArray {
  reshape(newShapeArray: Array<number>): NdArray {
    const newShape = this.shapeObj.reshape(newShapeArray);
    return new NdArray({
      shape: newShape,
      dtype: this.dtype,
      bufferPtr: this.ptr
    });
  }

  flat(): NdArray {
    const newShape = this.shapeObj.reshape([this.shapeObj.size]);
    return new NdArray({
      shape: newShape,
      dtype: this.dtype,
      bufferPtr: this.ptr
    });
  }

  private arrayToString(curSlice: Array<number>, maxLength: number | null = null): string {
    maxLength = maxLength === null ? Math.round(100 ** (1.0 / this.dim)) : maxLength!;
    const maxDigital = 3;

    const level: number = curSlice.length;
    const withoutPaddingHead = level === 0 || curSlice[level - 1] === 0;

    const buf = [];
    const l = this.shapeObj.at(level);

    if (level === this.dim - 1) {
      for (let i = 0; i < l; i++) {
        const element = this.at(...curSlice, i);
        const present = this.dtype[0] === 'f' ? element.toFixed(maxDigital) : `${element}`;
        buf.push(present);
        if (i > maxLength) {
          buf.push(' ...');
          break;
        }
      }
      return `${withoutPaddingHead ? '' : ' '.repeat(level)}[${buf.join(', ')}]`;
    } else {
      for (let i = 0; i < l; i++) {
        buf.push(this.arrayToString([...curSlice, i]));
        if (i > maxLength) {
          buf.push(' ...');
          break;
        }
      }
      return `${withoutPaddingHead ? '' : ' '.repeat(level)}[${buf.join(', \n')}]`;
    }
  }

  toString(): string {
    return this.arrayToString([]);
  }

  show(): void {
    console.log(`${this.shapeObj.toString()} ${this.dtype}\n${this.toString()}`);
  }
}
