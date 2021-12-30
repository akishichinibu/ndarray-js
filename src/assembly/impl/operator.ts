import { Operator } from "../constants/op";

type UnaryOperator = (a: number) => number;
type BinaryOperator = (a: number, b: number) => number;


// @ts-ignore
@inline
function add_(a: number, b: number): number {
  return add<number>(a, b);
}


// @ts-ignore
@inline
function sub_(a: number, b: number): number {
  return sub<number>(a, b);
}


// @ts-ignore
@inline
function rand(a: number): number {
  return a * Math.random();
}


// @ts-ignore
@inline
export function getUnaryOperator(type: u32): UnaryOperator {
  switch (type) {
    case Operator.Unary.Sin: return Math.sin;
    case Operator.Unary.Cos: return Math.cos;
    case Operator.Unary.Tan: return Math.tan;
    case Operator.Unary.Rand: return rand;
    default: {
      throw new Error(`Unknown unary operator type ${type}. `);
    }
  }
}


// @ts-ignore
@inline
export function getBinaryOperator(type: u32): BinaryOperator {
  switch (type) {
    case Operator.Binary.Add: return add_;
    case Operator.Binary.Sub: return sub_;
    default: {
      throw new Error(`Unknown binary operator type ${type}. `);
    }
  }
}
