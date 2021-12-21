import { CouldBePromise } from "src/type";
import { ExprParseError } from "./exception";
import { VariableType, CharacterStream, TokenStream, TokenType, isSpace, isLeftParenthesisToken, isRightParenthesisToken, isDigitalToken, readDigitalLiteral, isCharacterToken, readCharacterString, isOperatorToken, readOperator } from "./utils";


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
        yield [TokenType.Function, token];
        yield [TokenType.LeftParenthesis, c];
      } else {
        yield [TokenType.Variable, token];
        buffer.push([t, c, cc]);
      }

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
