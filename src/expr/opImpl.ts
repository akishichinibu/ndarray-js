import { NdArray, Shape } from "index";
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


namespace op {

  export const add: BinaryOperator = (op1, op2) => {
    if (isScalar(op1) && isScalar(op2)) {
      return op1 + op2;
    }

    const flag1 = isNdArray(op1);
    const flag2 = isNdArray(op2);

    if (flag1 && flag2) {

    }

    if (flag1) {
      
    }

    if (flag2) {

    }

}
