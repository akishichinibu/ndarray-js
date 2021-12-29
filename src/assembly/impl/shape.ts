

export function initShape(dim: u32, data: ArrayBuffer): void {
  const shape = Uint32Array.wrap(data, sizeof<u32>() * 0 * dim, dim);
  const projection = Uint32Array.wrap(data, sizeof<u32>() * 1 * dim, dim);
  const restrict = Uint32Array.wrap(data, sizeof<u32>() * 2 * dim, dim);
  const size = Uint32Array.wrap(data, sizeof<u32>() * 4 * dim, 1);

  calcProjection(dim, shape, projection);
  calcRestrict(dim, shape, restrict);
  size[0] = calcSize(dim, shape);
}


export function calcSize(dim: u32, shape: Uint32Array): u32 {
  let size: u32 = 1;
  for (let i: u32 = 0; i < dim; i++) size *= shape[i];
  return size;
}


export function calcProjection(dim: u32, shape: Uint32Array, result: Uint32Array): void {
  result[0] = 1;
  for (let i: u32 = 1; i < dim; i++) result[i] = shape[dim - i] * result[i - 1];
  result.reverse();
}


export function calcRestrict(dim: u32, shape: Uint32Array, result: Uint32Array): void {
  result[0] = shape[dim - 1];
  for (let i: u32 = 1; i < dim; i++) result[i] = shape[dim - 1 - i] * result[i - 1];
  result.reverse();
}


export function calcLinearIndex(dim: u32, data: Uint32Array): u32 {
  const partLength = 4 * dim;
  const projection = Uint32Array.wrap(data.buffer, 1 * partLength, partLength);
  const index = Uint32Array.wrap(data.buffer, 3 * partLength, partLength);

  let result: u32 = 0;
  for (let i: u32 = 0; i < dim; i++) result += index[i] * projection[i];
  return result;
}


export function calcLinearReverseIndex(dim: u32, index: u32, data: Uint32Array): void {
  const partLength = 4 * dim;
  const projection = Uint32Array.wrap(data.buffer, 1 * partLength, partLength);
  const restrict = Uint32Array.wrap(data.buffer, 2 * partLength, partLength);
  const buffer = Uint32Array.wrap(data.buffer, 3 * partLength, partLength);
  for (let i: u32 = 0; i < dim; i++) buffer[i] = (index % restrict[i]) / projection[i];
}
