import * as kernel from "ndarray-kernel";
import Shape, {create_shape, } from "./src/shape";
import { NdArray, nd } from "./src/ndarray";
import { Expression, buildExprTree, parse_to_token } from "./src/expr";

//@ts-ignore
window.kernel = kernel;
//@ts-ignore
window.Shape = Shape;
//@ts-ignore
window.NdArray = NdArray;
//@ts-ignore
window.nd = nd;
//@ts-ignore
window.Expression = Expression;
//@ts-ignore
window.buildExprTree = buildExprTree;

//@ts-ignore
window.parse_to_token = parse_to_token;

//@ts-ignore
window.create_shape = create_shape;

function test_parse_expr(s: string) {
    const n = s.length;
    const ptr = kernel.alloc(n);
    
    let mem = kernel.wasm_memory();
    let buffer = new Uint8Array(mem.buffer, ptr, n);
    for (let i = 0; i < n; i++) buffer[i] = s.charCodeAt(i);

    kernel.expr_parse(ptr, n, ptr);
    return buffer.slice(1, buffer[0]);
}

//@ts-ignore
window.test_parse_expr = test_parse_expr;
