import { getTypedReader, getTypedWriter } from './accessor';
import { getUnaryOperator } from './operator';

export function unaryOperator(
  operatorId: u32,
  size: u32,

  inputPtr: ArrayBuffer,
  inputDtype: i32,
  outputPtr: ArrayBuffer,
  outputDtype: i32
): void {
  const inputView = new DataView(inputPtr);
  const outputView = new DataView(outputPtr);

  const inputAccessor = getTypedReader(inputDtype);
  const outputAccessor = getTypedWriter(outputDtype);
  const operator = getUnaryOperator(operatorId);

  for (let i: u32 = 0; i < size; i++) {
    const v = inputAccessor(inputView, i);
    const rv = operator(v);
    outputAccessor(outputView, i, rv);
  }
}
