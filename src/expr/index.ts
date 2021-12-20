import { NdArray } from "../..";
import { array } from "../ndarray";
import { CouldBePromise } from "../type";

type VariableType = number | NdArray;


type VariableTable = { [key: string]: VariableType };


const t = array([
  [1, 2, 3],
  [4, 5, 6],
]);


async function ndeval<R extends CouldBePromise<VariableType>>(strings: TemplateStringsArray, ...keys: Array<R>) {
  return await t;
}


async function ndexpr<R extends CouldBePromise<VariableType>>(strings: TemplateStringsArray, ...keys: Array<R>) {
  return async (values: VariableTable) => {
    return await t;
  }
}


const expr = await ndeval`((${t} + pi) * e - ${t})`;
