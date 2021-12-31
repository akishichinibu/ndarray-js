import wasm from 'src/wasm';
import { RunningTimeError } from './exception';
import { Ptr, ScalerType } from './type';

class WasmMemoryPool {
  private readonly ptr2Size: Map<Ptr, number>;
  private readonly ptr2Usage: Map<Ptr, boolean>;
  private readonly sizeToPtrs: Map<number, Set<Ptr>>;

  constructor() {
    this.ptr2Size = new Map();
    this.ptr2Usage = new Map();
    this.sizeToPtrs = new Map();
  }

  allocate(size: number) {
    for (let ptr of this.sizeToPtrs.get(size) ?? []) {
      if (!(this.ptr2Usage.get(ptr) ?? true)) {
        this.ptr2Usage.set(ptr, true);
        return ptr;
      }
    }

    const ptr = wasm.__new(size, 0);

    if (ptr === 0) {
      throw new RunningTimeError(`Try to allocate memory with size ${size} but failed. `);
    }

    this.ptr2Size.set(ptr, size);
    this.ptr2Usage.set(ptr, true);
    this.sizeToPtrs.set(size, (this.sizeToPtrs.get(size) ?? new Set()).add(ptr));

    wasm.__pin(ptr);
    return ptr;
  }

  private freeImmediately(ptr: Ptr) {
    return wasm.__unpin(ptr);
  }

  free(ptr: Ptr) {
    if (!this.ptr2Size.has(ptr)) {
      throw new Error(`Can not find the ptr with address ${ptr}. `);
    }

    const size = this.ptr2Size.get(ptr)!;
    const flag = this.ptr2Usage.get(ptr)!;

    if (flag === false) {
      throw new Error(`The address ${ptr} isn't in used. `);
    }

    if (size >= 1 << 15) {
      return this.freeImmediately(ptr);
    }

    this.ptr2Usage.set(ptr, false);
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

  allocateWasm(size: number) {
    return wasmPool.allocate(size);
  }

  allocateWasmU32(size: number): [Ptr, Uint32Array] {
    const ptr = this.allocateWasm(Uint32Array.BYTES_PER_ELEMENT * size);
    const view = new Uint32Array(wasm.memory?.buffer!, ptr, size);
    return [ptr, view];
  }

  freeWasm(ptr: Ptr) {
    return wasmPool.free(ptr);
  }
}

const allocator = new MemoryAllocator();
export default allocator;
