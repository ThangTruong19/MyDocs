import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { UserService } from '../../../../services/opa/user/user.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserParams } from '../../../../types/opa/user';
import { KbaAbstractRegisterComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-register-component';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { UserFormComponent } from '../shared/form/user-form.component';
import * as _ from 'lodash';
import { Title } from '@angular/platform-browser';

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

  protected _fetchDataForInitialize() {
    return new Promise(resolve => {
      this.userService.fetchInitNew().then(res => {
        this.initialize(res);
        this.labels = res.label;
        this.resource = res.resource;
        this._setTitle();
        this._buildFormControls();
        this.loading = false;
        resolve();
      });
    });
  }

  /**
   * 運用ユーザ登録処理
   *
   * @param userId ユーザシーケンスID
   * @param params 運用ユーザ情報
   * @param path 登録後遷移先のパス
   */
  protected async _register(userId: string, params: UserParams, path: string) {
    this._showLoadingSpinner();

    await this.userService.createUser(userId, params);
    await this.router.navigate([path]);
    this._reset();

    this._hideLoadingSpinner();
    this.alertService.show(this.labels.finish_message);
  }

  /**
   * フォームに入力された内容をリセットする
   */
  protected _reset() {
    this.alertService.close();
    this.selectedUser = {};
    this.params.group.belonging_group_id = '';
    this.params.attribute_create_place = '';
    this.groupSelectComponent.refresh();
    this.roleSelectComponent.reset();
    this.authoritySelectComponent.reset();
    this.isSearchedUser = false;
    this.userForm.reset();
  }
}
