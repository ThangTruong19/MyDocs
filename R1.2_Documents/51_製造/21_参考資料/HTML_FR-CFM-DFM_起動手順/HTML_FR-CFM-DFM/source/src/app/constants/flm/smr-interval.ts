export class KindSetting {
  static off = '0';
  static on = '1';
}

export class TargetModelKind {
  static all = '0';
  static select = '1';
}

export class SmrConfirmModalParams {
  static descNames = [
    'label', // SMRインターバル管理項目名称
    'inspection_start_smr', // 点検開始SMR
    'smr_interval', // SMRインターバル
    'car_conditions', // 機種型式
    'threshold', // オレンジフラグ閾値
  ];
}

export class SvmNotManagement {
  static on = '0';
  static off = '1';
}

export class LatestSmrUnitConsts {
  static second = '0';
  static minute = '1';
  static hour = '2';
}
