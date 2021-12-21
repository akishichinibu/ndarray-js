import { ndeval } from "src/expr";
import { toCharacterStream, toTokenStream, toReversePolish } from "src/expr/compile";
import { array } from "src/ndarray";


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


test('a array whose elements are all 1', async () => {
  const t = array([[1, 2, 3], [4, 5, 6],]);
  const expr = await ndeval`(1 + 3) * 7 - 5 / 33`;
  console.log(expr);
});
