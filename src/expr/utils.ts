import { NdArray } from "src/container";
import { CouldBePromise } from "src/type";

export type VariableType = number | string | CouldBePromise<NdArray>;

export type VariableTable = { [key: string]: VariableType };

export type CharacterStream<R> = Generator<[number, R, number]>;
