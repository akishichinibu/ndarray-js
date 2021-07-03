import * as kernel from "ndarray-kernel";
import { IndexError } from "./exception";
import { between, isScalar } from "./utils";


export class Shape {

  innerObject: kernel.Shape1;

  constructor(...shape: number[]) {
    const dim = shape.length;
    const memory = kernel.wasm_memory();

    const n = dim * 4;
    const ptr = kernel.alloc(n);
    const buffer = new Uint32Array(memory.buffer, ptr, n);
    for (let i = 0; i < n; i++) buffer[i] = shape[i];

    const handler = (kernel as any)[`Shape${dim}`];
    this.innerObject = handler.new(ptr) as kernel.Shape1;
  }

  // dim(): number;
  // flat_index(buf_ptr: number): number;
  // reverse_absolute_index(t: number): number;

  get dim(): number {
    return this.innerObject.dim();
  }

  get shape(): Uint32Array {
    return this.buffer.slice(Shape.META_LENGTH, Shape.META_LENGTH + this.dim);
  }

  get size(): number {
    return this.buffer[1];
  }

  //   /**
  //  * Return the size at given position. 
  //  * @param  {number} pos
  //  */
  // at(pos: number): number {
  //   if (!between(pos, 0, this.dim)) {
  //     throw new IndexError(`The position [${pos}] is out of bound [${this.shape}]. `);
  //   }
  //   return this.buffer[Shape.META_LENGTH + pos];
  // }

  static checkShapeUnify(dummy: any, shape: ArrayLike<number>): boolean {
    if (dummy.length !== shape[0]) {
      return false
    };

    if (shape.length === 1) {
      return true;
    }

    const p = Array.from(shape).slice(1);

    for (let r of dummy) {
      if (!this.checkShapeUnify(r, p)) {
        return false;
      };
    }
    
    return true;
  }

  static getShapeFromDummy(dummy: any): Uint32Array {
    if (isScalar(dummy)) {
      throw new IndexError("The given array is a scalar");
    }

    const s = [];
    for (let r = dummy; !isScalar(r); r = r[0]) s.push(r.length);

    return new Uint32Array(s);
  }

  flatIndex(index: ArrayLike<number>): number {
    // for (let i = 0; i < this._dim; i++) {
    //   if (!between(index[i], 0, this._shape[i])) {
    //     throw new IndexError(`The index [${index[i]}] is out of bounds of dimension [${this._shape[i]}]`);
    //   }
    // }
    const d = this.dim;
    for (let i = 0; i < d; i++) this.buffer[2 + 3 * d + i] = index[i];
    return kernel.shape_flat_index(d, this.projection_ptr, this.buf_ptr);
  }

  // reveseAbsoluteIndexUnsafe(t: number): Uint32Array {
  //   for (let i = 0; i < this._dim; i++) this.buffer[i] = (t % this.restrict[i]) / this.projection[i];
  //   return this.buffer;
  // }

  toString(): string {
    return `(${Array.from(this.shape).join(" x ")}) [${this.size}]`;
  }

}


export namespace nd {

  export function shape(...shape: number[]): kernel.Shape1 {
    const dim = shape.length;
    const memory = kernel.wasm_memory();

    const n = dim * 4;
    const ptr = kernel.alloc(n);
    const buffer = new Uint32Array(memory.buffer, ptr, n);
    for (let i = 0; i < n; i++) buffer[i] = shape[i];

    const handler = (kernel as any)[`Shape${dim}`];
    return handler.new(ptr) as kernel.Shape1;
  }
}


export function create_shape(...shape: number[]) {
  const memory = kernel.wasm_memory();
  const n = shape.length * 4;
  const ptr = kernel.alloc(n);
  const buffer = new Uint32Array(memory.buffer, ptr, n);
  for (let i = 0; i < n; i++) buffer[i] = shape[i];
  return kernel.Shape3.new(ptr);
}


