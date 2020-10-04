
export const _Shape_constructor_p0_id = idof<Uint32Array>();

export const _Shape_absoluteUnsafe_p0_id = idof<Uint32Array>();

export function create_w_Shape(shape: Uint32Array): w_Shape {
    return new w_Shape(shape);
}


export class w_Shape {

    private readonly _shape: StaticArray<u32>;

    private readonly _dim: u32;
    private readonly _size: u32;

    readonly projection: StaticArray<u32>;
    readonly restrict: StaticArray<u32>;

    private readonly buffer: Uint32Array;
    
    constructor(shape: Uint32Array) {
        this._dim = shape.length;

        this._shape = new StaticArray<u32>(this._dim);
        for (let i: u32 = 0; i < this._dim; i++) this._shape[i] = shape[i];

        this._size = w_Shape.getSizeFromShape(this._dim, this._shape);
        this.projection = w_Shape.getProjectionFromShape(this._dim, this._shape);
        this.restrict = w_Shape.getRestrictFromShape(this._dim, this._shape);

        this.buffer = new Uint32Array(this._dim);
    }

    @inline
    at(index: u32): u32 {
        return this._shape[index];
    }

    get shape(): StaticArray<u32> {
        return this._shape;
    }

    @inline
    get dim(): u32 {
        return this._dim;
    }

    @inline
    get size(): u32 {
        return this._size;
    }

    reshape(newShapeArray: Uint32Array): w_Shape {
        return new w_Shape(newShapeArray);
    }

    @inline
    private static getSizeFromShape(dim: u32, shape: StaticArray<u32>): u32 {
        let size: u32= 1;
        for (let i: u32 = 0; i < dim; i++) size *= shape[i];
        return size;
    }

    @inline
    private static getProjectionFromShape(dim: u32, shape: StaticArray<u32>): StaticArray<u32> {
        const buf = new StaticArray<u32>(dim);
        buf[dim - 1] = 1;
        for (let i: u32 = dim - 2; i > 0; i--) buf[i] = shape[i + 1] * buf[i + 1];
        buf[0] = shape[1] * buf[1];
        return buf;
    }

    @inline
    private static getRestrictFromShape(dim: u32, shape: StaticArray<u32>): StaticArray<u32> {
        const buf = new StaticArray<u32>(dim);
        buf[dim - 1] = shape[dim - 1];
        for (let i: u32 = dim - 2; i > 0; i--) buf[i] = shape[i] * buf[i + 1];
        buf[0] = shape[0] * buf[1];
        return buf;
    }

    @inline
    absoluteUnsafe(index: Uint32Array): u32 {
        let result: u32 = 0;
        for (let i: u32 = 0; i < this.dim; i++) result += index[i] * this.projection[i];
        return result;
    }

    @inline
    reveseAbsoluteUnsafe(t: u32): Uint32Array {
        for (let i: u32 = 0; i < this.dim; i++) this.buffer[i] = (t % this.restrict[i]) / this.projection[i];
        return this.buffer;
    }

    @inline
    boardcastUnsafe(index: Uint32Array): Uint32Array {
        for (let i: u32 = 0; i < this.dim; i++) this.buffer[i] = this.buffer[i] === 1 ? 0 : index[i];
        return this.buffer;
    }

    @inline
    binaryWithUnsafe(otherShape: w_Shape): w_Shape {
        const resultShape = new Uint32Array(this.dim);

        for (let i: u32 = 0; i < this.dim; i++) {
            if (this._shape[i] === otherShape._shape[i]) {
                resultShape[i] = this._shape[i];
            } else if (this._shape[i] === 1) {
                resultShape[i] = otherShape._shape[i];
            } else if (otherShape._shape[i] === 1) {
                resultShape[i] = this._shape[i];
            }
        }

        return new w_Shape(resultShape);
    }
}
