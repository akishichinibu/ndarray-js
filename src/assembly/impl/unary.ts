import { getOperator, getTypedReader, getTypedWriter } from "./accessor";
import { Console } from "as-wasi";


export function unaryOperator(operatorId: u32, size: u32, inputPtr: ArrayBuffer, inputDtype: u32, outputPtr: ArrayBuffer, outputDtype: u32): void {
  const inputView = new DataView(inputPtr);
  const outputView = new DataView(outputPtr);

  const inputAccessor = getTypedReader(inputDtype);
  const outputAccessor = getTypedWriter(outputDtype);
  const operator = getOperator(operatorId);

  for (let i: u32 = 0; i < size; i++) {
    outputAccessor(outputView, i, operator(inputAccessor(inputView, i)));
  }
}
