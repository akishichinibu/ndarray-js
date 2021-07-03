
type IntegerLabel = "i" | "u";

type IntegerByteLength = 8 | 16 | 32;

export type IntegerType = `${IntegerLabel}${IntegerByteLength}`;

type FloatLabel = "f";

type FloatByteLength = 32 | 64;

export type FloatType = `${FloatLabel}${FloatByteLength}`;

export type ElementType = IntegerType | FloatType;


export function between(x: number, l: number, r: number) {
  return l <= x && x < r;
}


export function isScalar(x: any) {
  const type = typeof x;
  return type === "number" || type === "bigint" || type === "boolean";
}


export function getByteLength(type: ElementType) {
  return Number(type.slice(1)) >> 3;
}


export type TypedNumericArray = Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Float32Array | Float64Array;


export function getTypeConstructor(dtype: ElementType) {
  switch (dtype) {
    // case "i8": return Int8Array;
    case "i16": return Int16Array;
    case "i32": return Int32Array;
    case "u8": return Uint8Array;
    case "u16": return Uint16Array;
    case "u32": return Uint32Array;
    case "f32": return Float32Array;
    case "f64": return Float64Array;
    default: return Int8Array;
  }
}

export function ord(s: string) {
  return s.charCodeAt(0);
}

export function randomString() {
  return Array(4).fill(null).map(() => Math.random().toString(36).substr(2)).join('')
}
