import { module } from "../index";

const { __allocArray, __retain, __release } = module.exports;

export function withPtrBuffer<T>(bufId: number, parameter: Array<number>, op: (ptr: number) => T): T {
    const arrPtr: number = __retain(__allocArray(bufId, parameter));
    const r = op(arrPtr);
    __release(arrPtr)
    return r;
}
