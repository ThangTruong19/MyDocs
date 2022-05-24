import { Injectable } from '@angular/core';
import { SettingsService } from 'app/services/shared/settings.service';
import { StorageService } from 'app/services/shared/storage.service';

@Injectable()
export class EntranceService {

    private settings: any = (window as any).settings;

    constructor(
        private settingsService: SettingsService,
        private storageService: StorageService
    ) { }

    /**
     * エントランス画面に遷移する
     */
    public transitionEntrance(groupId?: string, isPolicy: boolean = false): void {
        // 利用規約再許諾時は遷移先が異なる
        let entranceUrl: string = isPolicy
            ? this.settings.reconsentUrl
            : this.settings.entranceUrl;

        const appCode: string = this.settingsService.getAppCode();
        const nextUrl: string = this.storageService.getEntranceNextUrl();

        // サブディレクトリを含むトップ画面のパスを取得する
        entranceUrl += `?next=${encodeURIComponent(nextUrl)}&app_code=${appCode}`;
        if (!/\?(?:[\w_]+=[\w\d]+&?)*group_id=\d+/.test(nextUrl) && groupId) {
            entranceUrl += `&group_id=${groupId}`;
        }
        location.href = entranceUrl;
    }

    /**
     * nextに代入するためのURLを生成する
     */
    public buildNextUrl(url: string): string {
        const base: HTMLBaseElement = document.querySelector('base');

        return base
            ? base.href.replace(/\/$/, '') + `/${url.replace(/^\//, '')}`
            : url;
    }

}
