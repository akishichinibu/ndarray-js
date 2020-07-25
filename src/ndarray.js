import { buildBuffer, _is_scalar } from "./utils"
import { Shape } from "./shape";
import { buildIndexError, buildRunningTimeError } from "./exception"


class ndArray {

    constructor(shape, dtype, buffer=null) {
        this.shapeObj = new Shape(shape);

        if (buffer) {
            if (buffer.length !== this.shapeObj.size) {
                throw `Can not init a array with shape [${this.shapeObj}] by buffer with length [${buffer.length}]. `;
            }
            this.buffer = buffer;
        } else {
            this.buffer = buildBuffer(dtype, this.shapeObj.size);
        }
    }

    fill(value) {
        this.buffer.fill(value);
        return this;
    }


    static foo(shape, dtype) {
        return new ndArray(shape, dtype);
    }


    static zeros(shape, dtype) {
        const arr = ndArray.foo(shape, dtype);
        return arr.fill(0);
    }


    static ones(shape, dtype) {
        const arr = ndArray.foo(shape, dtype);
        return arr.fill(1);
    }

    
    static random(shape, dtype) {
        const arr = ndArray.foo(shape, dtype);
        for (let i = 0; i < arr.getSize(); i++) arr.buffer[i] = Math.random();
        return arr;
    }


    getDim() {
        return this.shapeObj.dim;
    }

    getSize() {
        return this.shapeObj.size;
    }

    getShape() {
        return this.shapeObj.shape;
    }


    at(...index) {
        return this.buffer[this.shapeObj.absolute(index)];
    }

    
    reshape(_new_shape) {
        return new ndArray(this.shapeObj.reshape(_new_shape), this.dtype, this.buffer);
    }


    flat() {
        return this.reshape([this.shapeObj.size, ]);
    }


    unaryOperation(operator, inplace=false) {
        const size = this.getSize();
        const buffer = inplace ? this.buffer : buildBuffer("d", size);
        
        for (let i = 0; i < size; i++) buffer[i] = operator(this.buffer[i]);
        return inplace ? this : new ndArray(this.shapeObj, "d", buffer);
    }


    binaryOperation(operator, operand, inplace=false) {
        let resultShape;

        if (_is_scalar(operand)) {
            let _equal_operand = new ndArray(Shape.ones(this.shapeObj.dim), 'd');
            _equal_operand.fill(operand);
            operand = _equal_operand;

            resultShape = this.shapeObj;
        } else {
            resultShape = this.shapeObj.binaryWith(operand.shapeObj);

            if (inplace && !this.shapeObj.ifEqual(newShape)) {
                throw buildRunningTimeError(`Inplace operation cannot change the shape. ${this.shapeObj} -> ${newShape}`);
            }
        }

        const n = resultShape.dim;
        const size = resultShape.size;
        const buffer = inplace ? this.buffer : buildBuffer("d", size);

        const indexOrthogonal = new Uint32Array(n);

        for (let index = 0; index < size; index++) {

            let t = index|0;
            for (let i = 0; i < n; i = (i + 1)|0) {
                const p = resultShape.proj[i];
                indexOrthogonal[n - 1 - i] = (t / p)|0;
                t %= p;
            }

            buffer[index] = operator(
                this.at(...this.shapeObj.boardcast(indexOrthogonal)), 
                operand.at(...operand.shapeObj.boardcast(indexOrthogonal)),
            );
        }

        return inplace ? this : new ndArray(resultShape, "d", buffer);
    }
}


export {
    ndArray,
}
