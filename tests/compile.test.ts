import { ndeval } from "src/expr";
import { toCharacterStream, toTokenStream, toReversePolish } from "src/expr/compile";


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
  const exprs = `sin((1 + 2) * 3) * cos(pi) - exp(7 / 3 + 5)`;

  for (let [type, token] of toTokenStream(toCharacterStream([exprs, ] as unknown as TemplateStringsArray, []))) {
    console.log(type, token);
  }
});


test('parse a simple expression', async () => {
  const expr = await ndeval`(1 + 3) * 7 - 5 / 33`;
});


test('parse an expression with a functon', async () => {
  const expr = await ndeval`(1 + 3) * sin(7) - 5 / 33`;
});
