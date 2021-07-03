use wasm_bindgen::prelude::*;


#[wasm_bindgen]
#[allow(dead_code)]
pub fn alloc(len: usize) -> *mut u8 {
    let mut buf = Vec::with_capacity(len);
    let ptr = buf.as_mut_ptr();
    std::mem::forget(buf);
    return ptr;
}


#[wasm_bindgen]
#[allow(dead_code)]
pub fn wasm_memory() -> JsValue {
    wasm_bindgen::memory()
}
