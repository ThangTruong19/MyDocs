import { Component, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { pick } from 'lodash';

import { ScreenCode } from '../../../../constants/opa/screen-codes/group-management';

import { GroupFormComponent } from '../shared/form/group-form.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { GroupService } from '../../../../services/opa/group/group.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { KbaMapWrapperService } from '../../../../services/shared/kba-map-wrapper.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

@Component({
  selector: 'app-group-new',
  templateUrl: '../shared/form/group-form.component.html',
  styleUrls: ['../shared/form/group-form.component.scss'],
})
export class GroupNewComponent extends GroupFormComponent {
  screenCode = ScreenCode.regist;
  isUpdate = false;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    groupService: GroupService,
    ref: ChangeDetectorRef,
    modal: KbaModalService,
    router: Router,
    alert: KbaAlertService,
    map: KbaMapWrapperService,
    userSetting: UserSettingService,
    api: ApiService
  ) {
    super(
      nav,
      title,
      header,
      groupService,
      ref,
      modal,
      router,
      alert,
      userSetting,
      map,
      api
    );
  }

  /**
   * 登録ボタンの有効状態を取得
   */
  isSubmitButtonEnabled() {
    return this.isNextButtonEnabled() && this.currentUser != null;
  }

  protected async _fetchDataForInitialize() {
    const res: any = await this.groupService.fetchNewInitData();
    this.initialize(res);
    this.labels = res.label;
    // グループ種別及び共通のリソースのみ拾う
    this.resource = pick(res.resource, [
      'group.identification.kind_id',
      'X-DateFormat',
      'X-DistanceUnit',
      'X-Lang',
      'block_id',
    ]);
    this.mapParams = this.userSettingService.getMapParams();
    this._setTitle();
    this.onLoad();
    this._afterInitialize();
  }

  protected _register(params) {
    return this.groupService.createGroup(params);
  }
}
