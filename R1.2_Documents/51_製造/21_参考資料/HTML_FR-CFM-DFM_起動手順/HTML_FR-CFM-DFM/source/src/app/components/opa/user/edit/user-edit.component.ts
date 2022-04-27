import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { UserService } from '../../../../services/opa/user/user.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserParams } from '../../../../types/opa/user';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { UserFormComponent } from '../shared/form/user-form.component';
import * as _ from 'lodash';
import { Title } from '@angular/platform-browser';
import { ScreenCode } from '../../../../constants/opa/screen-codes/user-management';

@Component({
  selector: 'app-user-edit',
  templateUrl: '../shared/form/user-form.component.html',
  styleUrls: ['../shared/form/user-form.component.scss'],
  providers: [UserService],
})
export class UserEditComponent extends UserFormComponent {
  isUpdate = true;
  target: any;
  restoreFlg = false;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    router: Router,
    header: CommonHeaderService,
    alert: KbaAlertService,
    modal: KbaModalService,
    userService: UserService,
    api: ApiService,
    private activatedRoute: ActivatedRoute
  ) {
    super(nav, title, header, router, alert, modal, userService, api);
  }

  protected async _fetchDataForInitialize() {
    const searchParams = {
      belonging_group_id: '',
    };
    this.activatedRoute.params.subscribe(p => (this.userId = p.id));
    this.activatedRoute.queryParams.subscribe(
      p => (searchParams.belonging_group_id = p.user_group_id)
    );
    const res = await this.userService.fetchEditInitData(
      this.userId,
      searchParams
    );
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this.target = res.target.result_data.user;
    this._restoreData();
    this._buildFormControls();
    this.loading = false;
    await this.onGroupIdChange(_.get(this.params, 'group.belonging_group_id'));
  }

  /**
   * ロールID変更時の処理
   * @param value 選択値
   */
  protected _onGrantedRoleIdChange(value) {
    const param = {
      granted_role_id: value,
    };
    this.userService
      .fetchGrantedAuthorityIdsByGrantedRoleId(ScreenCode.edit, param)
      .then((res: any) => {
        this.authoritySelectComponent.reset();
        this.resource.user.group.granted_authority_ids = _.cloneDeep(
          res.user.group.granted_authority_ids
        );

        if (this.restoreFlg) {
          this.selectedAuthorities = _.map(
            _.get(this.target, 'groups.0.granted_authorities'),
            'id'
          );
          this.restoreFlg = false;
        } else {
          this._setDefaultAuthority(res);
        }
      });
  }

  /**
   * 運用ユーザ更新処理
   *
   * @param userId ユーザシーケンスID
   * @param params 運用ユーザ情報
   * @param path 更新後遷移先のパス
   */
  protected async _register(userId: string, params: UserParams, path: string) {
    // 表示用のパラメータを削除
    params.group.granted_role_name = null;

    this._showLoadingSpinner();

    await this.userService.updateUser(userId, params);
    await this.router.navigate([path]);
    this._reset();

    this._hideLoadingSpinner();
    this.alertService.show(this.labels.finish_message);
  }

  /**
   * 更新用のパラメタを反映する
   */
  protected _reflectRegistParams() {
    super._reflectRegistParams();
    _.set(
      this.params,
      'update_datetime',
      _.get(this.target, 'identification.update_datetime')
    );
  }

  /**
   * フォームに入力された内容をリセットする
   */
  protected _reset() {
    this.alertService.close();
    this.defaultAuthorities = [];
    this._restoreData();
    this.groupSelectComponent.onChange.emit(
      this.params.group.belonging_group_id
    );
  }

  /**
   * 一覧取得より取得したデータで画面の初期状態を復元する
   */
  private _restoreData() {
    this.restoreFlg = true;
    _.set(
      this.params,
      'group.belonging_group_id',
      _.get(this.target, 'groups.0.belonging_group.identification.id')
    );
    _.set(
      this.params,
      'group.label',
      _.get(this.target, 'groups.0.belonging_group.identification.label')
    );
    _.set(
      this.params,
      'group.granted_role_id',
      _.get(this.target, 'groups.0.granted_role.id')
    );
    _.set(
      this.params,
      'group.granted_role_name',
      _.get(this.target, 'groups.0.granted_role.name')
    );
    _.set(
      this.params,
      'group.represent_administrator_kind',
      _.get(this.target, 'groups.0.represent_administrator_kind')
    );
    _.set(
      this.userSearchParams,
      'user_account',
      _.get(this.target, 'identification.account')
    );

    if (this.exists('user.attribute_create_place')) {
      _.set(
        this.params,
        'attribute_create_place',
        _.get(this.target, 'attribute.create_place') || ''
      );
    }

    this.selectedUser = {
      identification: {
        account: _.get(this.target, 'identification.account'),
        email: _.get(this.target, 'identification.email'),
        label: _.get(this.target, 'identification.label'),
        label_english: _.get(this.target, 'identification.label_english'),
      },
      attribute: {
        phone_no: _.get(this.target, 'attribute.phone_no'),
      },
    };
  }
}
