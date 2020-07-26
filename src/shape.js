import { buildIndexError, buildRunningTimeError } from "./exception"


class Shape {

    /**
     * Return the size of a shape array. 
     * size = prod(shape)
     * @param  {Array} shape
     * @returns {Number}
     */
    static getSizeFromShape(shape) {
        let count = 1;
        for (let r of shape) count *= r;
        return count;
    }

    /**
     * Check all the dimension of a dummpy array is unify to the given shape.  
     * @param  {Array} dummy
     * @param  {Array} shape
     * @returns {Boolean}
     */
    static checkShapeUnify(dummy, shape) {
        if (dummy.length != shape[0]) {
            return false;
        }
    
        const p = shape.slice(1);
    
        for (let r of dummy) {
            if (!this.checkShapeUnify(r, p)) return false;
        }
    
        return true;
    }

    /**
     * Get the shape of a dummpy array after checking its unifity.  
     * @param  {Array} dummy
     * @returns {Uint32Array}
     */
    static getShapeFromDummy(dummy) {
        const shape = [];
    
        for (let r = dummy; !_is_scalar(r); r = dummy[0]) {
            shape.push(r.length);
        }
    
        return new Uint32Array(shape);
    }

    static getProjectileFromShape(_shape_array) {
        const dim = _shape_array.length;

        const proj = new Uint32Array(dim);

        proj[0] = 1;
        for (let i = 1; i < dim; i++) {
            proj[i] = _shape_array[dim - i] * proj[i - 1];
        }

        return proj.reverse();
    }

    /**
     * Return a shape with the given dimension, and all the size is 1. 
     * @param  {Number} dim
     */
    static ones(dim) {
        return new Shape(new Array(dim).fill(1));
    }

    /**
     * The constructor of Shape. 
     * @param  {(Array|Shape)} shape - The shape of the array. 
     */
    constructor(shapeOrArray) {
        this.shape = shapeOrArray instanceof Shape ? shapeOrArray.shape.slice(0) : new Uint32Array(shapeOrArray);
        this.dim = this.shape.length;

        this.size = Shape.getSizeFromShape(this.shape)
        this.proj = Shape.getProjectileFromShape(this.shape);
        this._index_buffer = new Uint32Array(this.dim);
    }

    /**
     * Return the size in the given dimension. 
     * @param  {Number} pos
     */
    at(pos) {
        return this.shape[pos];
    }

    binaryWith(otherShape) {
        if (this.dim !== otherShape.dim) {
            throw buildRunningTimeError(`Can not execute binary operation between ${this} and ${otherShape}. `);
        }
        
        const newShape = new Uint32Array(this.dim);
    
        for (let i = 0; i < this.dim; i++) {
            if (this.shape[i] === otherShape.shape[i]) {
                newShape[i] = this.shape[i];
                continue;
            }
    
            if (this.shape[i] === 1) {
                newShape[i] = otherShape.shape[i];
                continue;
            }
    
            if (otherShape.shape[i] === 1) {
                newShape[i] = this.shape[i];
                continue;
            }
    
            throw buildRunningTimeError(`Can not execute binary operation between ${this} and ${otherShape}. `);
        }
    
        return new Shape(newShape);
    }

    boardcast(index) {
        for (let i = 0; i < this.dim; i++) {
            this._index_buffer[i] = this.shape[i] === 1 ? 0 : index[i];
        }

        return this._index_buffer;
    }

    /**
     * Get the absolute index of the given multi-demension index. 
     * @param  {(Array|Uint32Array)} index
     * @returns {Number}
     */
    absolute(index) {
        const n = this.dim

        if (index.length !== n) {
            throw buildIndexError(`Ileagal access with (${index}) for shape (${this.shape}). `);
        }

        for (let i = 0; i < n; i++) {
            const limit = this.shape[i];
            const r = index[i];

            if (!((0 <= r && r < limit) || (0 < -r && -r <= limit))) {
                throw buildIndexError(`Ileagal access with (${index}) for shape (${this.shape}). `);
            }
        }

        let t = 0;
        for (let i = 0; i < n; i++) t += (index[i] >= 0 ? index[i] : this.shape[i] + index[i]) * this.proj[i];
        return t;
    }

    /**
     * Check if it's able to reshape and return a new Shape-object. 
     * @param  {(Array|Uint32Array)} index
     * @returns {Shape}
     */
    reshape(newShapeArray) {
        if (Shape.getSizeFromShape(newShapeArray) !== this.size) {
            throw buildRunningTimeError(`Can not be reshaped to ${newShapeArray} from ${this.shape}. `);
        }

        return new Shape(newShapeArray);
    }

    /**
     * Check if two shapes are equal. 
     * @param  {Shape} otherShape
     * @returns {Boolean}
     */
    ifEqual(otherShape) {
        if (otherShape.dim !== this.dim) return false;

        for (let i = 0; i < this.dim; i++) {
            if (this.shape[i] !== otherShape.shape[i]) return false;
        }

        return true;
    }

    toString() {
        return `(${this.shape.join(" x ")}) [${this.size}]`;
    }
}


export {
    Shape, 
}
