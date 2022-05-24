import { Injectable } from '@angular/core';
import { KOMATSU_VERSION as authModuleVersion } from 'app/vendors/ngk-azure-ad-authentication/komatsu-version';
import { KOMATSU_VERSION as commonModuleVersion } from 'app/vendors/k-common-module/komatsu-version';
import { SettingsService } from 'app/services/shared/settings.service';
import { AppVersion } from 'app/types/settings';

/**
 * ログ出力用サービス
 */
@Injectable()
export class LoggingService {

    /**
     * コンストラクタ
     */
    constructor(
        private settingsService: SettingsService,
    ) {
    }

    /**
     * バージョン情報をブラウザのコンソールに出力する。
     */
    public outputVersionLog(): void {
        if (this.hasConsoleApi()) {
            const appVersionInfo: AppVersion = this.settingsService.getAppVersionInfo();
            this.outputConsoleLog(appVersionInfo.appVersion);
            this.outputConsoleLog(appVersionInfo.appVendorVersion);
            this.outputConsoleLog(commonModuleVersion);
            this.outputConsoleLog(authModuleVersion);
        }
    }

    /**
     * アプリのバージョンのログをコンソール上に表示する。
     */
    private outputConsoleLog(message: string): void {
        if (message) {
            console.log(message);
        }
    }

    /**
     * ConsoleAPIに対応してるか否かを判定する。
     * @return true：対応している（使用可能）、false：未対応（使用不可能）
     */
    private hasConsoleApi(): boolean {
        if (window.console
            && window.console.log
            && typeof window.console.log === 'function') {
            return true;
        } else {
            return false;
        }
    }

}
