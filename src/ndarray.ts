import { IndexError } from "./exception";
import { Shape, NdArray } from "./container";
import { getTypeConstructor, NumericArray, ScalerType } from "./type";
import { isScalar } from "./utils";


async function* fromAnyArrayGenerator(anyArray: any, buffer: NumericArray) {
  const queue: Array<[any, number]> = [[anyArray, 0],];

  while (queue.length > 0) {
    const [a, offset] = queue.shift()!;
    const length: number = a.length ?? 0;

    if (length === 0) {
      throw new IndexError(`Got an empty array with size 0 in pos ${offset}`);
    }

    const isScalarVector = isScalar(a[0]);

    if (isScalarVector) {
      for (let i = 0; i < length; i++) buffer[offset + i] = a[i];
    } else {
      for (let i = 0; i < length; i++) {
        queue.unshift([a[i], offset + i * length]);
      }
    }

    yield;
  }
}


export async function array(dummy: any, dtype: ScalerType = 'f64') {
  let shapeArray: Uint32Array;

  try {
    shapeArray = Shape.getShapeFromAnyArray(dummy);
  } catch (e) {
    throw new IndexError("The given array is not iterable. ");
  }

  if (!Shape.checkIfShapeUnify(dummy, shapeArray)) {
    throw new IndexError(`The given array is not fit to shape ${shapeArray}`);
  }

  const shape = new Shape(shapeArray);

  const TypedConstructor = getTypeConstructor(dtype);
  const buffer = new TypedConstructor(shape.size);

  const tasks = fromAnyArrayGenerator(dummy, buffer);
  for await (let _ of tasks) { }

  return new NdArray({
    shape,
    dtype,
    buffer,
  });
}



/**
 * create an array whose all elements are 0 with the given shape.
 * @param shape the shape of the array
 * @param dtype the type of the array
 * @example
 * // output [[0, 0], [0, 0]]
 * const s = nd.zeros([2, 2], "i8");
 * s.show();
 * @returns 
 */
export function zeros(shape: Array<number>, dtype: ScalerType = 'f64'): NdArray {
  return new NdArray({shape, dtype}).fill(0);
}

export function ones(shape: Array<number>, dtype: ScalerType = 'f64'): NdArray {
  return new NdArray({shape, dtype}).fill(1);
}

export function random(shape: Array<number>): NdArray {
  const r = zeros(shape);
  const buffer = r.buffer;
  for (let i = 0; i < r.size; i++) buffer[i] = Math.random();
  return r;
}

function unaryOperate(operand: NdArray, operator: (x: number) => number, dtype: ScalerType): NdArray {
  const size = operand.size;
  const BufferType = getTypeConstructor(dtype);
  const buffer = new BufferType(size);
  const originBuffer = operand.buffer;
  for (let i = 0; i < size; i++) buffer[i] = operator(originBuffer[i]);
  return new NdArray({
    shape: operand.shape, 
    dtype, 
    buffer,
  });
}

export const sin = (operand: NdArray, dtype: ScalerType = 'f64') => unaryOperate(operand, Math.sin, dtype);
export const cos = (operand: NdArray, dtype: ScalerType = 'f64') => unaryOperate(operand, Math.cos, dtype);
export const tan = (operand: NdArray, dtype: ScalerType = 'f64') => unaryOperate(operand, Math.tan, dtype);
export const sinh = (operand: NdArray, dtype: ScalerType = 'f64') => unaryOperate(operand, Math.sinh, dtype);
export const cosh = (operand: NdArray, dtype: ScalerType = 'f64') => unaryOperate(operand, Math.cosh, dtype);
export const tanh = (operand: NdArray, dtype: ScalerType = 'f64') => unaryOperate(operand, Math.tanh, dtype);
export const exp = (operand: NdArray, dtype: ScalerType = 'f64') => unaryOperate(operand, Math.exp, dtype);
export const log = (operand: NdArray, dtype: ScalerType = 'f64') => unaryOperate(operand, Math.log, dtype);


export {
  NdArray,
}
