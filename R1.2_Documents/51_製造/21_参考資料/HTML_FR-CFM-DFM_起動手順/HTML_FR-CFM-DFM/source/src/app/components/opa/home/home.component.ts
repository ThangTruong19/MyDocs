import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { ScreenCode } from '../../../constants/opa/screen-codes/common';
import { Apis } from '../../../constants/apis';

import { KbaAbstractBaseComponent } from '../../shared/kba-abstract-component/kba-abstract-base-compoenent';

import { CommonHeaderService } from '../../../services/shared/common-header.service';
import { KbaNavigationService } from '../../../services/shared/kba-navigation.service';
import { ApiService } from '../../../services/api/api.service';

@Component({
  moduleId: module.id,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent extends KbaAbstractBaseComponent {
  notifications = [];
  private containerMaxWidth = 1280;
  private noticeWidth = 300;
  private navWidth = 255;
  private margin = 20;

  get wrapperWidth() {
    return {
      'max-width': `${Math.floor(
        (Math.min(this.containerMaxWidth, window.innerWidth) -
          (this.margin + this.noticeWidth)) /
          this.navWidth
      ) * this.navWidth}px`,
    };
  }

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    private header: CommonHeaderService,
    private api: ApiService
  ) {
    super(navigationService, title);

    this.api.currentScreenCode = ScreenCode.managementDashboard;
    this.api
      .callApisForInitialize(ScreenCode.managementDashboard, 'homeInit', {
        news: () => this.api.get(Apis.getApplicationsNews),
      })
      .then(async res => {
        this.initialize(res);
        this.labels = res.label;
        if (res.news) {
          this.notifications = res.news.result_data.notifications || [];
        }
        this._setTitle();
        await this.header.setHeader(this.labels, res.resource, this.functions);
        this.onLoad();
      });
  }

  refresh() {
    this.navigationService.refresh();
  }
}
