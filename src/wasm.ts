import fs from 'fs';
import path from 'path';
import { WASI } from 'wasi';

import loader from '@assemblyscript/loader/umd';

import * as WasmModule from './wasmModule';
import { ScalerType } from './type';
import c from './constants';

type W = typeof WasmModule;

interface WasmModuleInterface extends W {
  // [key: string]: any;
}

const wasi = new WASI();

const imports = {
  wasi_snapshot_preview1: wasi.wasiImport
};

const bundlePath = path.resolve(__dirname, '..', 'build', 'optimized.wasm');
// const bundlePath = path.resolve(__dirname, "..", "build", "untouched.wasm");
const wasmModule = loader.instantiateSync<WasmModuleInterface>(fs.readFileSync(bundlePath), imports);
wasi.start(wasmModule.instance);

wasmModule.exports.memory?.grow(10);
const wasm = wasmModule.exports;

// @ts-ignore
export const dtypeIdMap = new Map<ScalerType, number>(Array.from(c.dtypeWasmName).map(([k, v]) => [k, wasm.TypedId[`${v}ArrayId`]]));

export const unaryOperatorIdMap = new Map<string, number>([
  [c.Functions.sin, wasm.Operator.Unary.Sin],
  [c.Functions.cos, wasm.Operator.Unary.Cos],
  [c.Functions.tan, wasm.Operator.Unary.Tan],
  [c.Functions.exp, wasm.Operator.Unary.Exp],
  [c.Functions.log, wasm.Operator.Unary.Log]
]);

export default wasm;
