import { NdArray } from 'src/container';
import { CouldBePromise } from 'src/type';

export type NumericVariableType = number | CouldBePromise<NdArray>;

export type VariableType = string | NumericVariableType;

export type VariableTable = { [key: string]: VariableType };

export type CharacterStream<R> = Generator<[number, R, number]>;
