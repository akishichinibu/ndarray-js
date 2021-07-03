use wasm_bindgen::prelude::*;
use paste::paste;

use std::ops::BitAnd;


struct Ndarray {
    
}


macro_rules! unary_operator_f64 {
    ($op: ident, $dtype: ty) => {
        paste! {
            #[wasm_bindgen]
            #[allow(dead_code)]
            pub fn [<unary_ $op _ $dtype>](size: usize, 
                                           src_ptr: *mut $dtype,
                                           dst_ptr: *mut f64) {
                unsafe {
                    let src = Vec::from_raw_parts(src_ptr, size, size);
                    let mut dst = Vec::from_raw_parts(dst_ptr, size, size);

                    src.iter()
                        .enumerate()
                        .for_each(|(i, r)| dst[i] = (*r as f64).$op());

                    std::mem::forget(src);
                    std::mem::forget(dst);
                }
            }
        }
    }
}


unary_operator_f64!(sin, u8);
unary_operator_f64!(sin, f64);
unary_operator_f64!(cos, f64);
unary_operator_f64!(tan, f64);
unary_operator_f64!(sinh, f64);
unary_operator_f64!(cosh, f64);
unary_operator_f64!(tanh, f64);


macro_rules! all_operator {
    ($name: ident, $op: ident, $src_type: ty) => {
        paste! {
            #[wasm_bindgen]
            #[allow(dead_code)]
            pub fn [<reduce_ $name _ $src_type>](size: usize, src_ptr: *mut $src_type) -> bool {
                unsafe {
                    let src = Vec::from_raw_parts(src_ptr, size, size);
                    let result = src.iter().fold(true, |a, b| (a).$op(*b != 0));
                    std::mem::forget(src);
                    return result
                }
            }
        }
    }
}


all_operator!(all, bitand, u8);
all_operator!(all, bitand, i8);
all_operator!(all, bitand, u32);
all_operator!(all, bitand, i32);
