import { parseSymbol } from "./type"

function _is_scalar(obj) {
    const _type = typeof obj;
    return _type === "number" || _type === "boolean" || _type === "bigint";
}


function buildBuffer(dtype, size) {
    const _meta_type = parseSymbol(dtype);
    return new _meta_type(size);
}


const timer = function(name, target) {
    const t1 = new Date().getTime();
    target();
    const t2 = new Date().getTime();

    console.log("The execute `" + name + "` cost " + (t2 - t1) + " ms. ");
}



export {
    _is_scalar,
    buildBuffer,
    timer,
}
