import { FilterReservedWord } from '../condition';

export class ScopeGroupKind {
  static notSet = '0';
  static set = '1';
  static all = FilterReservedWord.selectAll;
}
