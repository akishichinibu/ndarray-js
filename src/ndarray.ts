import core from 'src/core';

import { fromAnyArrayGenerator } from './container/utils';
import { isScalar } from './utils';
import { IndexError, RunningTimeError } from './exception';
import { Shape, NdArray } from './container';
import { CouldBePromise, ScalerType } from './type';
import sp from './shape';

type GenericShape = ArrayLike<number> | Shape;
type GenericOperand = NdArray | number;

async function array(dummy: any, dtype: ScalerType = 'f64') {
  let shapeArray: Uint32Array;

  try {
    shapeArray = await Shape.getShapeFromAnyArray(dummy);
  } catch (e) {
    throw new IndexError('The given array is not iterable. ');
  }

  if (!(await Shape.checkIfShapeUnify(dummy, shapeArray))) {
    throw new IndexError(`The given array is not fit to shape ${shapeArray}`);
  }

  const shape = new Shape(shapeArray);
  const array = new NdArray({ shape, dtype });

  const tasks = fromAnyArrayGenerator(dummy, array.buffer);
  for await (let _ of tasks) {
  }

  return array;
}

function fromShape(shape_: GenericShape, dtype: ScalerType = 'f64') {
  const s = shape_ instanceof Shape ? shape_ : sp.shape(shape_);
  return new NdArray({ shape: s, dtype });
}

interface FillOptions {
  dtype?: ScalerType;
}

async function fill(shape_: GenericShape, value: number, options?: FillOptions) {
  const a = fromShape(shape_, options?.dtype);

  const [vPtr, v] = core.memory.allocateTyped(a.dtype, 1);
  v[0] = value;
  
  const f = core[`operator_fill_${a.dtype}`];
  f(a.size, a.ptr, vPtr);
  core.memory.free(vPtr);
  return a;
}

async function zeros(shape_: GenericShape, options?: FillOptions) {
  return await fill(shape_, 0, options);
}

async function ones(shape_: GenericShape, options?: FillOptions) {
  return await fill(shape_, 1, options);
}

interface RandomOptions {
  dtype?: ScalerType;
  maxValue?: number;
}

async function random(shape_: GenericShape, options?: RandomOptions) {
  const a = fromShape(shape_, options?.dtype);
  for (let i = 0; i < a.size; i++) a.buffer[i] = Math.random() * (options?.maxValue ?? 1);
  // const f = core[`operator_fill_${a.dtype}`];
  // f(a.size, a.ptr, 1);
  return a;
}

type UnaryOperator = (operand: NdArray) => Promise<NdArray>;


type UnaryOperatorSymbol = "sin" | "cos" | "tan" | "exp" | "ln";

async function unaryOperate(operand_: CouldBePromise<NdArray>, operator: UnaryOperatorSymbol, dtype: ScalerType): Promise<NdArray> {
  const operand = await operand_;
  const size = operand.size;
  const result = new NdArray({ shape: operand.shapeObj, dtype });

  const f = core[`operator_unary_${operator}_${operand.dtype}_${dtype}`];
  f(size, operand.ptr, result.ptr);
  return result;
}

const _ = {
  array,
  zeros,
  ones,
  random
};

const handler: ProxyHandler<any> = {
  get: (obj: any, props: any) => {
    if (props in obj) {
      return obj[props];
    }

    switch (props) {
      case 'sin':
      case 'cos': {
        obj[props] = (operand: NdArray) => unaryOperate(operand, props, 'f64');
        return obj[props];
      }
      default: {
        throw new RunningTimeError(`Unknown operator ${props}`);
      }
    }
  }
};

interface Nd {
  array: typeof array;
  zeros: typeof zeros;
  ones: typeof ones;
  random: typeof random;

  sin: UnaryOperator;
  cos: UnaryOperator;
}

const nd = new Proxy(_, handler) as Nd;

export default nd;

// export const cos = (operand: NdArray, dtype: ScalerType = 'f64') => unaryOperate(operand, Math.cos, dtype);
// export const tan = (operand: NdArray, dtype: ScalerType = 'f64') => unaryOperate(operand, Math.tan, dtype);
// export const sinh = (operand: NdArray, dtype: ScalerType = 'f64') => unaryOperate(operand, Math.sinh, dtype);
// export const cosh = (operand: NdArray, dtype: ScalerType = 'f64') => unaryOperate(operand, Math.cosh, dtype);
// export const tanh = (operand: NdArray, dtype: ScalerType = 'f64') => unaryOperate(operand, Math.tanh, dtype);
// export const exp = (operand: NdArray, dtype: ScalerType = 'f64') => unaryOperate(operand, Math.exp, dtype);
// export const log = (operand: NdArray, dtype: ScalerType = 'f64') => unaryOperate(operand, Math.log, dtype);
