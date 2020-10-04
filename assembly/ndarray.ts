import { w_Shape } from "./shape";

export const _NdArray_constructor_p0_id = idof<Uint32Array>();

export const _NdArray_reshape_p0_id = idof<Uint32Array>();


function su32ToTypedu32(src: StaticArray<u32>): Uint32Array {
    const buf = new Uint32Array(src.length);
    for (let i: u32 = 0; i < <u32>src.length; i++) buf[i] = src[i];
    return buf;
}


export function create_w_NdArray_d(shape: Uint32Array): w_NdArrayd {
    return new w_NdArrayd(shape);
}


type BinaryOp = (left: f64, right: f64) => f64;


export class w_NdArrayd {

    readonly _shapeObj: w_Shape;
    readonly _buffer: StaticArray<f64>;
    private readonly indexBuffer: StaticArray<u32>;

    constructor(shape: Uint32Array, buffer: StaticArray<f64> | null = null) {
        this._shapeObj = new w_Shape(shape);
        this.indexBuffer = new StaticArray<u32>(this._shapeObj.dim);
        this._buffer = buffer === null ? new StaticArray<f64>(this._shapeObj.size) : buffer;
    }

    get dim(): u32 {
        return this._shapeObj.dim;
    }

    get size(): u32 {
        return this._shapeObj.size;
    }

    fill(value: f64): void {
        const size: u32 = this.size;
        for (let i: u32 = 0; i < size; i++) this._buffer[i] = value;
    }

    get buffer(): StaticArray<f64> {
        return this._buffer;
    }

    reshape(newShapeArray: Uint32Array): w_NdArrayd {
        return new w_NdArrayd(su32ToTypedu32(this._shapeObj.reshape(newShapeArray).shape), this.buffer);
    }

    // flat(): w_NdArrayd {
    //     return this.reshape(new Uint32Array([<u32>this.shapeObj.size, ]));
    // }

    @inline
    unaryOperate(operator: (a: f64) => f64): void {
        const size = this.size;
        for (let i: u32 = 0; i < size; i++) this._buffer[i] = operator(this._buffer[i]);
    }

    @inline
    sin(): void {
        this.unaryOperate(Math.sin);
    }

    @inline
    cos(): void {
        this.unaryOperate(Math.cos);
    }

    @inline
    tan(): void {
        this.unaryOperate(Math.tan);
    }

    @inline
    sinh(): void {
        this.unaryOperate(Math.sinh);
    }

    @inline
    cosh(): void {
        this.unaryOperate(Math.cosh);
    }

    @inline
    tanh(): void {
        this.unaryOperate(Math.tanh);
    }

    @inline
    asin(): void {
        this.unaryOperate(Math.asin);
    }

    @inline
    acos(): void {
        this.unaryOperate(Math.acos);
    }

    @inline
    atan(): void {
        this.unaryOperate(Math.atan);
    }

    @inline
    asinh(): void {
        this.unaryOperate(Math.asinh);
    }

    @inline
    acosh(): void {
        this.unaryOperate(Math.acosh);
    }

    @inline
    atanh(): void {
        this.unaryOperate(Math.atanh);
    }

    @inline
    exp(): void {
        this.unaryOperate(Math.exp);
    }

    @inline
    log(): void {
        this.unaryOperate(Math.log);
    }

    @inline
    binaryOperateScalar(operator: (a: f64, b: f64) => f64, operand: f64): w_NdArrayd {
        const size = this.size;
        const newBuffer = new StaticArray<f64>(size);

        for (let i: u32 = 0; i < this._shapeObj.size; i++) newBuffer[i] = operator(this._buffer[i], operand);
        return new w_NdArrayd(su32ToTypedu32(this._shapeObj.shape), newBuffer);
    }

    @inline
    binaryOperate(operator: (a: f64, b: f64) => f64, operand: w_NdArrayd): w_NdArrayd {
        let resultShape = this._shapeObj.binaryWithUnsafe(operand._shapeObj);

        const dim: u32 = resultShape.dim;
        const size: u32 = resultShape.size;
        const newBuffer = new StaticArray<f64>(size);

        for (let i: u32 = 0; i < size; i++) {
            // const reveseProject = resultShape.reveseAbsoluteUnsafe(i);

            const a = this._buffer[this._shapeObj.absoluteUnsafe(this._shapeObj.reveseAbsoluteUnsafe(i))];
            const b = operand._buffer[operand._shapeObj.absoluteUnsafe(operand._shapeObj.reveseAbsoluteUnsafe(i))];
            newBuffer[i] = operator(a, b);
        }

        return new w_NdArrayd(su32ToTypedu32(resultShape.shape), newBuffer);
    }

    _add_op: BinaryOp = (a: f64, b: f64) => a + b;
    _sub_op: BinaryOp = (a: f64, b: f64) => a - b;
    _mul_op: BinaryOp = (a: f64, b: f64) => a * b;
    _div_op: BinaryOp = (a: f64, b: f64) => a / b;
    _pow_op: BinaryOp = (a: f64, b: f64) => a ** b;
}
