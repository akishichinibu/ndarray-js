use crate::utils::log;

use paste::paste;
use wasm_bindgen::prelude::*;


struct Shape<const N: usize> {
    dim: usize,
    shape: [usize; N],
    projection: [usize; N],
    restrict: [usize; N],
    buf: [usize; N],
}


impl<const N: usize> Shape<N> {
    pub fn new(shape_ptr: *mut usize) -> Self {
        
        let dim = N;
        let mut shape: [usize; N] = [0; N];
        let mut projection: [usize; N] = [0; N];
        let mut restrict: [usize; N] = [0; N];
        let buf: [usize; N] = [0; N];

        unsafe {
            let _shape = Vec::from_raw_parts(shape_ptr, dim, dim);

            _shape.iter().enumerate().for_each(|(i, r)| shape[i] = *r);

            std::mem::forget(_shape);
        }

        projection[dim - 1] = 1;

        for i in (0..dim - 1).rev() {
            projection[i] = projection[i + 1] * shape[dim - 1 - i];
        }

        restrict[dim - 1] = shape[0];

        for i in (0..dim - 1).rev() {
            restrict[i] = restrict[i + 1] * shape[dim - 1 - i];
        }

        return Shape {
            dim,
            shape,
            projection,
            restrict,
            buf,
        };
    }
}


macro_rules! specifilize_Shape {
    ($dim: expr) => {
        paste! {

            #[wasm_bindgen]
            #[allow(dead_code)]
            pub struct [<Shape $dim>] {
                shape_obj: Shape<$dim>,
            }

            #[wasm_bindgen]
            
            #[allow(dead_code)]
            impl [<Shape $dim>] {

                pub fn new(shape_ptr: *mut usize) -> Self {
                    Self {
                        shape_obj: Shape::new(shape_ptr),
                    }
                }

                pub fn dim(&self) -> usize {
                    self.shape_obj.dim
                }

                pub fn flat_index(&self, buf_ptr: *mut usize) -> usize {
                    unsafe {
                        let buf = Vec::from_raw_parts(buf_ptr, self.shape_obj.dim, self.shape_obj.dim);
                        let result = self
                            .shape_obj
                            .projection
                            .iter()
                            .zip(buf.iter())
                            .map(|(r, t)| r * t)
                            .sum();
                        std::mem::forget(buf);
                        return result;
                    }
                }
                pub fn reverse_absolute_index(&mut self, t: usize) -> *const usize {
                    for i in 0..self.shape_obj.dim {
                        self.shape_obj.buf[i] =
                            (t % self.shape_obj.restrict[i]) / self.shape_obj.projection[i];
                    }
                    return &self.shape_obj.buf as *const usize;
                }
            }
        }
    }
}


specifilize_Shape!(1);
specifilize_Shape!(2);
specifilize_Shape!(3);
specifilize_Shape!(4);
specifilize_Shape!(5);


#[wasm_bindgen]
#[allow(dead_code)]
pub fn new_shape(ptr: *mut u32) {
    const META_LENGTH: usize = 2;

    unsafe {
        let mut meta = Vec::from_raw_parts(ptr, META_LENGTH, META_LENGTH);
        let dim = meta[0] as usize;

        let shape = Vec::from_raw_parts(ptr.offset(META_LENGTH as isize), dim, dim);
        meta[1] = shape.iter().product();

        let mut projection =
            Vec::from_raw_parts(ptr.offset((META_LENGTH + dim) as isize), dim, dim);
        projection[dim - 1] = 1;

        for i in (0..dim - 1).rev() {
            projection[i] = projection[i + 1] * shape[dim - 1 - i];
        }

        let mut restrict =
            Vec::from_raw_parts(ptr.offset((META_LENGTH + 2 * dim) as isize), dim, dim);
        restrict[dim - 1] = shape[0];

        for i in (0..dim - 1).rev() {
            restrict[i] = restrict[i + 1] * shape[dim - 1 - i];
        }

        std::mem::forget(meta);
        std::mem::forget(shape);
        std::mem::forget(projection);
        std::mem::forget(restrict);
    }
}


#[wasm_bindgen]
#[allow(dead_code)]
pub fn shape_flat_index(dim: usize, proj_ptr: *mut u32, buf_ptr: *mut u32) -> u32 {
    unsafe {
        let buf = Vec::from_raw_parts(buf_ptr, dim, dim);

        let projection = Vec::from_raw_parts(proj_ptr, dim, dim);

        let result = projection.iter().zip(buf.iter()).map(|(r, t)| r * t).sum();

        std::mem::forget(buf);
        std::mem::forget(projection);
        return result;
    }
}


#[wasm_bindgen]
#[allow(dead_code)]
pub fn shape_reverse_absolute_index(
    dim: usize,
    projection_ptr: *mut u32,
    restrict_ptr: *mut u32,
    t: usize,
    buf_ptr: *mut u32,
) {
    unsafe {
        let mut buf = Vec::from_raw_parts(buf_ptr, dim, dim);
        let projection = Vec::from_raw_parts(projection_ptr, dim, dim);
        let restrict = Vec::from_raw_parts(restrict_ptr, dim, dim);

        projection
            .iter()
            .zip(restrict.iter())
            .enumerate()
            .for_each(|(i, (p, q))| buf[i] = (t as u32 % q) / p);

        std::mem::forget(buf);
        std::mem::forget(projection);
        std::mem::forget(restrict);
    }
}
