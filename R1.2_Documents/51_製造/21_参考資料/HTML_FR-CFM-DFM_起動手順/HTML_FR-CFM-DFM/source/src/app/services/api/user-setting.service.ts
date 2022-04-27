import * as _ from 'lodash';
import { Injectable } from '@angular/core';

import { CommonConfig } from '../../vendor/k-common-module/interfaces';

import {
  SettingParams,
  SettingParamsItem,
  UserSettings,
  GroupSettings,
  MapParams,
} from '../../types/user-setting';
import { ConfigHeaderParams } from '../../types/request';

import { DistanceUnitCode } from '../../constants/request-header-codes';

@Injectable()
export class UserSettingService {
  userSettings: UserSettings = null;
  groupSettings: GroupSettings = null;

  /**
   * すでにユーザ設定が取得済みかを返す
   */
  isAlreadySet(): boolean {
    return !_.isEmpty(this.userSettings) && !_.isEmpty(this.groupSettings);
  }

  updateUserConfigValues(userSettings: SettingParamsItem[]): void {
    this.userSettings = _.reduce(
      userSettings,
      (result, setting) => {
        result[setting.key] = setting.value;
        return result;
      },
      {}
    );
  }

  updateGroupConfigValues(groupSettings: SettingParamsItem[]): void {
    this.groupSettings = _.reduce(
      groupSettings,
      (result, setting) => {
        result[setting.key] = setting.value;
        return result;
      },
      {}
    );
  }

  /**
   * ユーザ設定値の更新
   * @param settings 設定情報
   */
  updateConfigValues(settings: SettingParams): void {
    this.updateUserConfigValues(settings.user_settings);
    this.updateGroupConfigValues(settings.group_settings);
  }

  /**
   * ユーザ設定値からリクエストヘッダを作成して返す
   */
  getRequestHeaders(): ConfigHeaderParams {
    if (_.isEmpty(this.userSettings)) {
      return null;
    }

    return _.omitBy(
      {
        'X-Lang': this.userSettings.lang_code,
        'X-DateFormat': this.userSettings.date_format_code,
        'X-DistanceUnit': this.userSettings.distance_unit_code,
        'X-TemperatureUnit': this.userSettings.temperature_unit_code,
        'X-CarDivision': this.userSettings.division_display_kind,
      },
      _.isEmpty
    );
  }

  /**
   * ユーザ設定値から共通ヘッダ用の値を作成して返す
   */
  getConfigValues(): CommonConfig {
    return {
      temperatureUnit: this.userSettings.temperature_unit_code,
      dateFormat: this.userSettings.date_format_code,
      carDivision: this.userSettings.division_display_kind,
      locale: this.userSettings.lang_code,
      distanceUnit: this.userSettings.distance_unit_code,
      initialScreen: this.userSettings.default_page_url,
    };
  }

  /**
   * 地図初期パラメータを返す
   */
  getMapParams(): MapParams {
    return {
      lat: this.userSettings.map_latitude,
      lng: this.userSettings.map_longitude,
      zoom: this.userSettings.map_magnification,
      mapApplication: this.getMapApplication(),
    };
  }

  /**
   * マップ種別を返す
   */
  getMapApplication(): string {
    return this.groupSettings && this.groupSettings.map_mode
      ? this.groupSettings.map_mode
      : '0';
  }

  /**
   * 言語設定を返す
   */
  getLang(): string {
    return this.userSettings && this.userSettings.lang_code
      ? this.userSettings.lang_code
      : 'ja-JP';
  }

  /**
   * 距離単位設定をラベルのnameで返す
   */
  getDistanceUnit(): string {
    return this.userSettings.distance_unit_code === DistanceUnitCode.meter
      ? 'kilometer'
      : 'mile';
  }

  /**
   * 液量体積の単位設定をラベルのnameで返す
   */
  getVolumeUnit(): string {
    return this.userSettings.distance_unit_code === DistanceUnitCode.meter
      ? 'liter'
      : 'gallon';
  }

  /**
   * デートピッカーの設定を返す
   */
  getDatePickerConfig() {
    return {
      date_format_code: this.userSettings.date_format_code,
      time_difference: this.groupSettings.time_difference,
      first_day_of_week_kind: +this.groupSettings.first_day_of_week_kind,
    };
  }

  /**
   * ジョブサイト・現場管理の設定を返す
   */
  getSiteManagementMapSetting() {
    return _(this.userSettings)
      .pick([
        'model_type_serial_caption_display_kind',
        'customer_car_no_caption_display_kind',
        'customer_label_caption_display_kind',
        'landmark_label_caption_display_kind',
      ])
      .mapValues(value => !!+value)
      .value();
  }
}
