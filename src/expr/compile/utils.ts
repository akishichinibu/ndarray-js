import { NdArray } from "src/container";
import { CouldBePromise } from "src/type";
import { between } from "src/utils";

import { operators } from "./op";


export type VariableType = number | string | CouldBePromise<NdArray>;

export type VariableTable = { [key: string]: VariableType };

export type CharacterStream<R> = Generator<[number, R, number]>;

export const isDigitalToken = (code: number) => between(code, 48, 57);

export const isLeftParenthesisToken = (code: number) => code === 40;

export const isRightParenthesisToken = (code: number) => code === 41;

export const isCharacterToken = (code: number) => between(code, 65, 90) || between(code, 97, 122);

export const isOperatorToken = (code: number) => operators.has(String.fromCharCode(code));

export const isSpace = (code: number) => code === 32;
