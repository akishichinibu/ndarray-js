import fs from "fs";
import loader from "@assemblyscript/loader/umd";
import { Ptr } from "./type";


interface WasmModuleId {
  Int8ArrayId: number;
  Int16ArrayId: number;
  Int32TypedArrayId: number;
  Uint8ArrayId: number;
  Uint16ArrayId: number;
  Uint32ArrayId: number;
  Float32ArrayId: number;
  Float64ArrayId: number;

  SinFloat64Id: number;
  CosFloat64Id: number;
}


interface WasmModuleIndexUtils {
  calcSize: (dim: number, shape: Ptr) => number;
  calcLinearIndex: (dim: number, index: Ptr, projection: Ptr) => number;
  calcProjection: (dim: number, shape: Ptr, buffer: Ptr) => void;
  calcRestrict: (dim: number, shape: Ptr, buffer: Ptr) => void;
  calcLinearReverseIndex: (dim: number, index: number, projection: Ptr, restrict: Ptr, buffer: Ptr) => void;
}


type UnaryOperator = (number: number, size: number, input: Ptr, output: Ptr) => void;


interface WasmModuleUnary {
  unaryOperator_f64: UnaryOperator;
}


interface WasmModuleInterface extends WasmModuleId, WasmModuleIndexUtils, WasmModuleUnary {
  [key: string]: any;
}


const imports = {};

const wasmModule = loader.instantiateSync<WasmModuleInterface>(fs.readFileSync(__dirname + "/../build/untouched.wasm"), imports);

export default wasmModule.exports;
