
export function between(x: number, l: number, r: number) {
  return l <= x && x < r;
}


export function isScalar(x: any) {
  const type = typeof x;
  return type === "number" || type === "bigint" || type === "boolean";
}


export function isScalarArray(a: ArrayLike<any>) {
  for (let i = 0; i < a.length; i++) {
    if (!isScalar(a[i])) {
      return false;
    }
  }
  return true;
}
