import { Component, ChangeDetectorRef } from '@angular/core';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { GroupPublishBaseComponent } from '../shared/publish-base/group-publish-base.component';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { GroupService } from '../../../../services/opa/group/group.service';
import { RequestHeaderParams } from '../../../../types/request';
import { ApiService } from '../../../../services/api/api.service';
import { FunctionCode } from '../../../../constants/opa/function-codes/group-management';

@Component({
  selector: 'app-group-publish',
  templateUrl: '../shared/publish-base/group-publish-base.component.html',
  styleUrls: ['../shared/publish-base/group-publish-base.component.scss'],
})
export class GroupPublishComponent extends GroupPublishBaseComponent {
  scopeCheckIdKey = 'identification.id';
  downloadFunctionCode = FunctionCode.publishSettingGroupDownloadFunction;

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
   * @param requestHeaderParams ヘッダ
   */
  fetchScope = (
    id: string,
    params,
    requestHeaderParams: RequestHeaderParams
  ) => {
    return this.groupService.fetchScopeGroups(id, params, requestHeaderParams);
  };

  protected async _fetchDataForInitialize() {
    const res = await this.groupService.fetchPublishInitData();
    this._initialize(res);
  }

  /**
   * 登録APIを呼び出す
   */
  protected async _callSubmitApi(id, params) {
    return this.groupService.updateScopeGroups(id, params) as any;
  }

  /**
   * 更新APIに投げるパラメータを作成
   */
  protected _createSubmitParams() {
    return {
      group: {
        additional_groups: this.confirmAdditionalGroups.map(item => ({
          identification: {
            id: item.identification.id,
            update_datetime: item.identification.update_datetime,
          },
        })),
        removal_groups: this.confirmRemovalGroups.map(item => ({
          identification: {
            id: item.identification.id,
            update_datetime: item.identification.update_datetime,
          },
        })),
      },
    };
  }
}
