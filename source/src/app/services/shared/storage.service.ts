import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { SettingsService } from 'app/services/shared/settings.service';

@Injectable()
export class StorageService {

    public static readonly NAVIGATIONS_MENU_ORDER_KEY = 'cdsm-navigations-menu-order';

    // group_idのキーのプレフィックス
    private static readonly GROUP_ID_PREFIX = 'group_id.';

    // 表示件数設定の登録キー
    private static readonly APP_CDSM_SETTING_KEY_NAME = 'app-cdsm-setting';

    private appCode: string;

    constructor(
        private settingsService: SettingsService
    ) {
        this.appCode = this.settingsService.getAppCode();
    }

    /**
     * localStorage に保存されているデータを取得します。
     * キャッシュにデータがある場合そちらを返します。
     * @param key データを特定するキー
     */
    public getItem(key: string): string {
        return localStorage.getItem(key);
    }

    /**
     * localStorage にデータを保存します。
     * @param key データを特定するキー
     * @param value 保存するデータ
     */
    public setItem(key: string, value: string): void {
        localStorage.setItem(key, value);
    }

    /**
     * localStorage およびキャッシュからデータを削除します。
     * @param key データを特定するキー
     */
    public removeItem(key: string): void {
        localStorage.removeItem(key);
    }

    /**
     * ローカルストレージに引数のkeyの値が存在するか確認する。
     */
    public hasItem(key: string): boolean {
        if (localStorage.getItem(key) !== null) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * ローカルストレージから表示件数を取得する。
     */
    public getPageDisplayCount(): string {
        const appSettingStr: string = this.getItem(StorageService.APP_CDSM_SETTING_KEY_NAME);
        let pageDisplayCount: string = null;
        if (appSettingStr) {
            const apppSettingObj: any = JSON.parse(appSettingStr);
            if (apppSettingObj) {
                pageDisplayCount = apppSettingObj[StorageService.APP_CDSM_SETTING_KEY_NAME];
            }
        }
        return pageDisplayCount;
    }

    /**
     * ローカルストレージに表示件数を保存する。
     */
    public setPageDisplayCount(pageDisplayCount: string): void {

        let isSaveLocalStorage = false;
        if (this.hasItem(StorageService.APP_CDSM_SETTING_KEY_NAME)) {
            const appSettingStr: string = this.getItem(StorageService.APP_CDSM_SETTING_KEY_NAME);
            let apppSettingObj: any = null;
            if (appSettingStr) {
                apppSettingObj = JSON.parse(appSettingStr);
            }

            if (apppSettingObj) {
                apppSettingObj[StorageService.APP_CDSM_SETTING_KEY_NAME] = pageDisplayCount;
                const newAppSettingStr: string = JSON.stringify(apppSettingObj);
                this.setItem(StorageService.APP_CDSM_SETTING_KEY_NAME, newAppSettingStr);
                isSaveLocalStorage = true;
            }
        }

        if (!isSaveLocalStorage) {
            const newAppSetting: {[StorageService.APP_CDSM_SETTING_KEY_NAME]: string}
                = {[StorageService.APP_CDSM_SETTING_KEY_NAME]: pageDisplayCount};
            const newAppSettingStr: any = JSON.stringify(newAppSetting);
            this.setItem(StorageService.APP_CDSM_SETTING_KEY_NAME, newAppSettingStr);
        }
    }

    public getGroupId(): string {
        return this.getItem(this.grouIdKey());
    }

    public setGroupId(groupId: string): void {
        return this.setItem(this.grouIdKey(), groupId);
    }

    public removeGroupId(): void {
        return this.removeItem(this.grouIdKey());
    }

    public hasGroupId(): boolean {
        return this.hasItem(this.grouIdKey());
    }

    private grouIdKey (): string {
        // group_idのキー = 'group_id.' + [app_code]
        const groupIdKey: string = StorageService.GROUP_ID_PREFIX + this.appCode;
        return groupIdKey;
    }

    public getEntranceNextUrl(): string {
        return this.getItem(this.getEntranceNextUrlKey());
    }

    public setEntranceNextUrl(entranceNextUrl: string): void {
        this.setItem(this.getEntranceNextUrlKey(), entranceNextUrl);
    }

    public getEntranceNextUrlKey(): string {
        const entranceNextUrl: string = environment.settings.appPrefix + '-entrance-next';
        return entranceNextUrl;
    }

}
