import { Float64ArrayId, Int32ArrayId, Int8ArrayId, Uint32ArrayId } from "..";


type Reader = (view: DataView, offset: i32) => number;
type Writer = (view: DataView, offset: i32, value: number) => void;
type UnaryOperator = (s: number) => number;


function Int8Reader(view: DataView, offset: i32): i8 {
  return view.getInt8(offset) as i8;
}


function Int8Writer(view: DataView, offset: i32, value: i8): void {
  return view.setInt8(offset, value);
}


function Int32Reader(view: DataView, offset: i32): i32 {
  return view.getInt32(offset * sizeof<i32>()) as i32;
}


function Int32Writer(view: DataView, offset: i32, value: i32): void {
  return view.setInt32(offset * sizeof<i32>(), value);
}


function Uint32Reader(view: DataView, offset: i32): u32 {
  return view.getUint32(offset * sizeof<u32>()) as u32;
}


function Uint32Writer(view: DataView, offset: i32, value: u32): void {
  return view.setUint32(offset * sizeof<u32>(), value);
}


function Float64Reader(view: DataView, offset: i32): f64 {
  return view.getFloat64(offset * sizeof<f64>()) as f64;
}


function Float64Writer(view: DataView, offset: i32, value: f64): void {
  return view.setFloat64(offset * sizeof<f64>(), value);
}


export function getOperator(type: u32): UnaryOperator {
  switch (type) {
    case 1: return Math.sin;
    default: {
      throw new Error(`Unknown data type ${type}. `);
    }
  }
}


export function getTypedReader(dtype: u32): Reader {
  switch (dtype) {
    case Int8ArrayId: return Int8Reader;
    case Int32ArrayId: return Int32Reader;
    case Uint32ArrayId: return Uint32Reader;
    case Float64ArrayId: return Float64Reader;
    default: {
      throw new Error(`Unknown data type ${dtype}. `);
    }
  }
}


export function getTypedWriter(dtype: u32): Writer {
  switch (dtype) {
    case Int8ArrayId: return Int8Writer;
    case Int32ArrayId: return Int32Writer;
    case Uint32ArrayId: return Uint32Writer;
    case Float64ArrayId: return Float64Writer;
    default: {
      throw new Error(`Unknown data type ${dtype}. `);
    }
  }
}
