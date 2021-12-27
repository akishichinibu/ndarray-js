import { NdArray } from "./container";

export function between(x: number, l: number, r: number) {
  return l <= x && x < r;
}


export function isScalar(x: any): x is number {
  const type = typeof x;
  return type === "number" || type === "bigint" || type === "boolean";
}


export function isScalarArray(a: any) {
  for (let i = 0; i < a.length; i++) {
    if (!isScalar(a[i])) return false;
  }
  return true;
}


export function isNdArray(a: any) {
  return a instanceof NdArray;
}


export function isIterable(a: any): a is Iterable<any> {
  return typeof a[Symbol.iterator] === 'function';
}
