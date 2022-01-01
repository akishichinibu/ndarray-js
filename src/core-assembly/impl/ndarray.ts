import { getTypedWriter } from './accessor';

export namespace ndarray {
  export function fill(size: u32, data: ArrayBuffer, dtype: u32, value: number): void {
    const view = new DataView(data);
    const accessor = getTypedWriter(dtype);
    for (let i: u32 = 0; i < size; i++) accessor(view, i, value);
  }

  export function randomFill(size: u32, data: ArrayBuffer, dtype: u32, maxValue: f64 = 1): void {
    const view = new DataView(data);
    const accessor = getTypedWriter(dtype);
    for (let i: u32 = 0; i < size; i++) accessor(view, i, Math.random() * maxValue);
  }
}
