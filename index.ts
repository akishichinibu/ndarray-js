const loader = require("@assemblyscript/loader");

let module;
let Shape;
let NdArray;
let nd;
let sp;

loader.instantiate(fetch("./build/untouched.wasm")).then(exports => { 
    module = exports;
    import("./src/shape").then((module) => {
        Shape = module.Shape;
        sp = module.sp;
    });
    import("./src/ndarray").then((module) => {
        NdArray = module.NdArray;
        nd = module.nd;
    });
});

export {
    module,
    Shape,
    NdArray,
    nd,
    sp,
}
