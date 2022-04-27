import * as _ from 'lodash';
import { OnInit } from '@angular/core';
import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { SubgroupParams } from '../../../../types/flm/subgroup';

import { SubgroupFormComponent } from '../shared/form/subgroup-form.component';
import { KbaAbstractRegisterComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-register-component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { SubgroupService } from '../../../../services/flm/subgroup/subgroup.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

@Component({
  selector: 'app-subgroup-new',
  templateUrl: '../shared/form/subgroup-form.component.html',
  styleUrls: ['../shared/form/subgroup-form.component.scss'],
  providers: [SubgroupService],
})
export class SubgroupNewComponent extends SubgroupFormComponent
  implements OnInit {
  isUpdate = false;

  timeDifference = {
    time_difference: '+00',
    time_difference_minute: '00',
  };

  constructor(
    nav: KbaNavigationService,
    title: Title,
    router: Router,
    header: CommonHeaderService,
    alert: KbaAlertService,
    modal: KbaModalService,
    subgroupService: SubgroupService,
    api: ApiService,
    ref: ChangeDetectorRef,
    userSettingService: UserSettingService
  ) {
    super(nav, title, header, router, alert, modal, subgroupService, api, ref, userSettingService);
  }

  protected async _fetchDataForInitialize() {
    const res = await this.subgroupService.fetchInitNew();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this.onLoad();
    this._afterInitialize();
  }

  /**
   * 登録処理
   * @param params 顧客登録リクエストパラメータ
   */
  protected _register(params: SubgroupParams) {
    return this.subgroupService.createSubgroup(params);
  }
}
