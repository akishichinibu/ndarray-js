import { between } from "src/assembly";
import { operatorsPrecedence } from "src/expr/constant";


export const isDigitalToken = (code: number) => between(code, 48, 57);

export const isLeftParenthesisToken = (code: number) => code === 40;

export const isRightParenthesisToken = (code: number) => code === 41;

export const isCharacterToken = (code: number) => between(code, 65, 90) || between(code, 97, 122);

export const isOperatorToken = (code: number) => operatorsPrecedence.has(String.fromCharCode(code));

export const isSpace = (code: number) => code === 32;
