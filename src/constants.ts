import { ScalerType } from "./type";


namespace constants {

  export const dtypeWasmName = new Map<ScalerType, string>([
    ["i8", "Int8"],
    ["i16", "Int16"],
    ["i32", "Int32"],
    ["u8", "Uint8"],
    ["u16", "Uint16"],
    ["u32", "Uint32"],
    ["f32", "Float32"],
    ["f64", "Float64"],
  ]);


  export enum UnaryOperator {
    LogicNot = "!",
  }


  export enum BinaryOperator {
    Addition = "+",
    Subtraction = "-",
    Multiplication = "*",
    Division = "/",
    Exponentiation = "**",
  }


  type Operator = `${BinaryOperator}` | `${UnaryOperator}`;


  export const operatorsPrecedence = new Map<string, number>([
    [BinaryOperator.Addition, 20],
    [BinaryOperator.Subtraction, 20],
    [BinaryOperator.Multiplication, 30],
    [BinaryOperator.Division, 30],
    [BinaryOperator.Exponentiation, 40],
  ]);


  export enum Constants {
    PI = "pi",
    E = "e",
  }


  export const constants = new Map<string, number>([
    [Constants.PI, Math.PI],
    [Constants.E, Math.E],
  ]);


  export enum Functions {
    exp = "exp",
    log = "log",
    sin = "sin",
    cos = "cos",
    tan = "tan",
  }


  export const functions = new Map<string, number>([
    [Functions.exp, 0b0100001],
    [Functions.log, 0b0100010],

    [Functions.sin, 0b0100100],
    [Functions.cos, 0b0100101],
    [Functions.tan, 0b0100110],
  ]);


  export enum TokenType {
    Literal = 1,
    Operator = 2,
    LeftParenthesis = 3,
    RightParenthesis = 4,
    Function = 5,
    Variable = 6,
  }


}


export default constants;
