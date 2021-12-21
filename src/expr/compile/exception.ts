export class ExprParseError extends Error {
  constructor(pos: number, message: string) {
    super(`Parse error at pos ${pos}: ${message}`);
  }
}