interface ShapeObject extends kernel.Shape1 {

}


// class Shape {

//   innerObject: ShapeObject;
  
//   constructor(shape: ArrayLike<number>) {
//     const dim = shape.length;
//     const n = dim * 4;

//     const memory = kernel.wasm_memory();
//     const ptr = kernel.alloc(n);
//     const buffer = new Uint32Array(memory.buffer, ptr, n);

//     for (let i = 0; i < n; i++) buffer[i] = shape[i];

//     const handler = (kernel as any)[`Shape${dim}`];
//     this.innerObject = handler.new(ptr);
//   }

//   private static getDataView(ptr: number, length: number) {
//     const wasmMemory = kernel.wasm_memory().buffer;
//     return new Uint32Array(wasmMemory, ptr, length);
//   }

//   get shape(): Uint32Array {
//     return this.buffer.slice(Shape.META_LENGTH, Shape.META_LENGTH + this.dim);
//   }

//   get dim(): number {
//     return this.buffer[0];
//   }

//   get size(): number {
//     return this.buffer[1];
//   }

//   get buffer(): Uint32Array {
//     if (this.dataview === null || this.dataview.length === 0) {
//       this.dataview = Shape.getDataView(this.ptr, this.dataLength * Shape.BYTE_LENGTH);
//     }
//     return Shape.getDataView(this.ptr, this.dataLength * Shape.BYTE_LENGTH);
//   }

//     /**
//    * Return the size at given position. 
//    * @param  {number} pos
//    */
//   at(pos: number): number {
//     if (!between(pos, 0, this.dim)) {
//       throw new IndexError(`The position [${pos}] is out of bound [${this.shape}]. `);
//     }
//     return this.buffer[Shape.META_LENGTH + pos];
//   }

//   static checkShapeUnify(dummy: any, shape: ArrayLike<number>): boolean {
//     if (dummy.length !== shape[0]) {
//       return false
//     };

//     if (shape.length === 1) {
//       return true;
//     }

//     const p = Array.from(shape).slice(1);

//     for (let r of dummy) {
//       if (!this.checkShapeUnify(r, p)) {
//         return false;
//       };
//     }
    
//     return true;
//   }

//   static getShapeFromDummy(dummy: any): Uint32Array {
//     if (isScalar(dummy)) {
//       throw new IndexError("The given array is a scalar");
//     }

//     const s = [];
//     for (let r = dummy; !isScalar(r); r = r[0]) s.push(r.length);

//     return new Uint32Array(s);
//   }

//   flatIndex(index: ArrayLike<number>): number {
//     // for (let i = 0; i < this._dim; i++) {
//     //   if (!between(index[i], 0, this._shape[i])) {
//     //     throw new IndexError(`The index [${index[i]}] is out of bounds of dimension [${this._shape[i]}]`);
//     //   }
//     // }
//     const d = this.dim;
//     for (let i = 0; i < d; i++) this.buffer[2 + 3 * d + i] = index[i];
//     return kernel.shape_flat_index(d, this.projection_ptr, this.buf_ptr);
//   }

//   // reveseAbsoluteIndexUnsafe(t: number): Uint32Array {
//   //   for (let i = 0; i < this._dim; i++) this.buffer[i] = (t % this.restrict[i]) / this.projection[i];
//   //   return this.buffer;
//   // }

//   toString(): string {
//     return `(${Array.from(this.shape).join(" x ")}) [${this.size}]`;
//   }
// }



// class Shape {

//   private static readonly META_LENGTH = 2;
//   private static readonly BYTE_LENGTH = 4;

//   private dataview: Uint32Array | null = null;

//   private readonly ptr: number;
//   private readonly dataLength: number;

//   private readonly shape_ptr: number;
//   private readonly projection_ptr: number;
//   private readonly restrict_ptr: number;
//   private readonly buf_ptr: number;
  
