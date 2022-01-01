use paste::paste;
use wasm_bindgen::prelude::*;

#[macro_export]
macro_rules! unary_operator {
  ($it: ty, $ot: ty, $op: ident) => {
    paste! {
      #[wasm_bindgen]
      pub fn [<operator _ unary _ $op _ $it _ $ot>](size_: u32, input_ptr: *mut $it, output_ptr: *mut $ot) {
        let size = size_ as usize;
        unsafe {
          let input: Vec<$it> = Vec::from_raw_parts(input_ptr, size, size);
          let mut output: Vec<$ot> = Vec::from_raw_parts(output_ptr, size, size);
          for i in 0..size {
            let v = input[i] as f64;
            let rv = v.$op();
            output[i] = rv as $ot;
          }
          std::mem::forget(input);
          std::mem::forget(output);
        }
      }
    }
  };
}

macro_rules! loop_on_op {
  ($t1: ty, $t2: ty) => {
    loop_on_op!($t1, $t2, exp, ln, log2, log10, sin, cos, tan, sinh, cosh, tanh);
  };
  ($t1: ty, $t2: ty, $op: ident) => {
    unary_operator!($t1, $t2, $op);
  };
  ($t1: ty, $t2: ty, $op: ident, $($rest: ident), +) => {
    loop_on_op!($t1, $t2, $op);
    loop_on_op!($t1, $t2, $($rest), +);
  };
}

macro_rules! loop_on_dtype_2 {
  ($t1: ty, $t2: ty) => {
    loop_on_op!($t1, $t2);
  };
  ($t1: ty, $t2: ty, $($tt: ty), +) => {
    loop_on_op!($t1, $t2);
    loop_on_dtype_2!($t1, $($tt), +);
  };
}

macro_rules! loop_on_dtype_1 {
  ($t: ty) => {
    loop_on_dtype!($t);
  };
  ($t: ty, $($tt: ty), +) => {
    loop_on_dtype!($t);
    loop_on_dtype_1!($($tt), +);
  };
}


macro_rules! loop_on_dtype {
  () => {
    loop_on_dtype_1!(f32, f64, u8, u16, u32, i8, i16, i32);
  };
  ($t: ty) => {
    loop_on_dtype_2!($t, f32, f64, u8, u16, u32, i8, i16, i32);
  };
}

loop_on_dtype!();
