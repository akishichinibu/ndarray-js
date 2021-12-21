import { NdArray } from "../..";
import { array } from "../ndarray";
import { CouldBePromise } from "../type";
import { toCharacterStream, toReversePolish, toTokenStream } from "./compile";
import { VariableType, VariableTable, TokenType } from "./compile/utils";


const t = array([[1, 2, 3], [4, 5, 6],]);


const parser = (strings: TemplateStringsArray, ...keys: Array<VariableType>) => {
  return toReversePolish(
    toTokenStream(
      toCharacterStream(
        strings, keys,
      )
    )
  )
}


export async function ndeval(strings: TemplateStringsArray, ...keys: Array<VariableType>) {
  const stack: Array<VariableType> = [];

  for (let [type, token] of parser(strings, ...keys)) {
    if (type === TokenType.Operator) {
      const op1 = await stack.pop()!;
      const op2 = await stack.pop()!;
      console.log(stack, op1, op2, type, token);

      switch (token) {
        case "+": {
          stack.push((op2 as number) + (op1 as number));
          break;
        }
        case "-": {
          stack.push((op2 as number) - (op1 as number));
          break;
        }
        case "*": {
          stack.push((op2 as number) * (op1 as number));
          break;
        }
        case "/": {
          stack.push((op2 as number) / (op1 as number));
          break;
        }
        default: {
          stack.push((op1 as number));
        }
      }

    } else {
      stack.push(token);
    }
  }

  return stack.pop()!;
}


async function ndexpr<R extends CouldBePromise<VariableType>>(strings: TemplateStringsArray, ...keys: Array<R>) {
  return async (values: VariableTable) => {
    return await t;
  }
}


// const expr = await ndeval`((${t} + pi) * e - ${t})`;
