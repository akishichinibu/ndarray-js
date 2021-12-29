import { IndexError, RunningTimeError } from "./exception";
import { Shape, NdArray } from "./container";
import { ScalerType } from "./type";
import sp from "./shape";
import { fromAnyArrayGenerator } from "./container/utils";

import c from "src/constant";
import wasm, { dtypeIdMap } from "src/wasm";


type GenericShape = ArrayLike<number> | Shape;


async function array(dummy: any, dtype: ScalerType = 'f64') {
  let shapeArray: Uint32Array;

  try {
    shapeArray = await Shape.getShapeFromAnyArray(dummy);
  } catch (e) {
    throw new IndexError("The given array is not iterable. ");
  }

  if (!await Shape.checkIfShapeUnify(dummy, shapeArray)) {
    throw new IndexError(`The given array is not fit to shape ${shapeArray}`);
  }

  const shape = new Shape(shapeArray);
  const array = new NdArray({ shape, dtype });

  const tasks = fromAnyArrayGenerator(dummy, array.buffer);
  for await (let _ of tasks) { }

  return array;
}


function fromShape(shape_: GenericShape, dtype: ScalerType = 'f64') {
  const s = shape_ instanceof Shape ? shape_ : sp.shape(shape_);
  return new NdArray({ shape: s, dtype });
}


function zeros(shape_: GenericShape, dtype: ScalerType = 'f64'): NdArray {
  return fromShape(shape_, dtype).fill(0);
}


function ones(shape_: GenericShape, dtype: ScalerType = 'f64'): NdArray {
  return fromShape(shape_, dtype).fill(1);
}


function random(shape_: GenericShape, dtype: ScalerType = 'f64'): NdArray {
  const array = fromShape(shape_, dtype);
  for (let i = 0; i < array.size; i++) array.buffer[i] = Math.random();
  return array;
}


type UnaryOperator = (operand: NdArray) => NdArray;


function unaryOperateToFloat64(operand: NdArray, operator: string): NdArray {
  const size = operand.size;
  const result = new NdArray({ shape: operand.shapeObj, dtype: "f64" });

  const operandType = dtypeIdMap.get(operand.dtype)!;
  const resultType = dtypeIdMap.get(result.dtype)!;

  wasm.unaryOperator(1, size, operand.ptr, operandType, result.ptr, resultType);
  return result;
}


const _ = {
  array,
  zeros,
  ones,
  random,
};


const handler: ProxyHandler<any> = {
  get: (obj: any, props: any) => {
    if (props in obj) {
      return obj[props];
    }

    switch (props) {
      case "sin": case "cos": {
        obj[props] = (operand: NdArray) => unaryOperateToFloat64(operand, props);
        return obj[props];
      }
      default: {
        throw new RunningTimeError(`Unknown operator ${props}`);
      }
    }
  }
}


interface Nd {

  array: typeof array,
  zeros: typeof zeros,
  ones: typeof ones,
  random: typeof random,

  sin: UnaryOperator;
  cos: UnaryOperator;
}


export const nd = new Proxy(_, handler) as Nd;

  // export const cos = (operand: NdArray, dtype: ScalerType = 'f64') => unaryOperate(operand, Math.cos, dtype);
  // export const tan = (operand: NdArray, dtype: ScalerType = 'f64') => unaryOperate(operand, Math.tan, dtype);
  // export const sinh = (operand: NdArray, dtype: ScalerType = 'f64') => unaryOperate(operand, Math.sinh, dtype);
  // export const cosh = (operand: NdArray, dtype: ScalerType = 'f64') => unaryOperate(operand, Math.cosh, dtype);
  // export const tanh = (operand: NdArray, dtype: ScalerType = 'f64') => unaryOperate(operand, Math.tanh, dtype);
  // export const exp = (operand: NdArray, dtype: ScalerType = 'f64') => unaryOperate(operand, Math.exp, dtype);
  // export const log = (operand: NdArray, dtype: ScalerType = 'f64') => unaryOperate(operand, Math.log, dtype);
