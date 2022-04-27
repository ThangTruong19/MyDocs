import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { Fields, TableHeader } from '../../../../types/common';
import { RequestHeaderParams } from '../../../../types/request';

import { FunctionCode } from '../../../../constants/opa/function-codes/group-management';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { GroupPublishBaseComponent } from '../shared/publish-base/group-publish-base.component';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { GroupService } from '../../../../services/opa/group/group.service';
import { ApiService } from '../../../../services/api/api.service';

@Component({
  selector: 'app-group-customer-publish',
  templateUrl: '../shared/publish-base/group-publish-base.component.html',
  styleUrls: ['../shared/publish-base/group-publish-base.component.scss'],
})
export class GroupCustomerPublishComponent extends GroupPublishBaseComponent {
  scopeCheckIdKey = 'customer.identification.id';
  downloadFunctionCode = FunctionCode.publishSettingCustomerDownloadFunction;
  registFields: { [kindId: string]: Fields } = {};
  selectFields: { [kindId: string]: Fields } = {};
  confirmFields: { [kindId: string]: Fields } = {};

  get editContentTitle() {
    return `${this.labels.scope_title}（${this.currentItem &&
      this.currentItem.identification.kind_name}）`;
  }

  constructor(
    nav: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    modal: KbaModalService,
    protected alertService: KbaAlertService,
    alert: KbaAlertService,
    group: GroupService,
    api: ApiService
  ) {
    super(nav, title, router, ref, header, modal, alert, group, api);
  }

  /**
   * 公開グループ一覧を取得
   * @param id ID
   * @param params パラメータ
   */
  fetchScope = (
    id: string,
    params,
    requestHeaderParams: RequestHeaderParams
  ) => {
    return this.groupService.fetchScopeCustomers(
      id,
      params,
      requestHeaderParams
    );
  };

  protected async _fetchDataForInitialize() {
    const res = await this.groupService.fetchCustomerPublishInitData();
    this._initialize(res);
    this.modalResource.group_label = null;
  }

  /**
   * 登録APIを呼び出す
   */
  protected async _callSubmitApi(id, params) {
    return this.groupService.updateScopeCustomers(id, params) as any;
  }

  /**
   * APIの戻り値によってテーブルのヘッダの表示制御を行う
   * @param item 項目
   */
  protected async _updateScopeThList(kindId: string) {
    if (
      this.registFields[kindId] &&
      this.selectFields[kindId] &&
      this.confirmFields[kindId]
    ) {
      this.registModalValues = this._getModalValues(this.registFields[kindId]);
      this.selectModalValues = this._getModalValues(this.selectFields[kindId]);
      this.confirmModalValues = this._getModalValues(
        this.confirmFields[kindId]
      );
    } else {
      const searchParams = `group_kind,${kindId}`;

      const [
        registFields,
        selectFields,
        confirmFields,
      ] = await this.groupService.fetchPublishCustomerFieldsWithParams(
        searchParams
      );

      this.registFields[kindId] = registFields;
      this.selectFields[kindId] = selectFields;
      this.confirmFields[kindId] = confirmFields;
      this.registModalValues = this._getModalValues(registFields);
      this.selectModalValues = this._getModalValues(selectFields);
      this.confirmModalValues = this._getModalValues(confirmFields);
    }

    if (this.targetItemLabel == null) {
      const descItem = this.registModalValues.listDesc.find(
        desc => desc.name === 'group.identification.label'
      );
      this.targetItemLabel = descItem ? descItem.label : '';
    }

    [
      this.registModalValues.listDesc,
      this.selectModalValues.listDesc,
      this.confirmModalValues.listDesc,
    ].forEach(desc => (desc = this._renameThLabels(desc)));
  }

  /**
   * 更新APIに投げるパラメータを作成
   */
  protected _createSubmitParams() {
    return {
      group: {
        additional_groups: this.additionalGroups.map(item => ({
          identification: {
            id: item.customer.identification.id,
            update_datetime: item.customer.identification.update_datetime,
          },
        })),
        removal_groups: this.removalGroups.map(item => ({
          identification: {
            id: item.customer.identification.id,
            update_datetime: item.customer.identification.update_datetime,
          },
        })),
      },
    };
  }

  /**
   * テーブルヘッダのラベルを書き換える
   * @param thList テーブルヘッダ
   */
  private _renameThLabels(thList: TableHeader[]) {
    [
      'group.scope_groups.region',
      'group.scope_groups.block',
      'group.scope_groups.distributor',
      'group.scope_groups.customer',
    ].forEach(path => {
      const target = thList.find(th => th.name === path);
      if (target != null) {
        target.dataKey += '.identification.label';
      }
    });

    return thList;
  }
}
