import core from 'src/core';
import { Ptr } from 'src/type';

export abstract class PtrBase {
  abstract readonly ptr: Ptr;

  free() {
    core.memory.free(this.ptr);
  }
}
