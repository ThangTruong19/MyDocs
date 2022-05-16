import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from 'environments/environment';
import { KOMATSU_VERSION as authModuleVersion } from 'app/vendors/ngk-azure-ad-authentication/komatsu-version';
import { KOMATSU_VERSION as commonModuleVersion } from 'app/vendors/k-common-module/komatsu-version';
import { ApiService } from 'app/services/api/api.service';
import { AuthenticationService } from 'app/services/shared/authentication.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { ComponentRefService } from 'app/services/shared/component-ref.service';
import { EntranceService } from 'app/services/shared/entrance.service';

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
    public appCode = (window as any).settings.azureAdAuthenticationInfo.clientId;

    constructor(
        public header: CommonHeaderService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private entranceService: EntranceService,
        private apiService: ApiService,
        private componentRefService: ComponentRefService,
        private authService: AuthenticationService
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

        this.outputAppVersion();

        this.router.events.subscribe((event: any) => {
            if (
                event instanceof NavigationStart &&
                !event.url.includes('/entrance')
            ) {
                localStorage.setItem(
                    environment.settings.appPrefix + '-entrance-next',
                    this.entranceService.buildNextUrl(event.url)
                );
                this.activatedRoute.queryParams.subscribe((params: Params) => {
                    if (params.group_id) {
                        localStorage.setItem(`group_id.${this.appCode}`, params.group_id);
                    }
                });
            }

            // 認証後、groupId がない場合強制的にエントランス画面へ
            if (event instanceof NavigationEnd && !event.url.includes('/entrance')) {
                if (
                    !environment.settings.skipAuthentication &&
                    !localStorage.getItem(`group_id.${this.appCode}`)
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
     * アプリのバージョンのログを表示する。
     */
    private outputAppVersion(): void {
        this.outputVersionLog((window as any).appVersion);
        this.outputVersionLog((window as any).appVendorVersion);
        this.outputVersionLog(commonModuleVersion);
        this.outputVersionLog(authModuleVersion);
    }

    /**
     * アプリのバージョンのログをコンソール上に表示する。
     */
    private outputVersionLog(version: string): void {
        if (version) {
            console.log(version);
        }
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