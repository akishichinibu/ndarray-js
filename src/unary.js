import { NdArray } from "./ndarray"

const _operation_map = new Map([
    ["sin", Math.sin],
    ["cos", Math.cos],
    ["tan", Math.tan],

    ["sinh", Math.sinh],
    ["cosh", Math.cosh],
    ["tanh", Math.tanh],

    ["asin", Math.asin],
    ["acos", Math.acos],
    ["atan", Math.atan],

    ["exp", Math.exp],
    ["log", Math.log],
    ["log2", Math.log2],
    ["log10", Math.log10],

    ["round", Math.round],
    ["floor", Math.floor],
    ["ceil", Math.ceil],

    ["abs", Math.abs],
    ["sign", Math.sign],
    ["bitNot", a => !a],

    ["sqr", a => a * a],
    ["sqrt", Math.sqrt],

    ["cube", a => a * a * a],
    ["cbrt", Math.cbrt],
]);

(() => {
    for (let [name, op] of _operation_map) {
        NdArray.prototype[name] = function(inplace) { return this.unaryOperation(op, inplace); };
    }
})();
