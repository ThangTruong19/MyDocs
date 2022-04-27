import { Component } from '@angular/core';
import {
  Router,
  NavigationStart,
  ActivatedRoute,
  NavigationEnd,
} from '@angular/router';

import { EntranceService } from '../../../services/shared/entrance.service';
import { environment } from '../../../../environments/environment';
import { ComponentRefService } from '../../../services/shared/component-ref.service';
import { ApiService } from '../../../services/api/api.service';
import { KOMATSU_VERSION as authModuleVersion } from '../../../vendor/k-common-module/ngk-azure-ad-authentication/src/komatsu-version';
import { KOMATSU_VERSION as commonModuleVersion } from '../../../vendor/k-common-module/komatsu-version';
import { AuthenticationService } from '../../../services/shared/authentication.service';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isLoading: boolean;
  subscription;
  appCode = (window as any).settings.azureAdAuthenticationInfo.clientId;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private entranceService: EntranceService,
    private apiService: ApiService,
    private componentRefService: ComponentRefService,
    private authService: AuthenticationService
  ) {
    this.isLoading = true;
    console.log((window as any).appVersion);
    console.log(commonModuleVersion);
    console.log(authModuleVersion);

    if (!localStorage.getItem(`referrer_url.${this.appCode}`)) {
      localStorage.setItem(`referrer_url.${this.appCode}`, document.referrer);
    }
    this.router.events.subscribe(event => {
      if (
        event instanceof NavigationStart &&
        !event.url.includes('/entrance')
      ) {
        localStorage.setItem(
          environment.settings.appPrefix + '-entrance-next',
          this.entranceService.buildNextUrl(event.url)
        );
        this.activatedRoute.queryParams.subscribe(params => {
          if (params.group_id) {
            localStorage.setItem(`group_id.${this.appCode}`, params.group_id);
          }
        });
      }

      // 認証後、groupId がない場合強制的にエントランス画面へ
      if (event instanceof NavigationEnd && !event.url.includes('/entrance')) {
        if (!localStorage.getItem(`group_id.${this.appCode}`)) {
          this.authService.authentication().then(() => {
            this.entranceService.transitionEntrance();
          });
        }
      }
    });
  }

  /**
   * RouterOutlet にコンポーネントが読み込まれた時の処理
   * @param component コンポーネント
   */
  componentAdded(component) {
    this.componentRefService.componentRef = component;
    this.apiService.initialResouce = {};
    this.subscription = component.onLoadEvent.subscribe(
      () => (this.isLoading = false)
    );
  }

  /**
   * RouterOutlet からコンポーネントが外された時の処理
   * @param $event イベント
   */
  componentRemoved($event) {
    if (this.subscription.hasOwnProperty('unsubscribe')) {
      this.subscription.unsubscribe();
    }
    this.isLoading = true;
  }
}
