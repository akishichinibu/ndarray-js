import { Ptr } from "src/type";
import wasm from "src/wasm";


export abstract class PtrBase {

  protected abstract readonly ptr: Ptr;

  free() {
    wasm.__unpin(this.ptr);
  }

}
