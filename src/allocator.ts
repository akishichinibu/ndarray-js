import wasm from "src/wasm";
import constants from "./constants";

import { RunningTimeError } from "./exception";
import { ScalerType } from "./type";


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
    const id = wasm.dtypeIdMap.get(dtype);

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

  allocateBufferWasm(size: number) {
    const ptr = wasm.__new(size, 0);
    wasm.__pin(ptr);
    return ptr;
  }

}


const allocator = new MemoryAllocator();
export default allocator;
