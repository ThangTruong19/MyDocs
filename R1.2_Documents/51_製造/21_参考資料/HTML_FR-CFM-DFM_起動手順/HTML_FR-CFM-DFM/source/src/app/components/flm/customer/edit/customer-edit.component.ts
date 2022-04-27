import * as _ from 'lodash';
import { OnInit } from '@angular/core';
import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import {
  CustomerParams,
  AuthorityParams,
} from '../../../../types/flm/customer';

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
  selector: 'app-customer-edit',
  templateUrl: '../shared/form/customer-form.component.html',
  styleUrls: ['../shared/form/customer-form.component.scss'],
  providers: [CustomerService],
})
export class CustomerEditComponent extends CustomerFormComponent
  implements OnInit {
  isUpdate = true;
  customerId: string;
  supportDBName: string;

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
    userSettingService: UserSettingService,
    private activatedRoute: ActivatedRoute
  ) {
    super(nav, title, header, router, alert, modal, customerService, api, ref, userSettingService);
  }

  protected async _fetchDataForInitialize() {
    this.screenCode = ScreenCode.edit;
    this.activatedRoute.params.subscribe(p => (this.customerId = p.id));
    const res = await this.customerService.fetchEditInitData(this.customerId);
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._initializeCustomerData(res.item.result_data.customer);
    this._afterInitialize();
    this._setTitle();
    this.onLoad();
  }

  /**
   * 変更処理
   * @param params 顧客リクエストパラメータ
   */
  protected _register(params: CustomerParams) {
    return this.customerService.updateCustomer(this.customerId, params);
  }

  /**
   * モーダルに表示する値を整形する
   * @param paths 対象項目のパス
   * @override
   */
  protected _createModalVal(paths) {
    const val = super._createModalVal(paths);
    val['customer.support_distributor_id'] = this.supportDBName;
    return val;
  }

  /**
   * 詳細取得にて得た顧客データから変更画面の初期パラメータを作成する
   * @param data 顧客データ
   */
  private _initializeCustomerData(data) {
    this.params.customer.identification = _.pick(data.identification, [
      'label',
      'label_english',
      'organization_code',
      'update_datetime',
    ]);
    this.params.customer.attribute = _.pick(data.attribute, [
      'business_type_id',
      'nation_code',
      'time_difference',
      'phone_no',
      'email',
      'address',
      'report_display_label',
    ]);
    this.params.customer.administrator_role = {
      id: data.administrator_role.id,
      authorities: this._formatAuthorities(data.administrator_role.authorities),
    };
    this.params.customer.general_role = {
      id: data.general_role.id,
      authorities: this._formatAuthorities(data.general_role.authorities),
    };
    if (this.resource.customer.support_distributor_id) {
      this.params.customer.support_distributor_id =
        data.support_distributor.identification.id;
      this.supportDBName = data.support_distributor.identification.label;
      this.handleSupportDistributorChange(
        data.support_distributor.identification.id
      );
    }
  }

  /**
   * 詳細取得処理にて得た権限のデータを変更画面のパラメータに沿って整形する
   * @param authorities 権限データ
   */
  private _formatAuthorities(authorities): AuthorityParams[] {
    return authorities.map(authority => ({
      id: authority.id,
      default_kind: authority.default_kind,
    }));
  }
}
