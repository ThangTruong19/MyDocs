import * as _ from 'lodash';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { UserParams } from '../../../../types/flm/user';

import { UserFormComponent } from '../shared/form/user-form.component';
import { KbaAbstractRegisterComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-register-component';

import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { UserService } from '../../../../services/flm/user/user.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';

@Component({
  selector: 'app-user-new',
  templateUrl: '../shared/form/user-form.component.html',
  styleUrls: ['../shared/form/user-form.component.scss'],
  providers: [UserService],
})
export class UserNewComponent extends UserFormComponent {
  isUpdate = false;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    router: Router,
    header: CommonHeaderService,
    alert: KbaAlertService,
    modal: KbaModalService,
    userService: UserService,
    api: ApiService
  ) {
    super(nav, title, header, router, alert, modal, userService, api);
  }

  protected async _fetchDataForInitialize() {
    const res = await this.userService.fetchInitNew();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    const userNameEnglish =
      (res.fields || []).find((field) => field.path === 'users.identification.label_english');
    this.userNameEnglishDisplayable = !!userNameEnglish;
    this.userNameEnglishLabel = userNameEnglish && userNameEnglish.name;
    this._setTitle();
    this._buildFormControls();
    this.loading = false;
    // 所属リソース取得
    if (
      this.exists('user.group.id') &&
      !this.exists('user.group.belonging_group_id', true)
    ) {
      await this.onGroupIdChange(
        _.get(this.resource, 'user.group.id.values[0].value')
      );
    }
    const firstOption = this.resource.user.group.belonging_group_id.values[0];
    this.params.group.belonging_group_id =
      this.params.group.belonging_group_id ||
      (firstOption ? firstOption.value : '');
    // 権限リソース取得
    await this.onBelongingGroupIdChange(
      _.get(this.resource, 'user.group.belonging_group_id.values[0].value')
    );
  }

  /**
   * ユーザ登録処理
   *
   * @param userId ユーザシーケンスID
   * @param params ユーザ情報
   * @param path 登録後遷移先のパス
   */
  protected _register(userId: string, params: UserParams, path: string): void {
    this.userService.createUser(userId, params).then(
      res => {
        this.router.navigateByUrl(path).then(e => {
          this._reset();
          this.alertService.show(this.labels.finish_message);
        });
      },
      error => {}
    );
  }

  /**
   * フォームに入力された内容をリセットする
   */
  protected _reset(): void {
    this.selectedUser = {};
    this.isSearchedUser = false;
    this.params.group.id = '';
    this.params.group.belonging_group_id = '';
    this.params.user.attribute_create_place = '';
    if (this.groupSelectComponent) {
      this.groupSelectComponent.resetAndEmit();
    }
    if (this.belongingGroupSelectComponent) {
      this.belongingGroupSelectComponent.reset();
    }
    this.roleSelectComponent.reset();
    this.authoritySelectComponent.reset();
    this.userForm.reset();
  }
}
