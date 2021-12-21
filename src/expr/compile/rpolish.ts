import { CouldBePromise } from "src/type";
import { VariableType, TokenStream, TokenType, operatorPrecedence } from "./utils";


function* toReversePolish(stream: TokenStream<VariableType>): Generator<[TokenType, VariableType]> {
  const stack = new Array<[TokenType, string]>();

  for (let [type, token] of stream) {
    switch (type) {
      case TokenType.Literal: case TokenType.Variable: {
        yield [type, token];
        break;
      }
      case TokenType.Function: {
        stack.push([TokenType.Function, token as string]);
        break;
      }
      case TokenType.Operator: {
        const currentPrecedence = operatorPrecedence.get(token as string)!;

        while (stack.length > 0) {
          const [type, op] = stack[stack.length - 1];
          const previousPrecedence = operatorPrecedence.get(op)!;

          if (type !== TokenType.LeftParenthesis && previousPrecedence > currentPrecedence) {
            yield stack.pop()!;
          } else {
            break;
          }
        }

        stack.push([TokenType.Operator, token as string]);
        break;
      }
      case TokenType.LeftParenthesis: {
        stack.push([TokenType.LeftParenthesis, token as string]);
        break;
      }
      case TokenType.RightParenthesis: {
        while (stack.length > 0) {
          const [type, op] = stack[stack.length - 1];
          stack.pop();
          if (type !== TokenType.LeftParenthesis) {
            yield [type, op];
          }
        }

        if (stack.length > 0) {
          const [type, op] = stack[stack.length - 1];
          if (type === TokenType.Function) {
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
