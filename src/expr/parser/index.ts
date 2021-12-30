import { VariableType } from 'src/expr/utils';
import { toReversePolish, toTokenStream, toCharacterStream } from '..';

export const parser = (strings: TemplateStringsArray, ...keys: Array<VariableType>) => {
  return toReversePolish(toTokenStream(toCharacterStream(strings, keys)));
};
