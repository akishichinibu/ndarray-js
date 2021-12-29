
import { ExprParseError } from "src/exception";
import { TokenBuffer } from "./token";
import { CharacterStream, VariableType } from "../utils";
import { isDigitalToken, isSpace, isOperatorToken, isRightParenthesisToken, isCharacterToken, isLeftParenthesisToken } from "./checker";


export function readDigitalLiteral(stream: CharacterStream<VariableType>, first: number, buffer: TokenBuffer<VariableType>) {
  const output = [first,];

  while (true) {
    const r = stream.next();

    if (r.done) {
      break;
    }

    const [t, c, code] = r.value;

    if (isDigitalToken(code)) {
      output.push(code);
    } else if (isSpace(code) || isOperatorToken(code) || isRightParenthesisToken(code)) {
      buffer.push([t, c, code]);
      break;
    } else {
      throw new ExprParseError(t, `Except a digital, a space or a operator behind the current digital, but got an ${c}`);
    }
  }

  return Number(String.fromCharCode(...output));
}


export function readOperator(stream: CharacterStream<VariableType>, first: number, buffer: TokenBuffer<VariableType>) {
  const output = [first,];

  while (true) {
    const r = stream.next();

    if (r.done) {
      break;
    }

    const [t, c, code] = r.value;

    if (isOperatorToken(code)) {
      output.push(code);
    } else {
      buffer.push([t, c, code]);
      break;
    }
  }

  return String.fromCharCode(...output);
}


export function readCharacterString(stream: CharacterStream<VariableType>, first: number, buffer: TokenBuffer<VariableType>) {
  const output = [first, ];

  while (true) {
    const r = stream.next();

    if (r.done) {
      break;
    }

    const [t, c, code] = r.value;

    if (isDigitalToken(code) || isCharacterToken(code)) {
      output.push(code);
    } else if (isSpace(code) || isOperatorToken(code) || isLeftParenthesisToken(code) || isRightParenthesisToken(code)) {
      buffer.push([t, c, code]);
      break;
    } else {
      throw new ExprParseError(t, `Except a digital, a character, a space or a operator behind the current character, but got an ${c}`);
    }
  }

  return String.fromCharCode(...output);
}
