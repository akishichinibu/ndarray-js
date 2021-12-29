import c from "src/constant";
import { VariableType } from "../utils";
import { TokenStream } from "./token";


function* toReversePolish(stream: TokenStream<VariableType>): Generator<[c.TokenType, VariableType]> {
  const stack = new Array<[c.TokenType, string]>();

  for (let [type, token] of stream) {
    switch (type) {
      case c.TokenType.Literal: case c.TokenType.Variable: {
        yield [type, token];
        break;
      }
      case c.TokenType.Function: {
        stack.push([c.TokenType.Function, token as string]);
        break;
      }
      case c.TokenType.Operator: {
        const currentPrecedence = c.operatorsPrecedence.get(token as string)!;

        while (stack.length > 0) {
          const [type, op] = stack[stack.length - 1];
          const previousPrecedence = c.operatorsPrecedence.get(op)!;

          if (type !== c.TokenType.LeftParenthesis && previousPrecedence > currentPrecedence) {
            yield stack.pop()!;
          } else {
            break;
          }
        }

        stack.push([c.TokenType.Operator, token as string]);
        break;
      }
      case c.TokenType.LeftParenthesis: {
        stack.push([c.TokenType.LeftParenthesis, token as string]);
        break;
      }
      case c.TokenType.RightParenthesis: {
        while (stack.length > 0) {
          const [type, op] = stack[stack.length - 1];
          stack.pop();
          if (type !== c.TokenType.LeftParenthesis) {
            yield [type, op];
          }
        }

        if (stack.length > 0) {
          const [type, op] = stack[stack.length - 1];
          if (type === c.TokenType.Function) {
            yield [type, op];
            stack.pop();
          }
        }

        break;
      }
    }
  }

  while (stack.length > 0) {
    yield stack.pop()!;
  }
}


export default toReversePolish;
