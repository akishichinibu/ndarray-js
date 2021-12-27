export function calcSize(dim: u32, shape: Uint32Array): u32 {
  let size: u32 = 1;
  for (let i: u32 = 0; i < dim; i++) size *= shape[i];
  return size;
}


export function calcProjection(dim: u32, shape: Uint32Array, buffer: Uint32Array): void {
  buffer[0] = 1;
  for (let i: u32 = 1; i < dim; i++) buffer[i] = shape[dim - i] * buffer[i - 1];
  buffer.reverse();
}


export function calcRestrict(dim: u32, shape: Uint32Array, buffer: Uint32Array): void {
  buffer[0] = shape[dim - 1];
  for (let i: u32 = 1; i < dim; i++) buffer[i] = shape[dim - 1 - i] * buffer[i - 1];
  buffer.reverse();
}


export function calcLinearIndex(dim: u32, index: Uint32Array, projection: Uint32Array): u32 {
  let result: u32 = 0;
  for (let i: u32 = 0; i < dim; i++) result += index[i] * projection[i];
  return result;
}


export function calcLinearReverseIndex(dim: u32, index: u32, projection: Uint32Array, restrict: Uint32Array, buffer: Uint32Array): void {
  for (let i: u32 = 0; i < dim; i++) buffer[i] = (index % restrict[i]) / projection[i];
}
