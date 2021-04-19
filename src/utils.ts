
export type ElementType = "i8" | "i16" | "i32" |
  "u8" | "u16" | "u32" |
  "f32" | "f64" | "number";

  
export function between(x: number, l: number, r: number) {
  return l <= x && x < r;
}


export function isScalar(x: any) {
  const type = typeof x;
  return type === "number" || type === "bigint" || type === "boolean";
}


export function getTypeConstructor(dtype: ElementType) {
  switch (dtype) {
    case "i8": return Int8Array;
    case "i16": return Int16Array;
    case "i32": return Int32Array;
    case "u8": return Uint8Array;
    case "u16": return Uint16Array;
    case "u32": return Uint32Array;
    case "f32": return Float32Array;
    case "f64": return Float64Array;
    default: return Array;
  }
}
