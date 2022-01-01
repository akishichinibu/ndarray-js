import fs from 'fs';
import path from 'path';

import * as coreModule from 'src/core-rust/pkg/core_rust';
import { RunningTimeError } from './exception';
import { getTypeConstructor, NumericArray, Ptr, ScalerType, TypedArray } from './type';

const bundlePath = path.resolve(__dirname, 'core-rust', 'pkg', 'core_rust_bg.wasm');

type Core = typeof coreModule;

interface CoreWithMemory extends Core {
  memory: CoreMemory;
}

class CoreMemory {
  private readonly ptr2Size: Map<Ptr, number>;

  constructor(private readonly memory: WebAssembly.Memory) {
    this.ptr2Size = new Map();
  }

  get buffer() {
    return this.memory.buffer;
  }

  grow(delta: number) {
    return this.memory.grow(delta);
  }

  view(dtype: ScalerType, ptr: Ptr, offset: number, size: number) {
    const C = getTypeConstructor(dtype);
    return new C(this.memory.buffer, ptr + offset * C.BYTES_PER_ELEMENT, size);
  }

  allocate(size: number) {
    const ptr = core.allocate(size);

    if (ptr === 0) {
      throw new RunningTimeError(`Try to allocate memory with size ${size} but failed. `);
    }

    this.ptr2Size.set(ptr, size);
    return ptr;
  }

  allocateTypedPtr(dtype: ScalerType, size: number) {
    const C = getTypeConstructor(dtype);
    return this.allocate(C.BYTES_PER_ELEMENT * size);
  }

  allocateTyped(dtype: ScalerType, size: number): [number, TypedArray] {
    const ptr = this.allocateTypedPtr(dtype, size);
    const buffer = this.view(dtype, ptr, 0, size);
    return [ptr, buffer];
  }

  private freeImmediately(ptr: Ptr) {
    const size = this.ptr2Size.get(ptr)!;
    this.ptr2Size.delete(ptr);
    return core.free(ptr, size);
  }

  free(ptr: Ptr) {
    if (!this.ptr2Size.has(ptr)) {
      throw new Error(`Can not find the ptr with address ${ptr}. `);
    }
    return this.freeImmediately(ptr);
  }
}

function instantiateSync(source: any, imports = {}) {
  const module = new WebAssembly.Module(source);
  const instance = new WebAssembly.Instance(module, imports);
  return { module, instance, exports };
}

const { instance } = instantiateSync(fs.readFileSync(bundlePath));
const _core = instance.exports as unknown as CoreWithMemory;

const core = Object.assign({}, _core, {
  memory: new CoreMemory(_core.memory),
});

export default core;
