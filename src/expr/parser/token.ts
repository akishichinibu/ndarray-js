
import { ExprParseError } from "src/exception";
import { functions, TokenType } from "src/expr/constant";
import { readDigitalLiteral, readCharacterString, readOperator } from "./process";
import { CharacterStream, VariableType } from "../utils";
import { isSpace, isLeftParenthesisToken, isRightParenthesisToken, isDigitalToken, isCharacterToken, isOperatorToken } from "./checker";

export type TokenStream<R> = Generator<[TokenType, R]>;

export type TokenBuffer<R> = Array<[number, R, number]>;

function* toTokenStream(stream: CharacterStream<VariableType>): TokenStream<VariableType> {
  const buffer: TokenBuffer<VariableType> = [];

  let t: number;
  let c: VariableType;
  let code: number;

  while (true) {
    if (buffer.length > 0) {
      [t, c, code] = buffer.shift()!;
    } else {
      const r = stream.next();

      if (r.done) {
        break;
      }

      [t, c, code] = r.value;
    }

    if (code === 0) {
      yield [TokenType.Variable, c];
      continue;
    }

    if (isSpace(code)) {
      continue;
    }

    if (isLeftParenthesisToken(code)) {
      yield [TokenType.LeftParenthesis, c];
      continue;
    }

    if (isRightParenthesisToken(code)) {
      yield [TokenType.RightParenthesis, c];
      continue;
    }

    if (isDigitalToken(code)) {
      const token = readDigitalLiteral(stream, code, buffer);
      yield [TokenType.Literal, token];
      continue;
    }

    if (isCharacterToken(code)) {
      const token = readCharacterString(stream, code, buffer);

      if (buffer.length === 0) {
        yield [TokenType.Variable, token];
        continue;
      }

      const [t, c, cc] = buffer.pop()!;

      if (isLeftParenthesisToken(cc)) {
        if (functions.has(token)) {
          yield [TokenType.Function, token];
        } else {
          throw new ExprParseError(t, `Unknown function name ${token}`);
        }
      } else {
        yield [TokenType.Variable, token];
      }

      buffer.push([t, c, cc]);
      continue;
    }

    if (isOperatorToken(code)) {
      const token = readOperator(stream, code, buffer);
      yield [TokenType.Operator, token];
      continue;
    }

    throw new ExprParseError(t, `Got an unexpected token ${c}`);
  }
}


export default toTokenStream;
