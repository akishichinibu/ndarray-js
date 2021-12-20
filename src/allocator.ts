import { ScalerType, TypedScalerType } from "./type";


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

}


const allocator = new MemoryAllocator();
export default allocator;
