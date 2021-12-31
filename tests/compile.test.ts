import { toCharacterStream, toTokenStream } from "src/expr";
import { ASTNode } from "src/expr/ast";


test('charter stream', () => {
  const exprs = ["() ", "a", " 123"];
  const s = exprs.join('');

  let t = 0;

  for (let [pos, c, _] of toCharacterStream(exprs as unknown as TemplateStringsArray, [])) {
    expect(c).toEqual(s[t]);
    expect(pos).toEqual(t);
    t += 1;
  }
});


test('parse an expression with a functon', () => {
  const exprs = `sin((a + b) * c + cos(d - e)) + 1`;
  // const exprs = `sin((1 + 2) * 3) * cos(pi) - exp(7 / 3 + 5)`;

  for (let [type, token] of toTokenStream(toCharacterStream([exprs, ] as unknown as TemplateStringsArray, []))) {
    console.log(type, token);
  }
});


test('parse a simple expression', async () => {
  const expr = await ndexpr`(1 + 3) * 7 - 5 / 33`;
  console.log(expr);
});


test('parse an expression with a functon', async () => {
  const expr = await ndexpr`(1 + 3) * sin(7) - 5 / 33`;
  console.log(expr);
});


test('parse an expression with a functon', async () => {
  const expr = await ndexpr`sin((a + b) * c + cos(d - e)) + 1`;
  const register: any[] = [];
  const stack: ASTNode[] = [];

  for (let [type, token] of expr) {
    switch (type) {
      case TokenType.Literal: case TokenType.Variable: {
        const node = new ASTNode(type, register.length);
        stack.push(node);
        register.push(token);
        break;
      }
      case TokenType.Operator: case TokenType.Function: {
        const opNums = type === TokenType.Operator ? 2 : functions.get(token as string)!;

        if (stack.length < opNums) {
          throw new Error("error");
        }

        const childrens = [];
        for (let i = 0; i < opNums; i++) childrens.push(stack.pop()!);
        const node = new ASTNode(TokenType.Function, token, childrens);
        stack.push(node);
        break;
      }
    }
  }

  const r = stack[0];
  console.log(register);
  console.log(JSON.stringify(r, null, 2));
});
