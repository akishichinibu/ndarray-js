use paste::paste;
use std::ops::*;
use wasm_bindgen::prelude::*;

use crate::shape::{binary_with, calc_linear_index, calc_linear_reverse_index, get_size};

macro_rules! binary_operator_scalar_1 {
  ($it1: ty, $it2: ty, $ot: ty, $op: ident) => {
    paste! {
      #[wasm_bindgen]
      pub fn [<operator _ binary _ scalar1 _ $op _ $it1 _ $it2 _ $ot>](
        size_: u32,
        input_ptr1: *mut $it1,
        input_ptr2: *mut $it2,
        output_ptr: *mut $ot,
      ) {
        let size = size_ as usize;
        unsafe {
          let input_1: Vec<$it1> = Vec::from_raw_parts(input_ptr1, 1, 1);
          let input_2: Vec<$it2> = Vec::from_raw_parts(input_ptr2, size, size);
          let mut output: Vec<$ot> = Vec::from_raw_parts(output_ptr, size, size);

          let v1 = input_1[0] as f64;

          for i in 0..size {
            let v2 = input_2[i] as f64;
            let rv = v1.$op(v2);
            output[i] = rv as $ot;
          }

          std::mem::forget(input_1);
          std::mem::forget(input_2);
          std::mem::forget(output);
        }
      }
    }
  };
}

macro_rules! binary_operator_scalar_2 {
  ($it1: ty, $it2: ty, $ot: ty, $op: ident) => {
    paste! {
      #[wasm_bindgen]
      pub fn [<operator _ binary _ scalar2 _ $op _ $it1 _ $it2 _ $ot>](
        size_: u32,
        input_ptr1: *mut $it1,
        input_ptr2: *mut $it2,
        output_ptr: *mut $ot,
      ) {
        let size = size_ as usize;
        unsafe {
          let input_1: Vec<$it1> = Vec::from_raw_parts(input_ptr1, size, size);
          let input_2: Vec<$it2> = Vec::from_raw_parts(input_ptr2, 1, 1);
          let mut output: Vec<$ot> = Vec::from_raw_parts(output_ptr, size, size);

          let v2 = input_2[0] as f64;

          for i in 0..size {
            let v1 = input_1[i] as f64;
            let rv = v1.$op(v2);
            output[i] = rv as $ot;
          }

          std::mem::forget(input_1);
          std::mem::forget(input_2);
          std::mem::forget(output);
        }
      }
    }
  };
}

macro_rules! binary_operator {
  ($it1: ty, $it2: ty, $ot: ty, $op: ident) => {
    paste! {
      #[wasm_bindgen]
      pub fn [<operator _ binary _ $op _ $it1 _ $it2 _ $ot>](
        shape_data_1: *mut u32,
        input_ptr1: *mut $it1,

        shape_data_2: *mut u32,
        input_ptr2: *mut $it2,

        dim_: u32,
        shape_data: *mut u32,

        output_ptr: *mut $ot,
      ) {
        const BATCH_: u32 = 128;
        const BATCH: usize = 128;

        let dim = dim_ as usize;

        let mut index_input_buffer = vec![0 as u32; BATCH];
        let mut reverse_index_buffer = vec![0 as u32; BATCH * dim];
        let mut reverse_index_buffer_1 = vec![0 as u32; BATCH * dim];
        let mut reverse_index_buffer_2 = vec![0 as u32; BATCH * dim];

        let mut index_buffer_1 = vec![0 as u32; BATCH * 1];
        let mut index_buffer_2 = vec![0 as u32; BATCH * 1];

        unsafe {
          let _size = get_size(dim_, shape_data);
          let size_ = _size[0];
          let size = size_ as usize;

          let _size1 = get_size(dim_, shape_data_1);
          let size1_ = _size1[0];
          let size1 = size1_ as usize;

          let _size2 = get_size(dim_, shape_data_2);
          let size2_ = _size2[0];
          let size2 = size2_ as usize;

          let input_1: Vec<$it1> = Vec::from_raw_parts(input_ptr1, size1, size1);
          let input_2: Vec<$it2> = Vec::from_raw_parts(input_ptr2, size2, size2);
          let mut output: Vec<$ot> = Vec::from_raw_parts(output_ptr, size, size);
          
          for i in (0..size).step_by(BATCH) {

            for u in 0..BATCH {
              index_input_buffer[u] = (i + u) as u32;
            }

            calc_linear_reverse_index(dim_, shape_data, BATCH_, index_input_buffer.as_mut_ptr(), reverse_index_buffer.as_mut_ptr());
            
            binary_with(dim_, shape_data, shape_data_1, BATCH_, reverse_index_buffer.as_mut_ptr(), reverse_index_buffer_1.as_mut_ptr());
            binary_with(dim_, shape_data, shape_data_2, BATCH_, reverse_index_buffer.as_mut_ptr(), reverse_index_buffer_2.as_mut_ptr());

            calc_linear_index(dim_, shape_data_1, BATCH_, reverse_index_buffer_1.as_mut_ptr(), index_buffer_1.as_mut_ptr());
            calc_linear_index(dim_, shape_data_2, BATCH_, reverse_index_buffer_2.as_mut_ptr(), index_buffer_2.as_mut_ptr());

            for u in 0..BATCH {
              if (u + i) < size {
                let v1 = input_1[index_buffer_1[u] as usize] as f64;
                let v2 = input_2[index_buffer_2[u] as usize] as f64;
                let rv = v1.$op(v2);
                output[(i + u) as usize] = rv as $ot;
                continue;
              }
              break;
            }
          }

          std::mem::forget(input_1);
          std::mem::forget(input_2);
          std::mem::forget(output);
          std::mem::forget(_size);
          std::mem::forget(_size1);
          std::mem::forget(_size2);
        }
      }
    }
  };
}

macro_rules! loop_on_op {
  ($it1: ty, $it2: ty, $ot: ty) => {
    loop_on_op!($it1, $it2, $ot, add, sub, mul, div);
  };
  ($it1: ty, $it2: ty, $ot: ty, $op: ident) => {
    binary_operator_scalar_1!($it1, $it2, $ot, $op);
    binary_operator_scalar_2!($it1, $it2, $ot, $op);
    binary_operator!($it1, $it2, $ot, $op);
  };
  ($it1: ty, $it2: ty, $ot: ty, $op: ident, $($rest: ident), +) => {
    loop_on_op!($it1, $it2, $ot, $op);
    loop_on_op!($it1, $it2, $ot, $($rest), +);
  };
}

macro_rules! loop_on_dtype_3 {
  ($t1: ty, $t2: ty, $t3: ty) => {
    loop_on_op!($t1, $t2, $t3);
  };
  ($t1: ty, $t2: ty, $t3: ty, $($tt: ty), +) => {
    loop_on_op!($t1, $t2, $t3);
    loop_on_dtype_3!($t1, $t2, $($tt), +);
  };
}

macro_rules! loop_on_dtype_2 {
  ($t1: ty, $t2: ty) => {
    loop_on_dtype!($t1, $t2);
  };
  ($t1: ty, $t2: ty, $($tt: ty), +) => {
    loop_on_dtype!($t1, $t2);
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
  ($t1: ty, $t2: ty) => {
    loop_on_dtype_3!($t1, $t2, f32, f64, u8, u16, u32, i8, i16, i32);
  };
}

loop_on_dtype!();
