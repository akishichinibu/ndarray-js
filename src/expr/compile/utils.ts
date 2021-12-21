import { NdArray } from "src/container";
import { CouldBePromise } from "src/type";
import { between } from "src/utils";
import { ExprParseError } from "./exception";
import { TokenBuffer } from "./token";


export type VariableType = number | string | CouldBePromise<NdArray>;

export type VariableTable = { [key: string]: VariableType };


export const operatorPrecedence = new Map<string, number>([
  ["+", 20],
  ["-", 20],
  ["*", 30],
  ["/", 30],
  ["^", 40],
]);


export enum TokenType {
  Literal,
  Operator,
  LeftParenthesis,
  RightParenthesis,
  Function,
  Variable,
}


export type CharacterStream<R> = Generator<[number, R, number]>;

export type TokenStream<R> = Generator<[TokenType, R]>;


export const isDigitalToken = (code: number) => between(code, 48, 57);

export const isLeftParenthesisToken = (code: number) => code === 40;

export const isRightParenthesisToken = (code: number) => code === 41;

export const isCharacterToken = (code: number) => between(code, 65, 90) || between(code, 97, 122);

export const isOperatorToken = (code: number) => operatorPrecedence.has(String.fromCharCode(code));

export const isSpace = (code: number) => code === 32;


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
    } else if (isSpace(code) || isOperatorToken(code) || isRightParenthesisToken(code)) {
      buffer.push([t, c, code]);
      break;
    } else {
      throw new ExprParseError(t, `Except a digital, a character, a space or a operator behind the current character, but got an ${c}`);
    }
  }

  return String.fromCharCode(...output);
}
