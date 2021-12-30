import constants from 'src/constants';
import { VariableType } from './utils';

export class ASTNode {
  constructor(readonly type: constants.TokenType, readonly value: VariableType | null, readonly childrens: ASTNode[] = []) {}
}
