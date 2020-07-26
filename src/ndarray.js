import { buildBuffer, _is_scalar } from "./utils"
import { Shape } from "./shape";
import { buildIndexError, buildRunningTimeError } from "./exception"


class NdArray {

    /**
     * Generate an array without initialization. 
     * @param  {(Array|Shape)} shape
     * @param  {String} dtype
     */
    static foo(shape, dtype) {
        return new NdArray(shape, dtype);
    }

    /**
     * Generate an array initialized by 0. 
     * @param  {(Array|Shape)} shape
     * @param  {String} dtype
     */
    static zeros(shape, dtype) {
        return NdArray.foo(shape, dtype).fill(0);
    }

    /**
     * Generate an array initialized by 1. 
     * @param  {(Array|Shape)} shape
     * @param  {String} dtype
     */
    static ones(shape, dtype) {
        return NdArray.foo(shape, dtype).fill(1);
    }

    /**
     * Generate an array initialized by random value. 
     * @param  {(Array|Shape)} shape
     * @param  {String} dtype
     */
    static random(shape, dtype) {
        const arr = NdArray.foo(shape, dtype);
        for (let i = 0; i < arr.getSize(); i++) arr.buffer[i] = Math.random();
        return arr;
    }

    /**
     * The constructor of NdArray. 
     * @param  {(Array|Shape)} shape - The shape of the array. 
     * @param  {String} dtype - TypedArray symbol. 
     * @param  {} buffer=null - To build a array from an existed buffer. 
     */
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

        this._index_buffer = new Uint32Array(this.shapeObj.dim);
    }

    /**
     * Fill the array by a given value. 
     * @param  {Number} value
     * @returns {NdArray} -- Return the reference of self. 
     */
    fill(value) {
        this.buffer.fill(value);
        return this;
    }
    
    /**
     * Return the dimension of the array. 
     * @returns {Number}
     */
    getDim() {
        return this.shapeObj.dim;
    }

    /**
     * Return the size of the array. 
     * @returns {Number}
     */
    getSize() {
        return this.shapeObj.size;
    }

    /**
     * Return the shape of the array as array. 
     * @returns {Array}
     */
    getShape() {
        return this.shapeObj.shape;
    }

    /**
     * @param  {} ...index
     * @returns {Number} 
     */
    at(...index) {
        return this.buffer[this.shapeObj.absolute(index)];
    }

    /**
     * @param {Array} newShapeArray - The new shape (Must have the same size of the current size). 
     * @returns {NdArray}
     */
    reshape(newShapeArray) {
        return new NdArray(this.shapeObj.reshape(newShapeArray), this.dtype, this.buffer);
    }

    /**
     * Flat the array to one dimension. 
     * @returns {NdArray}
     */
    flat() {
        return this.reshape([this.shapeObj.size, ]);
    }

    /**
     * Execute an unary operation.
     * The supported unary operation and its definition: 
     * 
        ("sin" => Math.sin)
        ("cos" => Math.cos)
        ("tan" => Math.tan)

        ("sinh" => Math.sinh)
        ("cosh" => Math.cosh)
        ("tanh" => Math.tanh)

        ("asin" => Math.asin)
        ("acos" => Math.acos)
        ("atan" => Math.atan)

        ("exp" => Math.exp)
        ("log" => Math.log)
        ("log2" => Math.log2)
        ("log10" => Math.log10)

        ("round" => Math.round)
        ("floor" => Math.floor)
        ("ceil" => Math.ceil)

        ("abs" => Math.abs)
        ("sign" => Math.sign)
        ("bitNot" => (a) => { !a })

        ("sqr" => (a) => { a * a })
        ("sqrt" => Math.sqrt)

        ("cube" => (a) => { a * a * a })
        ("cbrt" => Math.cbrt)
     * @param  {Function} operator
     * @param  {Boolean} inplace=false - If true, execute the operation inplace without reallocate the buffer. 
     * @example 
     * NdArray.ones([2, 3, 4]).exp().show();
     */
    unaryOperation(operator, inplace=false) {
        const size = this.getSize();
        const targetBuffer = inplace ? this.buffer : buildBuffer("d", size);
        
        for (let i = 0; i < size; i++) targetBuffer[i] = operator(this.buffer[i]);
        return inplace ? this : new NdArray(this.shapeObj, "d", targetBuffer);
    }

    /**
     * Execute a binary operation.
     * The supported binary operation and its definition: 
     * 
        ("add", (a, b) => { return a + b; })
        ("sub", (a, b) => { return a - b; })
        ("mul", (a, b) => { return a * b; })
        ("div", (a, b) => { return a / b; })
        ("mod", (a, b) => { return a % b; })

        ("bitShl", (a, b) => { return a << b; })
        ("bitShr", (a, b) => { return a >> b; })
        ("bitAnd", (a, b) => { return a & b; })
        ("bitOr", (a, b) => { return a | b; })
        ("bitXor", (a, b) => { return a ^ b; })

        ("pow", (a, b) => { return Math.pow(a, b); })
     * @param  {Function} operator
     * @param  {(Number|NdArray)} operand
     * @param  {Boolean} inplace=false - If true, execute the operation inplace without reallocate the buffer. 
     * If the size of two operands is different, a RuningTimeError will be thrown. 
     */
    binaryOperation(operator, operand, inplace=false) {
        let resultShape;

        if (_is_scalar(operand)) {
            let _equal_operand = new NdArray(Shape.ones(this.getDim()), 'd');
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

        const indexOrthogonal = this._index_buffer;

        for (let index = 0; index < size; index++) {

            let t = index|0;
            for (let i = 0; i < n; i++) {
                const p = resultShape.proj[i];
                indexOrthogonal[n - 1 - i] = (t / p)|0;
                t %= p;
            }

            buffer[index] = operator(this.at(...this.shapeObj.boardcast(indexOrthogonal)), operand.at(...operand.shapeObj.boardcast(indexOrthogonal)));
        }

        return inplace ? this : new NdArray(resultShape, "d", buffer);
    }

    static wasmBinary(shape, dtype) {
        WebAssembly
            .instantiateStreaming(fetch("random.wasm"), importObject)
            .then(obj => {
                obj.instance.exports.random();
            });
    }

    prettyString(curSlice=null, maxDigital=3, maxLength=Math.round(Math.pow(100, 1.0 / this.getDim()))) {
        if (!curSlice) curSlice = [];

        const level = curSlice.length;
        const withoutPaddingHead = level === 0 || curSlice[level - 1] === 0;
        
        if (level === this.getDim() - 1) {
            const valueBuffer = [];
            for (let i = 0; i < this.shapeObj.at(level); i++) {
                valueBuffer.push(this.at(...curSlice, i).toFixed(maxDigital));
                if (i > maxLength) {
                    valueBuffer.push(" ...");
                    break;
                }
            }
            return `${withoutPaddingHead ? "" : ' '.repeat(level)}[${valueBuffer.join(", ")}]`;
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

    toString() {
        return this.prettyString();
    }

    show() {
        console.log(`${this.shapeObj.toString()} \n${this.toString()}`);
    }
}


export {
    NdArray,
}
