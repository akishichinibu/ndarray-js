import { Console } from "as-wasi";

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
  export function calcLinearIndex(dim: u32, shapeData: ArrayBuffer, size: u32, input_: ArrayBuffer, output_: ArrayBuffer): void {
    const input = Uint32Array.wrap(input_, 0, dim * size);
    const output = Uint32Array.wrap(output_, 0, size);

    const projection = getProjection(dim, shapeData);

    output.fill(0);

    for (let i: u32 = 0; i < dim; i++) {
      for (let u: u32 = 0; u < size; u += 1) output[u] += input[i * size + u] * projection[i];
    }
  }

  // @ts-ignore
  @inline
  export function calcLinearReverseIndex(dim: u32, shapeData: ArrayBuffer, size: u32, input_: ArrayBuffer, output_: ArrayBuffer): void {
    const input = Uint32Array.wrap(input_, 0, size);
    const output = Uint32Array.wrap(output_, 0, dim * size);

    const projection = getProjection(dim, shapeData);
    const restrict = getRestrict(dim, shapeData);

    for (let i: u32 = 0; i < dim; i++) {
      for (let u: u32 = 0; u < size; u++) output[i * size + u] = (input[u] % restrict[i]) / projection[i];
    }
  }


  // @ts-ignore
  @inline
  export function binaryWith(dim: u32, shapeData1: ArrayBuffer, shapeData2: ArrayBuffer, size: u32, input_: ArrayBuffer, output_: ArrayBuffer): void {
    const input = Uint32Array.wrap(input_, 0, dim * size);
    const output = Uint32Array.wrap(output_, 0, dim * size);

    const shape1 = getShape(dim, shapeData1);
    const shape2 = getShape(dim, shapeData2);

    for (let i: u32 = 0; i < dim; i++) {
      for (let u: u32 = 0; u < size; u += 1) {
        if (shape1[i] === shape2[i]) {
          output[u + i * size] = input[u + i * size];
          continue;
        }

        const t1 = shape1[i];
        const t2 = shape2[i];

        if (t1 === 1) {
          output[u + i * size] = t2;
          continue;
        }

        if (t2 === 1) {
          output[u + i * size] = t1;
          continue;
        }
      }
    }
  }
}
