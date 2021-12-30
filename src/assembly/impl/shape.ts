import { Uint32Reader } from "./accessor";

export namespace shape {

  // @ts-ignore
  @inline
  export function getShape(dim: u32, data: ArrayBuffer): Uint32Array {
    // return new DataView(data, sizeof<u32>() * 0 * dim, dim);
    return Uint32Array.wrap(data, sizeof<u32>() * 0 * dim, dim);
  }

  // @ts-ignore
  @inline
  export function getProjection(dim: u32, data: ArrayBuffer): Uint32Array {
    // return new DataView(data, sizeof<u32>() * 1 * dim, dim);
    return Uint32Array.wrap(data, sizeof<u32>() * 1 * dim, dim);
  }

  // @ts-ignore
  @inline
  export function getRestrict(dim: u32, data: ArrayBuffer): Uint32Array {
    // return new DataView(data, sizeof<u32>() * 2 * dim, dim);
    return Uint32Array.wrap(data, sizeof<u32>() * 2 * dim, dim);
  }

  // @ts-ignore
  @inline
  export function getBuffer(dim: u32, data: ArrayBuffer): Uint32Array {
    // return new DataView(data, sizeof<u32>() * 3 * dim, dim);
    return Uint32Array.wrap(data, sizeof<u32>() * 3 * dim, dim);
  }

  // @ts-ignore
  @inline
  export function getSize(dim: u32, data: ArrayBuffer): Uint32Array {
    // return new DataView(data, sizeof<u32>() * 4 * dim, 1);
    return Uint32Array.wrap(data, sizeof<u32>() * 4 * dim, 1);
  }

  // @ts-ignore
  @inline
  export function init(dim: u32, data: ArrayBuffer): void {
    const shape = getShape(dim, data);
    const projection = getProjection(dim, data);
    const restrict = getRestrict(dim, data);
    const size = getSize(dim, data);

    calcProjection(dim, shape, projection);
    calcRestrict(dim, shape, restrict);
    size[0] = calcSize(dim, shape);
  }

  // @ts-ignore
  @inline
  export function calcSize(dim: u32, shape: Uint32Array): u32 {
    let size: u32 = 1;
    for (let i: u32 = 0; i < dim; i++) size *= shape[i];
    return size;
  }

  // @ts-ignore
  @inline
  export function calcProjection(dim: u32, shape: Uint32Array, result: Uint32Array): void {
    result[0] = 1;
    for (let i: u32 = 1; i < dim; i++) result[i] = shape[dim - i] * result[i - 1];
    result.reverse();
  }

  // @ts-ignore
  @inline
  export function calcRestrict(dim: u32, shape: Uint32Array, result: Uint32Array): void {
    result[0] = shape[dim - 1];
    for (let i: u32 = 1; i < dim; i++) result[i] = shape[dim - 1 - i] * result[i - 1];
    result.reverse();
  }

  // @ts-ignore
  @inline
  export function calcLinearIndex(dim: u32, projection: Uint32Array, input: Uint32Array, output: Uint32Array): void {
    const n = input.length;

    if (n % dim !== 0) {
      throw new RangeError("The length of index should be divided by dim");
    }

    for (let u = 0, t = 0; u < n; u += dim, t++) {
      let result: u32 = 0;
      for (let i: u32 = 0; i < dim; i++) result += input[u + i] * projection[i];
      output[t] = result;
    }
  }

  // @ts-ignore
  @inline
  export function calcLinearReverseIndex(dim: u32, projection: Uint32Array, restrict: Uint32Array, input: Uint32Array, output: Uint32Array): void {
    const n = input.length;

    for (let u = 0; u < n; u++) {
      for (let i: u32 = 0; i < dim; i++) output[u * dim + i] = (input[u] % restrict[i]) / projection[i];
    }
  }


  export function binaryWith(dim: u32, shape1: Uint32Array, shape2: Uint32Array, input: Uint32Array, output: Uint32Array): void {
    const n = input.length;

    if (n % dim !== 0) {
      throw new RangeError("The length of index should be divided by dim");
    }

    for (let u = 0; u < n; u += dim) {
      for (let i: u32 = 0; i < dim; i++) {

        if (shape1[i] === shape2[i]) {
          output[u + i] = input[u + i];
          continue;
        }

        const t1 = shape1[i];
        const t2 = shape2[i];

        if (t1 === 1) {
          output[u + i] = t2;
          continue;
        }

        if (t2 === 1) {
          output[u + i] = t1;
          continue;
        }

        throw new RangeError("Can not execute binary operation");

      }
    }
  }
}
