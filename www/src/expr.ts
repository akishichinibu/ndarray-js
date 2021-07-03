import { NdArray } from "./ndarray";
import { between, ord, randomString } from "./utils";
import * as kernel from "ndarray-kernel";

export function parse_to_token(expr: String) {
  const n = expr.length;
  const t = kernel.alloc(n);
  const buffer = new Uint8Array(kernel.wasm_memory().buffer, t, n);
  for (let i = 0; i < n; i++) buffer[i] = expr.charCodeAt(i);
  kernel.parse_to_expr(t, n);
}


class PraseError extends Error {

}

const VARIABLE_OFFSET = 128;
const OPERATOR_OFFSET = 64;

const CODE_LEFT_PARENTHESIS = 53;
const CODE_RIGHT_PARENTHESIS = 54;

const operatorTable: Array<[string, number]> = [
  ['+', 0],
  ['-', 0],
  ['*', 1],
  ['/', 1],
  ['%', 2],
  ['^', 2],
  ['&', 1],
  ['|', 1],
  ['!', 3],
  ['~', 3],
  ['||', 0],
  ['&&', 0],
];


const operandsNums: Array<[string, number]> = [
  ['+', 2],
  ['-', 2],
  ['*', 2],
  ['/', 2],
  ['%', 2],
  ['^', 2],
  ['&', 2],
  ['|', 2],
  ['!', 1],
  ['~', 1],
  ['||', 2],
  ['&&', 2],
];

const operatorOrder = new Map(operatorTable);
const operatorOprandsNums = new Map(operandsNums);

const operatorIndex = new Map(operatorTable.map(([k, _], i) => [k, i + OPERATOR_OFFSET]));
const indexOperator = new Map(Array.from(operatorIndex).map(([k, i]) => [i, k]));

const opPrefixCharCodeSet = new Set(operatorTable.map(([k, _]) => k.charCodeAt(0)));

console.log(operatorOrder);
console.log(operatorIndex);
console.log(indexOperator);
console.log(opPrefixCharCodeSet);

const isNumber = (c: number) => between(c, 48, 58);

const isAlphabet = (c: number) => between(c, 65, 91) || between(c, 97, 123);

const isVariableToken = (c: number) => isNumber(c) || isAlphabet(c) || c === ord('_') || c === ord('@');


export class Node {
  op: number;
  left: Node | null;
  right: Node | null;

  constructor(op: number, left: Node | null, right: Node | null) {
    this.op = op;
    this.left = left;
    this.right = right;
  }
}


export class Expression {
  private readonly expression: string;
  private readonly length: number;

  private readonly variable2Index: Map<string, number>;
  private readonly index2Variable: Map<number, string>;
  private readonly valueScope: Array<string | number | NdArray>;

  private ot: number;
  private output: Uint32Array;
  private constantVariableMap: Map<string, string>;

  constructor(expression: string, scope: { [key: string]: NdArray | number | string }) {
    this.expression = Expression.removeUselessSpace(expression);
    this.length = this.expression.length;

    this.ot = 0;
    this.output = new Uint32Array(this.length);

    this.variable2Index = new Map(Object.entries(scope).map(([k, _], i) => [k, i + VARIABLE_OFFSET]));
    this.index2Variable = new Map(Array.from(this.variable2Index).map(([k, i]) => [i + VARIABLE_OFFSET, k]));
    this.valueScope = Array.from(this.variable2Index.keys()).map(k => scope[k]);

    this.constantVariableMap = new Map<string, string>();
  }

  private static removeUselessSpace(expr: string) {
    let t = 0;
    let n = expr.length;
    const expressionCharBuffer = [];

    while (t < n) {
      expressionCharBuffer.push(expr[t]);
      if (expr.charCodeAt(t) === 32) {
        while (expr.charCodeAt(t) === 32) t++;
      } else {
        t++;
      }
    }

    return expressionCharBuffer.join("").trim();
  }

  private addNewVariable(variable: string, value: string) {
    const n = this.valueScope.length;
    const newIndex = n + VARIABLE_OFFSET;
    this.variable2Index.set(variable, newIndex);
    this.index2Variable.set(newIndex, variable);
    this.valueScope.push(value);
    return newIndex;
  }

  private addConstantVariable(value: string) {
    if (!this.constantVariableMap.has(value)) {
      const variable = randomString();
      const index = this.addNewVariable(variable, value);
      this.constantVariableMap.set(value, variable);
    }

    return this.variable2Index.get(this.constantVariableMap.get(value)!)!;
  }

  get opcode() {
    return this.output.slice(0, this.ot);
  }

