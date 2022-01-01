use paste::paste;
use wasm_bindgen::prelude::*;
// use rand::{thread_rng, Rng};

#[macro_export]
macro_rules! fill_operator {
  ($ot: ty) => {
    paste! {
      #[wasm_bindgen]
      pub fn [<operator _ fill _ $ot>](size: usize, output_ptr: *mut $ot, value: *mut $ot) {
        unsafe {
          let input: Vec<$ot> = Vec::from_raw_parts(value, 1, 1);
          let mut output: Vec<$ot> = Vec::from_raw_parts(output_ptr, size, size);
          for i in 0..size {
            output[i] = input[0];
          }

          std::mem::forget(input);
          std::mem::forget(output);
        }
      }
    }
  };
}

#[macro_export]
macro_rules! rand_operator {
  ($ot: ty) => {
    paste! {
      #[wasm_bindgen]
      pub fn [<operator _ rand _ $ot>](size: usize, output_ptr: *mut $ot) {
        // let mut rng = thread_rng();
        unsafe {
          let mut output: Vec<$ot> = Vec::from_raw_parts(output_ptr, size, size);
          for i in 0..size {
            output[i] = 1 as $ot;
          }
          std::mem::forget(output);
        }
      }
    }
  };
}

macro_rules! loop_on_dtype {
  ($t: ty) => {
    fill_operator!($t);
    rand_operator!($t);
  };
  ($t: ty, $($tt: ty), +) => {
    loop_on_dtype!($t);
    loop_on_dtype!($($tt), +);
  };
}

loop_on_dtype!(f32, f64, u8, u16, u32, i8, i16, i32);
