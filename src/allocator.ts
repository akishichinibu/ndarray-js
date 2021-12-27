import { ScalerType, TypedScalerType } from "./type";
import wasm from "src/wasm";
import { RunningTimeError } from "./exception";


export const dtypeWasmName = new Map<ScalerType, string>([
  ["i8", "Int8"],
  ["i16", "Int16"],
  ["i32", "Int32"],
  ["u8", "Uint8"],
  ["u16", "Uint16"],
  ["u32", "Uint32"],
  ["f32", "Float32"],
  ["f64", "Float64"],
]);


const dtypeIdMap = new Map<ScalerType, number>(Array.from(dtypeWasmName).map(([k, v]) => [k, wasm[`${v}ArrayId`]]));

console.log(dtypeIdMap);


class MemoryAllocator {

  private readonly pool: Array<[ArrayBuffer, number]>;

  constructor() {
    this.pool = [];
  }

  allocate(size: number) {
    return new ArrayBuffer(size);
  }

  allocateU32(size: number) {
    const buffer = this.allocate(Uint32Array.BYTES_PER_ELEMENT * size);
    return new Uint32Array(buffer);
  }

  allocateWasm(dtype: ScalerType, size: number, initValue?: Array<number>) {
    const id = dtypeIdMap.get(dtype);
    console.log("dtype", dtype, id, dtypeIdMap.get("i8"));

    if (id === undefined) {
      throw new RunningTimeError(`Invalid data type ${dtype}`);
    }

    if (initValue) {
      if (initValue.length !== size) {
        throw new RunningTimeError(`The length of the initValue is not equal to ${size}`);
      }
    }

    const ptr = wasm.__newArray(id, initValue ? initValue : size);
    return ptr;
  }

  allocateU32Wasm(size: number, initValue?: Array<number>) {
    return this.allocateWasm("u32", size, initValue);
  }

}


const allocator = new MemoryAllocator();
export default allocator;
