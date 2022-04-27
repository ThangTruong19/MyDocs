export class OperatorIdentificationKind {
  static off = '0';
  static idInput = '1';
  static idKey = '3';
}

export class RegistrationStatusKind {
  static configurable = '0';
  static disabled = '1';
}

export class OperatorRegisterSize {
  static maxSize = 10;
  static extendSize = 5;
}

export class InputCarIndexOperatorRegisterSize {
  static maxSize = 12;
  static extendSize = 3;
}

export const InitialOperatorCodePattern = /^[0-9a-fA-F]{2}-[0-9a-fA-F]{2}-[0-9a-fA-F]{2}$/;
