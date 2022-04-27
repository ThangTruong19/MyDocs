export class KindSetting {
  static off = '0';
  static on = '1';
}

export class TargetModelKind {
  static all = '0';
  static select = '1';
}

export class FuelConfirmModalParams {
  static descNames = [
    'label', // 累積燃料消費量インターバル管理項目名称
    'inspection_start_accumulate_fuel', // 点検開始累積燃料消費量
    'accumulate_fuel_interval', // 累積燃料消費量インターバル
    'car_conditions', // 機種型式
    'threshold', // オレンジフラグ閾値
  ];
}

export class SvmNotManagement {
  static on = '0';
  static off = '1';
}
