import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { CommonConfig } from 'app/vendors/k-common-module/interfaces';
import {
    SettingParams,
    SettingParamsItem,
    UserSettings,
    GroupSettings,
    MapParams,
    UserSettingValues,
} from 'app/types/user-setting';
import { ConfigHeaderParams } from 'app/types/request';
import { DistanceUnitCode } from 'app/constants/request-header-codes';

@Injectable()
export class UserSettingService {

    private settings: UserSettingValues = {
        userSettings: null,
        groupSettings: null
    }

    /**
     * すでにユーザ設定が取得済みかを返す
     */
    public isAlreadySet(): boolean {
        return !_.isEmpty(this.settings.userSettings) && !_.isEmpty(this.settings.groupSettings);
    }

    public updateUserConfigValues(userSettings: SettingParamsItem[]): void {
        this.settings.userSettings = <UserSettings>_.reduce(
            userSettings,
            (result: any, setting: any) => {
                result[setting.key] = setting.value;
                return result;
            },
            {}
        );
    }

    public updateGroupConfigValues(groupSettings: SettingParamsItem[]): void {
        this.settings.groupSettings = <GroupSettings>_.reduce(
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
        if (_.isEmpty(this.settings.userSettings)) {
            return null;
        }

        const headers: ConfigHeaderParams = {
            'X-Lang': this.settings.userSettings.lang_code ? this.settings.userSettings.lang_code : undefined,
            'X-DateFormat': this.settings.userSettings.date_format_code ? this.settings.userSettings.date_format_code : undefined,
            'X-DistanceUnit': this.settings.userSettings.distance_unit_code ? this.settings.userSettings.distance_unit_code : undefined,
            'X-TemperatureUnit': this.settings.userSettings.temperature_unit_code ? this.settings.userSettings.temperature_unit_code : undefined,
            'X-CarDivision': this.settings.userSettings.division_display_kind ? this.settings.userSettings.division_display_kind : undefined
        };
        return headers;

    }

    /**
     * ユーザ設定値から共通ヘッダ用の値を作成して返す
     */
    public getConfigValues(): CommonConfig {
        return {
            temperatureUnit: this.settings.userSettings.temperature_unit_code,
            dateFormat: this.settings.userSettings.date_format_code,
            carDivision: this.settings.userSettings.division_display_kind,
            locale: this.settings.userSettings.lang_code,
            distanceUnit: this.settings.userSettings.distance_unit_code,
            initialScreen: this.settings.userSettings.default_page_url,
        };
    }

    /**
     * 地図初期パラメータを返す
     */
    public getMapParams(): MapParams {
        return {
            lat: this.settings.userSettings.map_latitude,
            lng: this.settings.userSettings.map_longitude,
            zoom: this.settings.userSettings.map_magnification,
            mapApplication: this.getMapApplication(),
        };
    }

    /**
     * マップ種別を返す
     */
    public getMapApplication(): string {
        return this.settings.groupSettings && this.settings.groupSettings.map_mode
            ? this.settings.groupSettings.map_mode
            : '0';
    }

    /**
     * 言語設定を返す
     */
    public getLang(): string {
        return this.settings.userSettings && this.settings.userSettings.lang_code
            ? this.settings.userSettings.lang_code
            : null;
    }

    /**
     * 距離単位設定をラベルのnameで返す
     */
    public getDistanceUnit(): string {
        return this.settings.userSettings.distance_unit_code === DistanceUnitCode.meter
            ? 'kilometer'
            : 'mile';
    }

    /**
     * 液量体積の単位設定をラベルのnameで返す
     */
    public getVolumeUnit(): string {
        return this.settings.userSettings.distance_unit_code === DistanceUnitCode.meter
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
            date_format_code: this.settings.userSettings.date_format_code,
            time_difference: this.settings.groupSettings.time_difference,
            first_day_of_week_kind: +this.settings.groupSettings.first_day_of_week_kind,
        };
    }

}
