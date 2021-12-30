import wasm from 'src/wasm';
import { Ptr, ScalerType } from './type';

class WasmMemoryPool {
  private readonly ptrs: Map<Ptr, number>;
  private readonly ptrsUsage: Map<Ptr, boolean>;
  private readonly sizeToPtrs: Map<number, Set<Ptr>>;

  constructor() {
    this.ptrs = new Map();
    this.ptrsUsage = new Map();
    this.sizeToPtrs = new Map();
  }

  allocate(size: number) {
    for (let ptr of this.sizeToPtrs.get(size) ?? []) {
      if (!(this.ptrsUsage.get(ptr) ?? true)) {
        this.ptrsUsage.set(ptr, true);
        return ptr;
      }
    }

    const ptr = wasm.__new(size, 0);
    this.ptrs.set(ptr, size);
    this.ptrsUsage.set(ptr, true);

    this.sizeToPtrs.set(ptr, (this.sizeToPtrs.get(ptr) ?? new Set()).add(ptr));

    wasm.__pin(ptr);
    return ptr;
  }

  private freeImmediately(ptr: Ptr) {
    return wasm.__unpin(ptr);
  }

  free(ptr: Ptr) {
    if (!this.ptrs.has(ptr)) {
      throw new Error(`Can not find the ptr with address ${ptr}. `);
    }

    const size = this.ptrs.get(ptr)!;
    const flag = this.ptrsUsage.get(ptr)!;

    if (flag === false) {
      throw new Error(`The address ${ptr} isn't in used. `);
    }

    if (size >= 1 << 15) {
      return this.freeImmediately(ptr);
    }

    this.ptrsUsage.set(ptr, false);
  }
}

const wasmPool = new WasmMemoryPool();

class MemoryAllocator {
  allocate(size: number) {
    return new ArrayBuffer(size);
  }

  allocateU32(size: number) {
    const buffer = this.allocate(Uint32Array.BYTES_PER_ELEMENT * size);
    return new Uint32Array(buffer);
  }

  // allocateWasm(dtype: ScalerType, size: number, initValue?: Array<number>) {
  //   const id = wasm.dtypeIdMap.get(dtype);

  //   if (id === undefined) {
  //     throw new RunningTimeError(`Invalid data type ${dtype}`);
  //   }

  //   if (initValue) {
  //     if (initValue.length !== size) {
  //       throw new RunningTimeError(`The length of the initValue is not equal to ${size}`);
  //     }
  //   }

  //   const ptr = wasm.__newArray(id, initValue ? initValue : size);
  //   return ptr;
  // }

  allocateWasm(size: number) {
    return wasmPool.allocate(size);
  }

  allocateWasmU32(size: number): [Ptr, Uint32Array] {
    const ptr = this.allocateWasm(Uint32Array.BYTES_PER_ELEMENT * size);
    const view = wasm.__getArrayView(ptr);
    return [ptr, new Uint32Array(view.buffer)];
  }

  freeWasm(ptr: Ptr) {
    return wasmPool.free(ptr);
  }
}

const allocator = new MemoryAllocator();
export default allocator;
