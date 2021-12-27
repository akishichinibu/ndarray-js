import assert from "assert";
import m from "../src/wasm"

console.log(m.UInt32TypedArrayId);

const ptr = m.__newArray(m.UInt32TypedArrayId, [2, 3, 4]);

const buffer = m.__getUint32Array(ptr);
console.log(buffer);

console.log(m.calcSize(3, ptr));