  compile() {
    let t = 0;

    this.ot = 0;

    let opt = 0;
    const opTypeStack = new Uint8Array(this.length);
    const opPositionStack = new Uint32Array(this.length);

    let nt = 0;
    const numberTokenBuffer = new Uint8Array(this.length);

    let vt = 0;
    const variableTokenBuffer = new Uint8Array(this.length);

    let obt = 0;
    const operatorTokenBuffer = new Uint8Array(this.length);

    while (t < this.length) {
      let tokenCode = this.expression.charCodeAt(t);
      console.log(t, this.ot, this.output, JSON.stringify(Array.from(opTypeStack)), JSON.stringify(Array.from(opPositionStack)), opt);

      // if the current token is a space, ignore it and skip
      if (tokenCode === 32) {
        t++;
        continue;
      }

      // if the current token is the left parenthesis, push it in the stack
      if (tokenCode === ord('(')) {
        opTypeStack[opt] = CODE_LEFT_PARENTHESIS;
        opPositionStack[opt++] = t++;
        continue;
      }

      // if the current token is the right parenthesis, 
      if (tokenCode === ord(')')) {
        while (true) {
          if (opt === 0) {
            throw new PraseError(`The ')' in the pos ${t} is not matched with a '('. `);
          }
          const lastOp = opTypeStack[opt-- - 1];
          if (lastOp === CODE_LEFT_PARENTHESIS) {
            break;
          }
          this.output[this.ot++] = lastOp;
        }
        t++;
        continue;
      }

      // if the current token is a number, 
      if (isNumber(tokenCode)) {
        nt = 0;
        do {
          numberTokenBuffer[nt++] = tokenCode;
          tokenCode = this.expression.charCodeAt(++t);
        } while (t < this.length && isNumber(tokenCode));

        const aNumber = String.fromCharCode(...numberTokenBuffer.slice(0, nt));
        this.output[this.ot++] = this.addConstantVariable(aNumber);
        continue;
      }

      // if the current token is a part of a variable, 
      if (isAlphabet(tokenCode)) {
        vt = 0;
        do {
          variableTokenBuffer[vt++] = tokenCode;
          tokenCode = this.expression.charCodeAt(++t);
        } while (t < this.length && isVariableToken(tokenCode));

        const variable = String.fromCharCode(...variableTokenBuffer.slice(0, vt));

        if (this.variable2Index.has(variable)) {
          this.output[this.ot++] = this.variable2Index.get(variable)!;
          continue;
        }

        throw new PraseError(`The variable ${variable} is not defined in scope. `);
      }

      // if the current token is a part of an operator, 
      if (opPrefixCharCodeSet.has(tokenCode)) {
        obt = 0;
        do {
          operatorTokenBuffer[obt++] = tokenCode;
          tokenCode = this.expression.charCodeAt(++t);
        } while (t < this.length && opPrefixCharCodeSet.has(tokenCode));

        let op = String.fromCharCode(...operatorTokenBuffer.slice(0, obt));

        if (!operatorOrder.has(op)) {
          throw new PraseError(`Unknown operator ${op}. `);
        }

        const currentOrder = operatorOrder.get(op)!;

        while (opt > 0) {
          let last = opTypeStack[opt - 1];
          let lastOrder = operatorOrder.get(indexOperator.get(last)!)!;

          console.log("@@@@", last, indexOperator.get(last)!, lastOrder, op, currentOrder);

          if (last === CODE_LEFT_PARENTHESIS || currentOrder > lastOrder) {
            break;
          }

          opt--;
          this.output[this.ot++] = last;
        }

        opTypeStack[opt] = operatorIndex.get(op)!;
        opPositionStack[opt++] = t++;
        continue;
      }

      throw new PraseError(`Unexpect token ${String.fromCharCode(tokenCode)}`);
    }

    console.log(t, this.ot, this.output, JSON.stringify(Array.from(opTypeStack)), JSON.stringify(Array.from(opPositionStack)), opt);

    while (opt > 0) {
      const last = opTypeStack[opt - 1];
      const lastIndex = opPositionStack[opt - 1];

      if (last === ord('(')) {
        throw new PraseError(`The '(' in the post ${lastIndex} is not match with ')'. `);
      }

      this.output[this.ot++] = last;
      opt -= 1;
    }
    

    return this;
  }

  buildTree() {
    const operandStack: Array<Node> = [];

    for (let t = 0; t < this.ot; t++) {
      const token = this.output[t];

      if (token >= 128) {
        operandStack.push(new Node(token, null, null));
      } else {
        const opChar = indexOperator.get(token)!;
        const num = operatorOprandsNums.get(opChar)!;
        const n = operandStack.length;

        if (n < num) {
          throw new PraseError(`The operator '${opChar}' needs ${num} oprands but there're only ${n}. `);
        }
        
        const right = operandStack.pop()!;
        const left = num === 1 ? null : operandStack.pop()!;
        const node = new Node(token, left, right);
        operandStack.push(node);
      }
    }

    if (operandStack.length === 1) {
      return operandStack[0];
    } else {
      throw new PraseError("Operands error");
    }
  }

  eval() {
    const operandStack: Array<number> = [];

    for (let t = 0; t < this.ot; t++) {
      const token = this.output[t];

      if (token >= 128) {
        operandStack.push(Number(this.valueScope[token - VARIABLE_OFFSET]));
      } else {
        const opChar = indexOperator.get(token)!;
        const num = operatorOprandsNums.get(opChar)!;
        const n = operandStack.length;

        if (n < num) {
          throw new PraseError(`The operator '${opChar}' needs ${num} oprands but there're only ${n}. `);
        }
        
        const right = operandStack.pop()!;
        const left = num === 1 ? null : operandStack.pop()!;
        let result = 0;

        switch (token) {
          case 64: {
            result = left! + right;
            break;
          }
          case 65: {
            result = left! - right;
            break;
          }
          case 66: {
            result = left! * right;
            break;
          }
          case 67: {
            result = left! / right;
            break;
          }
        }

        console.log(left, right, token, result);
        operandStack.push(result);
      }
    }

    if (operandStack.length === 1) {
      return operandStack[0];
    } else {
      throw new PraseError("Operands error");
    }
  }
}


export function buildExprTree(tokenSequence: Array<string | number>) {
  const operandStack = [];

  while (tokenSequence.length > 0) {
    const last = tokenSequence.pop()!;

    if (true) {

    }
  }
}
