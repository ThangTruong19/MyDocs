import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from 'app/services/api/api.service';
import { AuthenticationService } from 'app/services/shared/authentication.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { ComponentRefService } from 'app/services/shared/component-ref.service';
import { EntranceService } from 'app/services/shared/entrance.service';
import { StorageService } from 'app/services/shared/storage.service';
import { LoggingService } from 'app/services/shared/logging.service';
import { SettingsService } from 'app/services/shared/settings.service';

/**
 * メインフレーム
 *
 * ※以下の順序でURLに対応する各Componentが呼び出される。
 *   1. 画面表示URLを実行。
 *   2. index.htmlが呼ばれる。
 *   3. app-index.component.tsが呼ばれる。
 *   4. app-index.component.htmlが呼ばれる。(router-outlet タグが読み込まれる。)
 *   5. app-routing.module.tsに記述されているrouterの設定により、URLに対応するComponentが呼ばれる。
 */
@Component({
    selector: 'app-index',
    templateUrl: './app-index.component.html'
})
export class AppIndexComponent implements OnInit {

    public isLoading: boolean;
    public subscription: Subscription;

    constructor(
        public header: CommonHeaderService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private apiService: ApiService,
        private authService: AuthenticationService,
        private componentRefService: ComponentRefService,
        private entranceService: EntranceService,
        private loggingService: LoggingService,
        private settingsService: SettingsService,
        private storageService: StorageService
    ) {
    }

    ngOnInit(): void {
        this.init();
    }

    /**
     * 初期処理を行う。
     */
    private init(): void {

        this.isLoading = true;

        this.loggingService.outputVersionLog();

        const isSkipAuthentication: boolean = this.settingsService.isSkipAuthentication();

        this.router.events.subscribe((event: any) => {
            if (
                event instanceof NavigationStart &&
                !event.url.includes('/entrance')
            ) {
                this.storageService.setEntranceNextUrl(this.entranceService.buildNextUrl(event.url));
                this.activatedRoute.queryParams.subscribe((params: Params) => {
                    if (params.group_id) {
                        this.storageService.setGroupId(params.group_id);
                    }
                });
            }

            // 認証後、groupId がない場合強制的にエントランス画面へ
            if (event instanceof NavigationEnd && !event.url.includes('/entrance')) {
                if (
                    !isSkipAuthentication &&
                    !this.storageService.hasGroupId()
                ) {
                    this.authService.authentication().then(() => {
                        this.entranceService.transitionEntrance();
                    });
                }
            }

            if (event instanceof NavigationEnd) {
                document.body.className = '';
            }
        });
    }

    /**
     * RouterOutlet にコンポーネントが読み込まれた時の処理
     * @param component コンポーネント
     */
    public componentAdded(component: any): void {
        this.componentRefService.componentRef = component;
        this.apiService.initialResouce = {};
        this.subscription = component.onLoadEvent.subscribe(
            () => (this.isLoading = false)
        );
    }

    /**
     * RouterOutlet からコンポーネントが外された時の処理
     * @param event イベント
     */
    public componentRemoved(event: Event): void {
        if (this.subscription.hasOwnProperty('unsubscribe')) {
            this.subscription.unsubscribe();
        }
        this.isLoading = true;
    }

}