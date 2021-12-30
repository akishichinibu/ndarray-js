import { IndexError } from 'src/exception';
import { NumericArray } from 'src/type';
import { isScalar, isScalarArray } from 'src/utils';

export async function* checkIfShapeUnifyGenerator(anyArray: any, shape: Readonly<ArrayLike<number>>) {
  const dim = shape.length;

  if (dim === 0) {
    yield false;
    return;
  }

  const queue: Array<[any, number]> = [[anyArray, 0]];

  while (queue.length > 0) {
    const [a, dimth] = queue.shift()!;
    const targetLength = shape[dimth];
    const n = a?.length;

    if (n !== targetLength) {
      yield false;
    }

    if (dimth === dim - 1) {
      yield isScalarArray(a);
      continue;
    }

    for (let i = 0; i < n; i++) {
      queue.push([a[i], dimth + 1]);
    }
  }

  yield true;
}

export async function* fromAnyArrayGenerator(anyArray: any, buffer: NumericArray) {
  const queue: Array<[any, number]> = [[anyArray, 0]];

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

export function calcSize(dim: number, shape: ArrayLike<number>) {
  let size = 1;
  for (let i = 0; i < dim; i++) size *= shape[i];
  return size;
}

export function calcLinearIndex(dim: number, index: ArrayLike<number>, projection: Uint32Array) {
  let result = 0;
  for (let i = 0; i < dim; i++) result += index[i] * projection[i];
  return result;
}

export function calcLinearReverseIndex(
  dim: number,
  index: number,
  shape: ArrayLike<number>,
  projection: Uint32Array,
  restrict: Uint32Array,
  buffer: Uint32Array
) {
  for (let i = 0; i < dim; i++) buffer[i] = (index % restrict[i]) / projection[i];
}

export function calcProjection(dim: number, shape: ArrayLike<number>, buffer: Uint32Array) {
  buffer[0] = 1;
  for (let i = 1; i < dim; i++) buffer[i] = shape[dim - i] * buffer[i - 1];
  buffer.reverse();
}

export function calcRestrict(dim: number, shape: ArrayLike<number>, buffer: Uint32Array) {
  buffer[0] = shape[dim - 1];
  for (let i = 1; i < dim; i++) buffer[i] = shape[dim - 1 - i] * buffer[i - 1];
  buffer.reverse();
}
