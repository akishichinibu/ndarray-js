import { shape } from '..';
import { Console } from 'as-wasi';
import { getTypedReader, getTypedWriter, Uint32Reader } from './accessor';
import { getBinaryOperator, getUnaryOperator } from './operator';

export function binaryScalar1Operator(
  operatorId: u32,
  size: u32,

  input1Value: number,
  input2Ptr: ArrayBuffer,
  input2Dtype: u32,

  outputPtr: ArrayBuffer,
  outputDtype: u32
): void {
  const input2View = new DataView(input2Ptr);
  const outputView = new DataView(outputPtr);

  const input2Accessor = getTypedReader(input2Dtype);
  const outputAccessor = getTypedWriter(outputDtype);
  const operator = getBinaryOperator(operatorId);

  for (let i: u32 = 0; i < size; i++) {
    outputAccessor(outputView, i, operator(input1Value, input2Accessor(input2View, i)));
  }
}

export function binaryScalar2Operator(
  operatorId: u32,
  size: u32,

  input1Ptr: ArrayBuffer,
  input1Dtype: u32,
  input2Value: number,

  outputPtr: ArrayBuffer,
  outputDtype: u32
): void {
  const input1View = new DataView(input1Ptr);
  const outputView = new DataView(outputPtr);

  const input1Accessor = getTypedReader(input1Dtype);
  const outputAccessor = getTypedWriter(outputDtype);
  const operator = getBinaryOperator(operatorId);

  for (let i: u32 = 0; i < size; i++) {
    const v1 = input1Accessor(input1View, i);
    const v2 = input2Value;
    const rv = operator(v1, v2);
    outputAccessor(outputView, i, rv);
  }
}

export function binaryOperator(
  operatorId: u32,

  shapeData1: ArrayBuffer,
  input1Ptr: ArrayBuffer,
  input1Dtype: u32,

  shapeData2: ArrayBuffer,
  input2Ptr: ArrayBuffer,
  input2Dtype: u32,

  dim: u32,
  shapeData: ArrayBuffer,
  outputPtr: ArrayBuffer,
  outputDtype: u32
): void {
  const input1View = new DataView(input1Ptr);
  const input2View = new DataView(input2Ptr);
  const outputView = new DataView(outputPtr);

  const input1Accessor = getTypedReader(input1Dtype);
  const input2Accessor = getTypedReader(input2Dtype);
  const outputAccessor = getTypedWriter(outputDtype);
  const operator = getBinaryOperator(operatorId);

  const batch: u32 = 64;
  const inputBuffer = new Uint32Array(batch);
  const reverseIndexBuffer = new Uint32Array(batch * dim);
  const reverseIndexBuffer1 = new Uint32Array(batch * dim);
  const reverseIndexBuffer2 = new Uint32Array(batch * dim);

  const indexBuffer1 = new Uint32Array(batch * 1);
  const indexBuffer2 = new Uint32Array(batch * 1);

  const size = shape.getSize(dim, shapeData)[0];

  for (let i: u32 = 0; i < size; i += batch) {
    for (let u: u32 = 0; u < batch; u++) inputBuffer[u] = i + u;

    shape.calcLinearReverseIndex(dim, shapeData, batch, inputBuffer.buffer, reverseIndexBuffer.buffer);
    shape.binaryWith(dim, shapeData, shapeData1, batch, reverseIndexBuffer.buffer, reverseIndexBuffer1.buffer);
    shape.binaryWith(dim, shapeData, shapeData2, batch, reverseIndexBuffer.buffer, reverseIndexBuffer2.buffer);

    shape.calcLinearIndex(dim, shapeData1, batch, reverseIndexBuffer1.buffer, indexBuffer1.buffer);
    shape.calcLinearIndex(dim, shapeData2, batch, reverseIndexBuffer2.buffer, indexBuffer2.buffer);

    for (let u: u32 = 0; u < batch && i + u < size; u++) {
      const v1 = input1Accessor(input1View, indexBuffer1[u]);
      const v2 = input2Accessor(input2View, indexBuffer2[u]);
      const rv = operator(v1, v2);
      outputAccessor(outputView, i, rv);
    }
  }
}
