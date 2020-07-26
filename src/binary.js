import { NdArray } from "./ndarray"

const _operation_map = new Map([
    ["add", (a, b) => a + b],
    ["sub", (a, b) => a - b],
    ["mul", (a, b) => a * b],
    ["div", (a, b) => a / b],
    ["mod", (a, b) => a % b],

    ["bitShl", (a, b) => a << b],
    ["bitShr", (a, b) => a >> b],
    ["bitAnd", (a, b) => a & b],
    ["bitOr", (a, b) => a | b],
    ["bitXor", (a, b) => a ^ b],

    ["pow", (a, b) => Math.pow(a, b)],
]);

(() => {
    for (let [name, op] of _operation_map) {
        NdArray.prototype[name] = function(operand, inplace) { return this.binaryOperation(op, operand, inplace); };
    }
})();
