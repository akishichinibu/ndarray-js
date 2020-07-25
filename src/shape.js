import { buildIndexError, buildRunningTimeError } from "./exception"


class Shape {

    static getSizeFromShape(shape) {
        let count = 1;
        for (let r of shape) count *= r;
        return count;
    }

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
        proj[dim - 1] = 1;
        
        for (let i = dim - 2; i >= 0; i--) {
            proj[i] = _shape_array[dim - 2 - i] * proj[i + 1];
        }

        return proj;
    }

    static ones(dim) {
        const _shape_buffer = [];
        for (let i = 0; i < dim; i++) _shape_buffer.push(1);
        return new Shape(_shape_buffer);
    }

    constructor(_shape) {
        if (_shape instanceof Shape) {
            this.shape = _shape.shape.slice(0);
        } else {
            this.shape = new Uint32Array(_shape);
        }
        
        this.dim = this.shape.length;
        this.size = Shape.getSizeFromShape(this.shape)
        this.proj = Shape.getProjectileFromShape(this.shape);
        this._index_buffer = new Uint32Array(this.dim);
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

    absolute(index) {
        const n = this.dim

        if (index.length !== n) {
            throw buildIndexError(`Ileagal access with (${index}) for shape (${this.shape}). `);
        }

        for (let i = 0; i < n; i++) {
            if (!(0 <= index[i] && index[i] < this.shape[i])) {
                throw buildIndexError(`Ileagal access with (${index}) for shape (${this.shape}). `);
            }
        }

        let t = 0;
        for (let i = 0; i < n; i++) t += index[i] * this.proj[i];
        return t;
    }

    reshape(_new_shape) {
        const newShape = new Shape(_new_shape);

        if (newShape.size !== this.size) {
            throw buildRunningTimeError(`Can not be reshaped to ${newShape} from ${this.shape}. `);
        }

        return newShape;
    }

    ifEqual(otherShape) {
        if (otherShape.dim !== this.dim) return false;

        for (let i = 0; i < this.dim; i++) {
            if (this.shape[i] !== otherShape.shape[i]) {
                return false;
            }
        }

        return true;
    }

    toString() {
        return this.shape.toString();
    }
}


export {
    Shape, 
}
