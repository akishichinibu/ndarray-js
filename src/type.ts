type IntegerTypePrefix = 'i';
type UnsignedIntegerTypePrefix = 'u';
type FlotTypePrefix = 'f';

type IntegerBitLength = 8 | 16 | 32;
type FloatBitLength = 32 | 64;

type IntegerType = `${IntegerTypePrefix}${IntegerBitLength}`;
type UnsignedIntegerType = `${UnsignedIntegerTypePrefix}${IntegerBitLength}`;
type FloatType = `${FlotTypePrefix}${FloatBitLength}`;

export type TypedScalerType = IntegerType | UnsignedIntegerType | FloatType;

export type ScalerType = TypedScalerType;

export type Ptr = number;

export function getTypeConstructor(dtype: ScalerType) {
  switch (dtype) {
    case 'i8':
      return Int8Array;
    case 'i16':
      return Int16Array;
    case 'i32':
      return Int32Array;
    case 'u8':
      return Uint8Array;
    case 'u16':
      return Uint16Array;
    case 'u32':
      return Uint32Array;
    case 'f32':
      return Float32Array;
    case 'f64':
      return Float64Array;
    // case 'boolean':
    //   return Uint8Array;
  }
}

export type TypedArray = InstanceType<ReturnType<typeof getTypeConstructor>>;

export interface NumericArray extends ArrayLike<number> {
  [n: number]: number;
  fill: (value: number) => this;
}

export type CouldBePromise<T> = T | Promise<T>;
