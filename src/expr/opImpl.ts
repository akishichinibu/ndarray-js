import { NdArray, Shape } from "src/container";
import { isNdArray, isScalar } from "src/utils";
import { VariableType } from "./utils";


type BinaryOperator = (op1: VariableType, op2: VariableType) => VariableType;


function binaryShape(op1: VariableType, op2: VariableType) {
  if (isScalar(op1) && isScalar(op2)) {
    return [];
  }

  if (isScalar(op1)) {
    return (op2 as NdArray).shapeObj;
  }

  if (isScalar(op2)) {
    return (op1 as NdArray).shapeObj;
  }

  return (op1 as NdArray).shapeObj.binaryOperation((op2 as NdArray).shapeObj);
}
