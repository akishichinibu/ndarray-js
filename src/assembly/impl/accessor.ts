import { TypedId } from "../constants/id";


type Reader = (view: DataView, offset: i32) => number;
type Writer = (view: DataView, offset: i32, value: number) => void;


// @ts-ignore: decorator
@inline
function Int8Reader(view: DataView, offset: i32): i8 {
  return view.getInt8(offset) as i8;
}


// @ts-ignore: decorator
@inline
function Int8Writer(view: DataView, offset: i32, value: i8): void {
  return view.setInt8(offset, value);
}


// @ts-ignore: decorator
@inline
function Int32Reader(view: DataView, offset: i32): i32 {
  return view.getInt32(offset * sizeof<i32>(), true) as i32;
}


// @ts-ignore: decorator
@inline
function Int32Writer(view: DataView, offset: i32, value: i32): void {
  return view.setInt32(offset * sizeof<i32>(), value, true);
}


// @ts-ignore: decorator
@inline
export function Uint32Reader(view: DataView, offset: i32): u32 {
  return view.getUint32(offset * sizeof<u32>(), true) as u32;
}


// @ts-ignore: decorator
@inline
function Uint32Writer(view: DataView, offset: i32, value: u32): void {
  return view.setUint32(offset * sizeof<u32>(), value, true);
}


// @ts-ignore: decorator
@inline
function Float64Reader(view: DataView, offset: i32): f64 {
  return view.getFloat64(offset * sizeof<f64>(), true) as f64;
}


// @ts-ignore: decorator
@inline
function Float64Writer(view: DataView, offset: i32, value: f64): void {
  return view.setFloat64(offset * sizeof<f64>(), value, true);
}


// @ts-ignore: decorator
@inline
export function getTypedReader(dtype: u32): Reader {
  switch (dtype) {
    case TypedId.Int8ArrayId: return Int8Reader;
    case TypedId.Int32ArrayId: return Int32Reader;
    case TypedId.Uint32ArrayId: return Uint32Reader;
    case TypedId.Float64ArrayId: return Float64Reader;
    default: {
      throw new Error(`Unknown data type ${dtype}. `);
    }
  }
}


// @ts-ignore: decorator
@inline
export function getTypedWriter(dtype: u32): Writer {
  switch (dtype) {
    case TypedId.Int8ArrayId: return Int8Writer;
    case TypedId.Int32ArrayId: return Int32Writer;
    case TypedId.Uint32ArrayId: return Uint32Writer;
    case TypedId.Float64ArrayId: return Float64Writer;
    default: {
      throw new Error(`Unknown data type ${dtype}. `);
    }
  }
}