//   constructor(shape: ArrayLike<number>) {
//     const _dim = shape.length;

//     if (_dim == 0) {
//       throw new IndexError("The dimension of the shape cann't not be 0. ");
//     }

//     this.dataLength = Shape.META_LENGTH + _dim * Shape.BYTE_LENGTH;
//     this.ptr = kernel.alloc(this.dataLength * Shape.BYTE_LENGTH);

//     this.shape_ptr = this.ptr + Shape.META_LENGTH * Shape.BYTE_LENGTH;
//     this.projection_ptr = this.shape_ptr + _dim * Shape.BYTE_LENGTH;
//     this.restrict_ptr = this.projection_ptr + _dim * Shape.BYTE_LENGTH;
//     this.buf_ptr = this.restrict_ptr + _dim * Shape.BYTE_LENGTH;

//     this.buffer[0] = _dim;
//     for (let i = 0; i < _dim; i++) this.buffer[i + Shape.META_LENGTH] = shape[i];
//     kernel.new_shape(this.ptr);
//   }

//   private static getDataView(ptr: number, length: number) {
//     const wasmMemory = kernel.wasm_memory().buffer;
//     return new Uint32Array(wasmMemory, ptr, length);
//   }

//   get shape(): Uint32Array {
//     return this.buffer.slice(Shape.META_LENGTH, Shape.META_LENGTH + this.dim);
//   }

//   get dim(): number {
//     return this.buffer[0];
//   }

//   get size(): number {
//     return this.buffer[1];
//   }

//   get buffer(): Uint32Array {
//     if (this.dataview === null || this.dataview.length === 0) {
//       this.dataview = Shape.getDataView(this.ptr, this.dataLength * Shape.BYTE_LENGTH);
//     }
//     return Shape.getDataView(this.ptr, this.dataLength * Shape.BYTE_LENGTH);
//   }

//     /**
//    * Return the size at given position. 
//    * @param  {number} pos
//    */
//   at(pos: number): number {
//     if (!between(pos, 0, this.dim)) {
//       throw new IndexError(`The position [${pos}] is out of bound [${this.shape}]. `);
//     }
//     return this.buffer[Shape.META_LENGTH + pos];
//   }

//   static checkShapeUnify(dummy: any, shape: ArrayLike<number>): boolean {
//     if (dummy.length !== shape[0]) {
//       return false
//     };

//     if (shape.length === 1) {
//       return true;
//     }

//     const p = Array.from(shape).slice(1);

//     for (let r of dummy) {
//       if (!this.checkShapeUnify(r, p)) {
//         return false;
//       };
//     }
    
//     return true;
//   }

//   static getShapeFromDummy(dummy: any): Uint32Array {
//     if (isScalar(dummy)) {
//       throw new IndexError("The given array is a scalar");
//     }

//     const s = [];
//     for (let r = dummy; !isScalar(r); r = r[0]) s.push(r.length);

//     return new Uint32Array(s);
//   }

//   flatIndex(index: ArrayLike<number>): number {
//     // for (let i = 0; i < this._dim; i++) {
//     //   if (!between(index[i], 0, this._shape[i])) {
//     //     throw new IndexError(`The index [${index[i]}] is out of bounds of dimension [${this._shape[i]}]`);
//     //   }
//     // }
//     const d = this.dim;
//     for (let i = 0; i < d; i++) this.buffer[2 + 3 * d + i] = index[i];
//     return kernel.shape_flat_index(d, this.projection_ptr, this.buf_ptr);
//   }

//   // reveseAbsoluteIndexUnsafe(t: number): Uint32Array {
//   //   for (let i = 0; i < this._dim; i++) this.buffer[i] = (t % this.restrict[i]) / this.projection[i];
//   //   return this.buffer;
//   // }

//   toString(): string {
//     return `(${Array.from(this.shape).join(" x ")}) [${this.size}]`;
//   }
// }

export default Shape;
