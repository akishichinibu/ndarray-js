use wasm_bindgen::prelude::*;

#[inline(always)]
unsafe fn _offset_view<T>(data: *mut T, offset: u32, size: u32) -> Vec<T> {
  let size_ = size as usize;
  return Vec::from_raw_parts(
    data.offset(offset as isize),
    size_,
    size_,
  );
}

#[inline(always)]
pub unsafe fn get_shape(dim: u32, data: *mut u32) -> Vec<u32> {
  return _offset_view::<u32>(data, dim * 0, dim);
}

#[inline(always)]
pub unsafe fn get_projection(dim: u32, data: *mut u32) -> Vec<u32> {
  return _offset_view::<u32>(data, dim * 1, dim);
}

#[inline(always)]
pub unsafe fn get_restrict(dim: u32, data: *mut u32) -> Vec<u32> {
  return _offset_view::<u32>(data, dim * 2, dim);
}

pub unsafe fn get_size(dim: u32, data: *mut u32) -> Vec<u32> {
  return _offset_view::<u32>(data, dim * 3, 1);
}

pub fn calc_projection(dim: u32, shape: &Vec<u32>, result: &mut Vec<u32>) {
  result[0] = 1;
  for i in 1..dim {
    result[i as usize] = shape[(dim - i) as usize] * result[(i - 1) as usize];
  }
  result.reverse();
}

pub fn calc_restrict(dim: u32, shape: &Vec<u32>, result: &mut Vec<u32>) {
  result[0] = shape[(dim - 1) as usize];
  for i in 1..dim {
    result[i as usize] = shape[(dim - 1 - i) as usize] * result[(i - 1) as usize];
  }
  result.reverse();
}

pub fn calc_size(dim: u32, shape: &Vec<u32>, result: &mut Vec<u32>) {
  result[0] = shape.iter().product();
}

#[wasm_bindgen]
#[inline(always)]
pub fn init_shape(dim: u32, data: *mut u32) {
  unsafe {
    let shape = get_shape(dim, data);
    let mut projection = get_projection(dim, data);
    let mut restrict = get_restrict(dim, data);
    let mut size = get_size(dim, data);

    calc_projection(dim, &shape, &mut projection);
    calc_restrict(dim, &shape, &mut restrict);
    calc_size(dim, &shape, &mut size);

    std::mem::forget(shape);
    std::mem::forget(projection);
    std::mem::forget(restrict);
    std::mem::forget(size);
  }
}

#[wasm_bindgen]
#[inline(always)]
pub fn calc_linear_index(dim: u32, data: *mut u32, size: u32, input_: *mut u32, output_: *mut u32) {
  unsafe {
    let input = _offset_view::<u32>(input_, 0, dim * size);
    let mut output = _offset_view::<u32>(output_, 0, size);
    let projection = get_projection(dim, data);

    output.fill(0);

    for i in 0..dim {
      for u in 0..size {
        output[u as usize] += input[(i * size + u) as usize] * projection[i as usize];
      }
    }

    std::mem::forget(input);
    std::mem::forget(output);
    std::mem::forget(projection);
  }
}

#[wasm_bindgen]
#[inline(always)]
pub fn calc_linear_reverse_index(
  dim: u32,
  data: *mut u32,
  size: u32,
  input_: *mut u32,
  output_: *mut u32,
) {
  unsafe {
    let input = _offset_view::<u32>(input_, 0, size);
    let mut output = _offset_view::<u32>(output_, 0, dim * size);

    let projection = get_projection(dim, data);
    let restrict = get_restrict(dim, data);

    for i in 0..dim {
      for u in 0..size {
        output[(i * size + u) as usize] = (input[u as usize] % restrict[i as usize]) / projection[i as usize];
      }
    }

    std::mem::forget(input);
    std::mem::forget(output);
    std::mem::forget(projection);
    std::mem::forget(restrict);
  }
}

#[wasm_bindgen]
#[inline(always)]
pub fn binary_with(
  dim: u32,
  data: *mut u32,
  data1: *mut u32,
  size: u32,
  input_: *mut u32,
  output_: *mut u32,
) {
  unsafe {
    let input = _offset_view::<u32>(input_, 0, dim * size);
    let mut output = _offset_view::<u32>(output_, 0, dim * size);

    let shape = get_shape(dim, data);
    let shape1 = get_shape(dim, data1);

    for i in 0..dim {
      let p = shape[i as usize];
      let p1 = shape1[i as usize];

      for u in 0..size {  
        let t = (u + i * size) as usize;

        if p == p1 {
          output[t] = input[t];
          continue;
        }

        if p1 == 1 {
          output[t] = 0;
          continue;
        }

        if p == 1 {
          output[t] = 0;
          continue;
        }
      }
    }

    std::mem::forget(input);
    std::mem::forget(output);
    std::mem::forget(shape);
    std::mem::forget(shape1);
  }
}

#[cfg(test)]
mod tests {
  use super::_offset_view;

  #[test]
  fn test_offset_view() {
    let v: Vec<u32> = vec![1, 2, 3, 4, 5];

    unsafe {
      let view = _offset_view(v.as_mut_ptr(), 2, 2);
      assert_eq!(view.len(), 2);
      assert_eq!(view[0], 3);
      assert_eq!(view[1], 4);
    }
  }
}
