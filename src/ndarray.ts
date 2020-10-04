import { Shape, sp } from "./shape";
import { buildRunningTimeError } from "./exception";
import { module } from "../index";
import { withPtrBuffer } from "./utils";


export namespace nd {
    export function ndarray(shape: Array<number>, init: number=0): NdArray {
        const { _NdArray_constructor_p0_id } = module.exports;
    
        const _kernel_obj = withPtrBuffer(_NdArray_constructor_p0_id, shape, (ptr) => {
            const objPtr = module.exports.create_w_NdArray_f64(ptr);
            return module.exports.w_NdArrayf64.wrap(objPtr);
        });
    
        return new NdArray(_kernel_obj).fill(init);
    }

    export function zeros(shape: Array<number>): NdArray {
        return ndarray(shape, 0);
    }

    export function ones(shape: Array<number>): NdArray {
        return ndarray(shape, 1);
    }
}


export class NdArray {

    private readonly shapeObj: Shape;
    private readonly _kernel_obj: any;
    private readonly bufferView: Float64Array;

    constructor(_kernel_obj: any) {
        this._kernel_obj = _kernel_obj;
        this.shapeObj = new Shape(module.exports.w_Shape.wrap(this._kernel_obj._shapeObj));

        const { __getArrayView } = module.exports;
        this.bufferView = __getArrayView(this._kernel_obj.buffer);
    }

    get dim(): number {
        return this._kernel_obj.dim;
    }

    get size(): number {
        return this._kernel_obj.size;
    }

    get shape(): Uint32Array {
        return this.shapeObj.shape;
    }

    fill(value: number): NdArray {
        this._kernel_obj.fill(value);
        return this;
    }

    at(...index: Array<number>): number {
        return this.bufferView[this.shapeObj.absoluteUnsafe(index)];
    }

    reshape(newShapeArray: Array<number>): NdArray {
        const { _NdArray_reshape_p0_id } = module.exports;
        const inst = withPtrBuffer(_NdArray_reshape_p0_id, newShapeArray, (ptr) => {
            return this._kernel_obj.reshape(ptr);
        });
        return new NdArray(inst);
    }

    private unaryInvoke(name: string) {
        this._kernel_obj[name]();
        return this;
    }

    log = () => this.unaryInvoke("log");
    exp = () => this.unaryInvoke("exp");
    sin = () => this.unaryInvoke("sin");
    cos = () => this.unaryInvoke("cos");
    tan = () => this.unaryInvoke("tan");
    sinh = () => this.unaryInvoke("sinh");
    cosh = () => this.unaryInvoke("cosh");
    tanh = () => this.unaryInvoke("tanh");
    asin = () => this.unaryInvoke("asin");
    acos = () => this.unaryInvoke("acos");
    atan = () => this.unaryInvoke("atan");
    asinh = () => this.unaryInvoke("asinh");
    acosh = () => this.unaryInvoke("acosh");
    atanh = () => this.unaryInvoke("atanh");

    private binaryInvoke(name: string, operand: number | NdArray) {
        let objPtr;

        if (operand instanceof NdArray) {
            this.shapeObj.binaryWithCheck(operand.shapeObj);
            objPtr = this._kernel_obj.binaryOperate(this._kernel_obj[`_${name}_op`], operand._kernel_obj);
        } else if (typeof operand === "number") {
            objPtr = this._kernel_obj.binaryOperateScalar(this._kernel_obj[`_${name}_op`], operand);
        } else {
            throw Error("ee");
        }

        return new NdArray(module.exports.w_NdArrayd.wrap(objPtr))
    }

    add = (operand: number | NdArray) => this.binaryInvoke("add", operand);
    sub = (operand: number | NdArray) => this.binaryInvoke("sub", operand);
    mul = (operand: number | NdArray) => this.binaryInvoke("mul", operand);
    div = (operand: number | NdArray) => this.binaryInvoke("div", operand);
    pow = (operand: number | NdArray) => this.binaryInvoke("pow", operand);

    private prettyString(curSlice, maxDigital = 3, maxLength = null): string {

        maxLength = maxLength === null ? Math.round(100 ** (1.0 / this.dim)) : maxLength;

        const level: number = curSlice.length;
        const withoutPaddingHead = level === 0 || curSlice[level - 1] === 0;

        if (level === this.dim - 1) {
            const valueBuffer = [];
            for (let i = 0; i < this.shapeObj.at(level); i++) {
                valueBuffer.push(this.at(...curSlice, i).toFixed(maxDigital));
                if (i > maxLength) {
                    valueBuffer.push(" ...");
                    break;
                }
            }
            return `${withoutPaddingHead ? "" : " ".repeat(level)}[${valueBuffer.join(", ")}]`;
        }

        const buf = []
        for (let i = 0; i < this.shapeObj.at(level); i++) {
            const nextSlice = [...curSlice, i];
            buf.push(this.prettyString(nextSlice));
            if (i > maxLength) {
                buf.push(" ...");
                break;
            }
        }

        return `${withoutPaddingHead ? "" : ' '.repeat(level)}[${buf.join(", \n")}]`;
    }

    toString(): string {
        return this.prettyString([]);
    }

    show(): void {
        console.log(`${this.shapeObj.toString()} \n${this.toString()}`);
    }
}
