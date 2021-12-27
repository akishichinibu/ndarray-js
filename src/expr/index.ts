import { nd } from "src/ndarray";
import { TokenType } from "./compile/token";
import { VariableType, VariableTable } from "./compile/utils";
import { parser } from "./expr";


const t = nd.array([[1, 2, 3], [4, 5, 6],]);


async function ndexpr(strings: TemplateStringsArray, ...keys: Array<VariableType>) {
  const task = parser(strings, ...keys);
  const tokens = Array.from(task);
  return async (values: VariableTable) => {

  }
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

// const expr = await ndeval`((${t} + pi) * e - ${t})`;
