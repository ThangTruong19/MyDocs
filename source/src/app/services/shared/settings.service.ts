import { Injectable } from '@angular/core';
import {
    AppSettings, AppSettingsAzureAdAuthenticationInfo, AppSettingsDevelop, AppVersion
} from 'app/types/settings';

/**
 * 外部設定ファイルのデータ取得用のサービス。
 */
@Injectable()
export class SettingsService {

    private appSettings: AppSettings; // setting.jsから読み込む

    private appVersionInfo: AppVersion; // version.jsから読み込む

    constructor(
    ) {
        this.load();
    }

    /**
     * 外部設定ファイル読み込み処理
     */
    private load(): void {

        this.appSettings = (window as any).settings;
        this.appVersionInfo = {
            appVersion: (window as any).appVersion,
            appVendorVersion: (window as any).appVendorVersion
        }

        if (this.appSettings
            && (this.appSettings.azureAdAuthenticationInfo
                && this.appSettings.azureAdAuthenticationInfo.clientId)
            && !this.appSettings.appCode) {
            this.appSettings.appCode = this.appSettings.azureAdAuthenticationInfo.clientId;
        }
    }

    public getAppSettings(): AppSettings {
        return this.appSettings;
    }

    public getAppVersionInfo(): AppVersion {
        return this.appVersionInfo;
    }

    public getAppCode(): string {
        if (this.appSettings && this.appSettings.appCode) {
            return this.appSettings.appCode;
        } else {
            return null;
        }
    }

    public isSkipAuthentication(): boolean {
        if (this.appSettings && this.appSettings.skipAuthentication) {
            return  true;
        } else {
            return false;
        }
    }

    public isUseEntranceForDevelop(): boolean {
        if (this.appSettings && this.appSettings.useEntranceForDevelop) {
            return  true;
        } else {
            return false;
        }
    }

    public getAzureAdAuthenticationInfo(): AppSettingsAzureAdAuthenticationInfo {
        if (this.appSettings && this.appSettings.azureAdAuthenticationInfo) {
            return this.appSettings.azureAdAuthenticationInfo;
        } else {
            return null;
        }
    }

    public getDevelop(): AppSettingsDevelop {
        if (this.appSettings && this.appSettings.develop) {
            return this.appSettings.develop;
        } else {
            return null;
        }
    }

}
