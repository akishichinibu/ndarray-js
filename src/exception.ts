
export class IndexError extends Error { }

export class RunningTimeError extends Error { }

export class ExprParseError extends Error {
  constructor(pos: number, message: string) {
    super(`Parse error at pos ${pos}: ${message}`);
  }
}

export class ExprEvalError extends Error {
  constructor(message: string) {
    super(`Eval error: ${message}`);
  }
}
