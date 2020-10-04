import { w_Shape } from "./shape";

type IndexType = u32;

export const _NdArray_constructor_p0_id = idof<Uint32Array>();
export const _NdArray_reshape_p0_id = idof<Uint32Array>();

export type w_NdArrayf64 = w_NdArray<f64>;
export type w_NdArrayf32 = w_NdArray<f32>;
export type w_NdArrayi32 = w_NdArray<i32>;
export type w_NdArrayi16 = w_NdArray<i16>;
export type w_NdArrayi8 = w_NdArray<i16>;

export const create_w_NdArrayf64 = (src: StaticArray<IndexType>): w_NdArray<f64, IndexType> => create_w_NdArray<f64>(src);
export const create_w_NdArrayf32 = (src: StaticArray<IndexType>): w_NdArray<f64, IndexType> => create_w_NdArray<f64>(src);
export const create_w_NdArrayi32 = (src: StaticArray<IndexType>): w_NdArray<f64, IndexType> => create_w_NdArray<f64>(src);
export const create_w_NdArrayi16 = (src: StaticArray<IndexType>): w_NdArray<f64, IndexType> => create_w_NdArray<f64>(src);
export const create_w_NdArrayi8 = (src: StaticArray<IndexType>): w_NdArray<f64, IndexType> => create_w_NdArray<f64>(src);


function StaticToTyped<T, IT>(src: StaticArray<T>): TypedArray<T> {
    const buf = new TypedArray<T>(src.length);
    for (let i: IT = 0; i < <IT>src.length; i++) buf[i] = src[i];
    return buf;
}


export function create_w_NdArray<R>(shape: TypedArray<IndexType>): w_NdArrayd<R> {
    return new w_NdArrayd<R, IndexType>(shape);
}


type BinaryOp<R> = (left: R, right: R) => R;


class w_NdArray<R, IT=u32> {

    readonly _shapeObj: w_Shape;
    readonly _buffer: StaticArray<R>;
    private readonly indexBuffer: StaticArray<IT>;

    constructor(shape: TypedArray<IT>, buffer: StaticArray<R> | null = null) {
        this._shapeObj = new w_Shape(shape);
        this.indexBuffer = new StaticArray<IT>(this._shapeObj.dim);
        this._buffer = buffer === null ? new StaticArray<R>(this._shapeObj.size) : buffer;
    }

    get dim(): IT {
        return this._shapeObj.dim;
    }

    get size(): IT {
        return this._shapeObj.size;
    }

    fill(value: R): void {
        const size: IT = this.size;
        for (let i: IT = 0; i < size; i++) this._buffer[i] = value;
    }

    get buffer(): StaticArray<R> {
        return this._buffer;
    }

    reshape(newShapeArray: TypedArray<IT>): w_NdArray<R, IT> {
        return new w_NdArray<R, IT>(StaticToTyped(this._shapeObj.reshape(newShapeArray).shape), this.buffer);
    }

    // flat(): w_NdArrayd {
    //     return this.reshape(new Uint32Array([<u32>this.shapeObj.size, ]));
    // }

    @inline
    unaryOperate(operator: (a: R) => R): void {
        const size = this.size;
        for (let i: IT = 0; i < size; i++) this._buffer[i] = operator(this._buffer[i]);
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
    binaryOperateScalar(operator: BinaryOp<R>, operand: R): w_NdArray<R, IT> {
        const size = this.size;
        const newBuffer = new StaticArray<R>(size);

        for (let i: IT = 0; i < this._shapeObj.size; i++) newBuffer[i] = operator(this._buffer[i], operand);
        return new w_NdArray<R, IT>(StaticToTyped(this._shapeObj.shape), newBuffer);
    }

    @inline
    binaryOperate<W, ITW>(operator: BinaryOp<R>, operand: w_NdArray<W, ITW>): w_NdArray<R, IT> {
        let resultShape = this._shapeObj.binaryWithUnsafe(operand._shapeObj);

        const dim: IT = resultShape.dim;
        const size: IT = resultShape.size;
        const newBuffer = new StaticArray<R>(size);

        for (let i: IT = 0; i < size; i++) {
            // const reveseProject = resultShape.reveseAbsoluteUnsafe(i);

            const a = this._buffer[this._shapeObj.absoluteUnsafe(this._shapeObj.reveseAbsoluteUnsafe(i))];
            const b = operand._buffer[operand._shapeObj.absoluteUnsafe(operand._shapeObj.reveseAbsoluteUnsafe(i))];
            newBuffer[i] = operator(a, b);
        }

        return new w_NdArrayd(StaticToTyped(resultShape.shape), newBuffer);
    }

    _add_op: BinaryOp<R> = (a: R, b: R) => a + b;
    _sub_op: BinaryOp<R> = (a: R, b: R) => a - b;
    _mul_op: BinaryOp<R> = (a: R, b: R) => a * b;
    _div_op: BinaryOp<R> = (a: R, b: R) => a / b;
    _pow_op: BinaryOp<R> = (a: R, b: R) => a ** b;
}
