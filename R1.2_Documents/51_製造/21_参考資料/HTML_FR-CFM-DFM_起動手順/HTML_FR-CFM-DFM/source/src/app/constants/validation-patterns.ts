/**
 * バリデーションに使用する正規表現のパターン
 */
export const validationPattern = {
  alphanumericSymbol: '^[a-zA-Z0-9!-/:-@¥[-`{-~]+$',
  alphanumeric: '^[a-zA-Z0-9]+$',
  floatnumericPoint: '^([1-9]\\d*|0)(.\\d{1})?$',
  phoneNumber: '[\\d-()]+',
  email: '^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$',
  numeric: '^[0-9]+$',
  beginEndRepeatSpace: '^(?![ 　])(?!.*[ 　]$)(?!.*[ 　][ 　]).*$', // 連続したスペースと先頭末尾のスペースは入力不可(半角・全角両方)
  alphanumericHyphen: '[a-zA-Z0-9-]',
  errorCode: '^[a-zA-Z0-9!-/:-@¥[-`{-~]+$',
  integer: '(0|-?[1-9][0-9]*)$',
  naturalNumber: '^[1-9][0-9]*$',
  alphanumericSpace: '^[a-zA-Z0-9 ]+$',
  coordinatesValue: '^-?[0-9]+(.[0-9]+)?$',
};
