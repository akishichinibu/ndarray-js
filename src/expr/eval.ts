import { NdArray, Shape } from "index";
import { ExprEvalError } from "src/exception";
import { isScalar } from "src/utils";
import { functions } from "./compile/op";
import { TokenType } from "./compile/token";
import { VariableType } from "./compile/utils";
import { parser } from "./expr";


type ShapeLiteral = ArrayLike<number>;


function evalShape(sequence: Iterable<[TokenType, VariableType]>) {
  const stack: Array<ShapeLiteral> = [];

  for (let [type, token] of sequence) {
    switch (type) {
      case TokenType.Operator: {
        const op2 = stack.pop()!;
        const op1 = stack.pop()!;

        if (op1.length === 0) {
          stack.push(op2);
        } else if (op2.length === 0) {
          stack.push(op1);
        } else {
          // Binary check
        }
      }
      case TokenType.Function: {
        const opNums = functions.get(token as string)!;

        if (stack.length < opNums) {
          throw EvalError(`The function ${token} required ${opNums} oprands but got ${stack.length}`);
        }

        const ops = [];
        for (let i = 0; i < opNums; i++) ops.push(stack.pop()!);

        stack.push();
      }
      default: {
        if (token instanceof NdArray) {
          stack.push(token.shape);
        } else {
          stack.push([]);
        }
      }
    }
  }

  if (stack.length > 1) {
    throw new ExprEvalError(`There are rest items which havn't been evaluated. `);
  }

  const result = stack.pop()!;
  return new Shape(result);
}


export async function ndeval(strings: TemplateStringsArray, ...keys: Array<VariableType>) {
  const sequence = Array.from(parser(strings, ...keys));
  const shape = evalShape(sequence);
  return stack.pop()!;
}
