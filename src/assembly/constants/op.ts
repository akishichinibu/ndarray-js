export namespace Operator {
  export namespace Unary {
    export const Rand = 0b00000001;

    export const Exp = 0b01000001;
    export const Log = 0b01000010;

    export const Sin = 0b01000100;
    export const Cos = 0b01000101;
    export const Tan = 0b01000110;
  }

  export namespace Binary {
    export const Add = 0b10000001;
    export const Sub = 0b10000010;
  }
}
