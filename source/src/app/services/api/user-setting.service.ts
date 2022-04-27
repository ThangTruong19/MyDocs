import * as _ from 'lodash';
import { Dictionary } from 'lodash';
import { Injectable } from '@angular/core';

import { CommonConfig } from 'app/vendors/k-common-module/interfaces';

import {
    SettingParams,
    SettingParamsItem,
    UserSettings,
    GroupSettings,
    MapParams,
} from 'app/types/user-setting';
import { ConfigHeaderParams } from 'app/types/request';

import { DistanceUnitCode } from 'app/constants/request-header-codes';

@Injectable()
export class UserSettingService {
    userSettings: UserSettings = null;
    groupSettings: GroupSettings = null;

    /**
     * すでにユーザ設定が取得済みかを返す
     */
    public isAlreadySet(): boolean {
        return !_.isEmpty(this.userSettings) && !_.isEmpty(this.groupSettings);
    }

    public updateUserConfigValues(userSettings: SettingParamsItem[]): void {
        this.userSettings = <UserSettings>_.reduce(
            userSettings,
            (result: any, setting: any) => {
                result[setting.key] = setting.value;
                return result;
            },
            {}
        );
    }

    public updateGroupConfigValues(groupSettings: SettingParamsItem[]): void {
        this.groupSettings = <GroupSettings>_.reduce(
            groupSettings,
            (result: any, setting: any) => {
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
    public updateConfigValues(settings: SettingParams): void {
        this.updateUserConfigValues(settings.user_settings);
        this.updateGroupConfigValues(settings.group_settings);
    }

    /**
     * ユーザ設定値からリクエストヘッダを作成して返す
     */
    public getRequestHeaders(): ConfigHeaderParams {
        if (_.isEmpty(this.userSettings)) {
            return null;
        }

        const headers: ConfigHeaderParams = {
            'X-Lang': this.userSettings.lang_code ? this.userSettings.lang_code : undefined,
            'X-DateFormat': this.userSettings.date_format_code ? this.userSettings.date_format_code : undefined,
            'X-DistanceUnit': this.userSettings.distance_unit_code ? this.userSettings.distance_unit_code : undefined,
            'X-TemperatureUnit': this.userSettings.temperature_unit_code ? this.userSettings.temperature_unit_code : undefined,
            'X-CarDivision': this.userSettings.division_display_kind ? this.userSettings.division_display_kind : undefined
        };
        return headers;

    }

    /**
     * ユーザ設定値から共通ヘッダ用の値を作成して返す
     */
    public getConfigValues(): CommonConfig {
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
    public getMapParams(): MapParams {
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
    public getMapApplication(): string {
        return this.groupSettings && this.groupSettings.map_mode
            ? this.groupSettings.map_mode
            : '0';
    }

    /**
     * 言語設定を返す
     */
    public getLang(): string {
        return this.userSettings && this.userSettings.lang_code
            ? this.userSettings.lang_code
            : 'ja-JP';
    }

    /**
     * 距離単位設定をラベルのnameで返す
     */
    public getDistanceUnit(): string {
        return this.userSettings.distance_unit_code === DistanceUnitCode.meter
            ? 'kilometer'
            : 'mile';
    }

    /**
     * 液量体積の単位設定をラベルのnameで返す
     */
    public getVolumeUnit(): string {
        return this.userSettings.distance_unit_code === DistanceUnitCode.meter
            ? 'liter'
            : 'gallon';
    }

    /**
     * デートピッカーの設定を返す
     */
    public getDatePickerConfig(): {
        date_format_code: string;
        time_difference: string;
        first_day_of_week_kind: number;
    } {
        return {
            date_format_code: this.userSettings.date_format_code,
            time_difference: this.groupSettings.time_difference,
            first_day_of_week_kind: +this.groupSettings.first_day_of_week_kind,
        };
    }

}
