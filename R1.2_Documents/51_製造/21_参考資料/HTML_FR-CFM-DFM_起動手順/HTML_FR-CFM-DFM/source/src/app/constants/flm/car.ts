export class RegistrationCarKind {
  static standard = '0';
  static retrofit = '1';
}

export class DataPublishKind {
  static all = '0';
  static afterDeliveryDate = '1';
}

export class NewUsedKind {
  static newCar = '0';
  static usedCar = '1';
}

export class SmrIntervalItemCustomKind {
  static impossible = '0';
  static possible = '1';
}

export class AccumulateFuelIntervalItemCustomKind {
  static impossible = '0';
  static possible = '1';
}

export class OrbcommRequestTargetKind {
  static notTarget = '0';
  static target = '1';
}

export class UpdateTargetKind {
  static attribute = '0';
  static mainInfo = '1';
}

export class ManagementTarget {
  static all = '0';
  static subGroup = '1';
}

export class TerminalUseStartKind {
  static notOpened = '0';
  static notStarted = '1';
  static inPreparation = '2';
  static retryOver = '3';
  static finished = '4';
}

export class OrbcommRequestStatus {
  static unapplied = '0';
  static applied = '1';
}

export class RentalCarKind {
  static support = '0';
  static notSupport = '1';
}

export class TimeDifferenceSettingKind {
  static fifteenMinutes = '0';
  static thirtyMinutes = '1';
}

export class TimeDifferenceSettingChangeStatus {
  static changed = '0';
  static changing = '1';
  static retryOver = '2';
}
