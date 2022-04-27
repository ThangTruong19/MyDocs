import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { ScreenCode } from '../../../constants/flm/screen-codes/common';

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
  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    private header: CommonHeaderService,
    private api: ApiService
  ) {
    super(navigationService, title);

    this.api.currentScreenCode = ScreenCode.managementDashboard;
    this.api
      .callApisForInitialize(ScreenCode.managementDashboard, 'homeInit')
      .then(async res => {
        this.initialize(res);
        this.labels = res.label;
        this._setTitle();
        await this.header.setHeader(this.labels, res.resource, this.functions);
        this.onLoad();
      });
  }

  refresh() {
    this.navigationService.refresh();
  }
}
