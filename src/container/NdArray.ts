import allocator from "src/allocator";
import { IndexError, RunningTimeError } from "src/exception";
import { Ptr, ScalerType } from "src/type";
import constants from "src/constants";
import { Shape } from "./Shape";
import wasm from "src/wasm";
import { PtrBase } from "./PtrBase";


interface NdArrayConstructProps {
  shape: Shape;
  dtype?: ScalerType;
  bufferPtr?: Ptr;
}


abstract class BaseNdArray extends PtrBase {

  readonly dtype: ScalerType;
  readonly shapeObj: Shape;
  readonly ptr: Ptr;

  constructor(props: NdArrayConstructProps) {
    super();
    this.shapeObj = props.shape;
    this.dtype = props.dtype ?? "f64";

    if (!constants.dtypeWasmName.has(this.dtype)) {
      throw new RunningTimeError(`Invalid data type ${this.dtype}`);
    }

    this.ptr = props.bufferPtr ?? allocator.allocateBufferWasm(this.size * 8);
  }

  get buffer() {
    return new Float64Array(wasm.memory?.buffer!, this.ptr, this.size);
  }

  get dim() {
    return this.shapeObj.dim;
  }

  get size() {
    return this.shapeObj.size;
  }

  get shape() {
    return this.shapeObj.shape;
  }

}


export class NdArray extends BaseNdArray {

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
      bufferPtr: this.ptr,
    });
  }

  flat(): NdArray {
    const newShape = this.shapeObj.reshape([this.shapeObj.size,]);
    return new NdArray({
      shape: newShape,
      dtype: this.dtype,
      bufferPtr: this.ptr,
    });
  }

  fillBy(other: NdArray) {
    if (this.size !== other.size) {
      throw new Error("");
    }

    for (let i = 0; i < this.size; i++) this.buffer[i] = other.buffer[i];
    return this;
  }

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
