
import { ExprParseError } from "src/exception";
import { functions } from "./op";
import { readDigitalLiteral, readCharacterString, readOperator } from "./process";
import { CharacterStream, VariableType, isSpace, isLeftParenthesisToken, isRightParenthesisToken, isDigitalToken, isCharacterToken, isOperatorToken } from "./utils";


export enum TokenType {
  Literal=1,
  Operator=2,
  LeftParenthesis=3,
  RightParenthesis=4,
  Function=5,
  Variable=6,
}


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
      const r = stream.next();

      if (r.done) {
        yield [TokenType.Variable, token];
        continue;
      }

      const [t, c, cc] = r.value;

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
