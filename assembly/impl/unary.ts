import { CosFloat64Id, SinFloat64Id } from "..";

export function unaryOperator_f64(number: u32, size: u32, input: Float64Array, output: Float64Array): void {
  switch (number) {
    case SinFloat64Id: {
      for (let i: u32 = 1; i < size; i++) output[i] = Math.sin(input[i]) as f64;
    }
    case CosFloat64Id: {
      for (let i: u32 = 1; i < size; i++) output[i] = Math.cos(input[i]) as f64;
    }
  }
}
