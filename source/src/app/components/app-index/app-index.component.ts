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

                if (environment.settings.skipAuthentication
                    && !environment.settings.useEntranceForDevelop) {
                    localStorage.setItem(`group_id.${this.appCode}`, '2'); // TODO:
                }

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
     * アプリのバージョンをコンソール上に表示する。
     */
    private outputAppVersion(): void {
        console.log((window as any).appVersion);
        console.log(commonModuleVersion);
        console.log(authModuleVersion);
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