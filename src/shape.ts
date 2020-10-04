import { buildIndexError, buildRunningTimeError } from "./exception";
import { module } from "../index";
import { withPtrBuffer } from "./utils";

export namespace sp {

    export function shape(_shape: Array<number>) {
        const { _Shape_constructor_p0_id } = module.exports;
    
        const _kernel_obj = withPtrBuffer(_Shape_constructor_p0_id, _shape, (ptr) => {
            const objPtr = module.exports.create_w_Shape(ptr);
            return module.exports.w_Shape.wrap(objPtr);
        });
    
        return new Shape(_kernel_obj);
    }

    export function ones(dim: number): Shape {
        return shape(new Array<number>(dim).fill(1));
    }
}


export class Shape {

    private readonly _shape: Uint32Array;
    private readonly _kernel_obj: any;
    
    constructor(_kernel_obj: any) {
        this._kernel_obj = _kernel_obj;
        const { __getArrayView } = module.exports;
        this._shape = __getArrayView(this._kernel_obj.shape);
    }

    private static getSizeFromShape(shape: ArrayLike<number>): number {
        let size: number= 1;
        for (let i = 0; i < shape.length; i++) size *= shape[i];
        return size;
    }
    
    get size(): number {
        return this._kernel_obj.size;
    }

    get dim(): number {
        return this._kernel_obj.dim;
    }

    get shape(): Uint32Array {
        return this._shape;
    }

    at(pos: number): number {
        return this._shape[pos];
    }
    
    // static checkShapeUnify(dummy: any, shape): boolean {
    //     if (dummy.length != shape[0]) return false;

    //     const p = shape.slice(1);

    //     for (let r of dummy) {
    //         if (!this.checkShapeUnify(r, p)) return false;
    //     }

    //     return true;
    // }

    // static getShapeFromDummy(dummy: ArrayLike<any> | scalar): Uint32Array {
    //     const shape = [];

    //     if (!isScalar(dummy)) {
    //         for (let r = dummy; !isScalar(r); r = dummy[0]) shape.push(r.length);
    //     }

    //     return new Uint32Array(shape);
    // }

    absoluteUnsafe(index: Array<number>): number {
        const { _Shape_absoluteUnsafe_p0_id } = module.exports;
        return withPtrBuffer<number>(_Shape_absoluteUnsafe_p0_id, index, (ptr) => this._kernel_obj.absoluteUnsafe(ptr));
    }

    reshape(newShape: ArrayLike<number>): Shape {
        const _buffer = Array.from(newShape);

        if (Shape.getSizeFromShape(_buffer) !== this.size) {
            throw buildRunningTimeError(`Can not be reshaped to ${_buffer} from ${this.shape}. `);
        }

        return sp.shape(_buffer);
    }

    binaryWithCheck(otherShape: Shape): void {
        if (this.dim !== otherShape.dim) {
            throw buildRunningTimeError(`Can not execute binary operation between ${this.shape} and ${otherShape.shape}. `);
        }

        for (let i = 0; i < this.dim; i++) {
            if (this.shape[i] === otherShape.shape[i]) {
                continue;
            }

            if (this.shape[i] === 1) {
                continue;
            }

            if (otherShape.shape[i] === 1) {
                continue;
            }

            throw buildRunningTimeError(`Can not execute binary operation between ${this.shape} and ${otherShape.shape}. `);
        }
    }

    toString(): string {
        return `(${Array.from(this._shape).join(" x ")}) [${this.size}]`;
    }
}
