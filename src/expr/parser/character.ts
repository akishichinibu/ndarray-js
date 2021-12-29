import { VariableType, CharacterStream } from "src/expr/utils";


function* toCharacterStream(strings: TemplateStringsArray, keys: Array<VariableType>): CharacterStream<VariableType> {
  let t = 0;
  let c = 0;

  for (let part of strings) {
    const n = part.length;

    for (let i = 0; i < n; i++) {
      yield [c, part.charAt(i), part.charCodeAt(i)];
      c += 1;
    }

    if (t < keys.length) {
      yield [c, keys[t], 0];
      c += 1;
      t += 1;
    }
  }
}


export default toCharacterStream;
