import * as _ from 'lodash';
import { OnInit } from '@angular/core';
import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { CustomerParams } from '../../../../types/flm/customer';

import { ScreenCode } from '../../../../constants/flm/screen-codes/customer-management';

import { CustomerFormComponent } from '../shared/form/customer-form.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { CustomerService } from '../../../../services/flm/customer/customer.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

@Component({
  selector: 'app-customer-new',
  templateUrl: '../shared/form/customer-form.component.html',
  styleUrls: ['../shared/form/customer-form.component.scss'],
  providers: [CustomerService],
})
export class CustomerNewComponent extends CustomerFormComponent
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
    customerService: CustomerService,
    api: ApiService,
    ref: ChangeDetectorRef,
    userSettingService: UserSettingService
  ) {
    super(nav, title, header, router, alert, modal, customerService, api, ref, userSettingService);
  }

  protected async _fetchDataForInitialize() {
    this.screenCode = ScreenCode.regist;
    const res = await this.customerService.fetchInitNew();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this.onLoad();
    this._afterInitialize();

    await this.timeout();

    if (!this.exists('customer.support_distributor_id', true)) {
      this._isBusinessTypeUnregistered();
    }
  }

  /**
   * 登録処理
   * @param params 顧客登録リクエストパラメータ
   */
  protected _register(params: CustomerParams) {
    return this.customerService.createCustomer(params);
  }
}
