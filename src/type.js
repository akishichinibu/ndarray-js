const _type_symbol = [
    [Uint8Array,     "u8"],
    [Uint16Array,    "u16"],
    [Uint32Array,    "u32"],
    [BigUint64Array, "u64"],

    [Int8Array,      "i8"],
    [Int16Array,     "i16"],
    [Int32Array,     "i32"],
    [BigInt64Array,  "i64"],

    [Float32Array,   "f"],
    [Float32Array,   "d"],
];

const typeSymbolMap = (() => {
    const buf = new Map();
    for (let [ type, symbol ] of _type_symbol) buf.set(type, symbol);
    return buf;
})();


const symbolTypeMap = (() => {
    const buf = new Map();
    for (let [ type, symbol ] of _type_symbol) buf.set(symbol, type);
    return buf;
})();


function parseSymbol(symbol) {
    const r = symbolTypeMap.get(symbol);
    return r ? r : null;
}


function parseObject(obj) {
    const _c = obj.constructor;
    const r = typeSymbolMap.get(_c);
    return r ? r : null;
}


export {
    parseSymbol,
    parseObject,
}
