import { NdArray, Shape } from 'src/container';
import { ExprEvalError } from 'src/exception';
import c from 'src/constants';

import { VariableType } from './utils';
import { parser } from './expr';

type ShapeLiteral = ArrayLike<number>;

function evalShape(sequence: Iterable<[c.TokenType, VariableType]>) {
  const stack: Array<ShapeLiteral> = [];

  for (let [type, token] of sequence) {
    switch (type) {
      case c.TokenType.Operator: {
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
      case c.TokenType.Function: {
        const opNums = c.functions.get(token as string)!;

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
