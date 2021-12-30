import allocator from 'src/allocator';
import { Ptr } from 'src/type';

export abstract class PtrBase {
  abstract readonly ptr: Ptr;

  free() {
    allocator.freeWasm(this.ptr);
  }
}
