export const operators = new Map<string, number>([
  ["+", 20],
  ["-", 20],
  ["*", 30],
  ["/", 30],
  ["^", 40],
  ["**", 40],
]);


export const constants = new Map<string, number>([
  ["pi", Math.PI],
  ["e", Math.E],
]);


export const functions = new Map<string, number>([
  ["sin", 1],
  ["cos", 1],
  ["tan", 1],
  ["sinh", 1],
  ["cosh", 1],
  ["tanh", 1],
  ["exp", 1],
  ["log", 1],
  ["log2", 1],
  ["log10", 1],
]);
