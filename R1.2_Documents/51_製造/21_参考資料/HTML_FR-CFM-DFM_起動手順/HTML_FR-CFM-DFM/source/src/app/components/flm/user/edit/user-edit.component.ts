import * as _ from 'lodash';
import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { UserParams } from '../../../../types/flm/user';
import { ScreenCode } from '../../../../constants/flm/screen-codes/user-management';

import { UserFormComponent } from '../shared/form/user-form.component';
import { KbaAbstractRegisterComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-register-component';

import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { UserService } from '../../../../services/flm/user/user.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';

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
      p => (searchParams.belonging_group_id = p.belonging_group_id)
    );
    const res = await this.userService.fetchEditInitData(
      this.userId,
      searchParams
    );
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    const userNameEnglish =
      (res.fields || []).find((field) => field.path === 'users.identification.label_english');
    this.userNameEnglishDisplayable = !!userNameEnglish;
    this.userNameEnglishLabel = userNameEnglish && userNameEnglish.name;
    this._setTitle();
    this.target = res.target.result_data.user;
    this.isEmptyConfigurationGroups = _.isEmpty(
      _.get(this.target, 'groups[0].configuration_groups', [])
    );
    this._restoreData();
    this._buildFormControls();
    this.loading = false;
    // 所属リソース取得
    if (
      this.exists('user.group.id') &&
      !this.exists('user.group.belonging_group_id', true)
    ) {
      // ユーザ詳細の所属がログイングループと同じ場合、所属の取得はログイングループで行う
      const loginGroupId = this.api.getGroupId();
      if (
        _.get(this.target, 'groups.0.belonging_group.identification.id') ===
        loginGroupId
      ) {
        await this.onGroupIdChange(loginGroupId);
      } else {
        await this.onGroupIdChange(_.get(this.params, 'group.id'));
      }
    }
    // 権限リソース取得
    await this.onBelongingGroupIdChange(
      _.get(this.params, 'group.belonging_group_id')
    );
  }

  /**
   * ロールID変更時の処理
   * @param value 選択値
   */
  protected _onGrantedRoleIdChange(value: string): void {
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
   * ユーザ更新処理
   *
   * @param userId ユーザシーケンスID
   * @param params ユーザ情報
   * @param path 更新後遷移先のパス
   */
  protected _register(userId: string, params: UserParams, path: string): void {
    // 表示用のパラメータを削除
    params.group.granted_role_name = null;

    this.userService.updateUser(userId, params).then(res => {
      this.router.navigate([path]).then(e => {
        this._reset();
        this.alertService.show(this.labels.finish_message);
      });
    });
  }

  /**
   * 更新用のパラメタを反映する
   */
  protected _reflectRegistParams(): void {
    super._reflectRegistParams();
    _.set(
      this.params,
      'user.update_datetime',
      _.get(this.target, 'identification.update_datetime')
    );
  }

  /**
   * フォームに入力された内容をリセットする
   */
  protected _reset(): void {
    this._restoreData();
    if (this.belongingGroupSelectComponent) {
      this.belongingGroupSelectComponent.onChange.emit(
        this.params.group.belonging_group_id
      );
    }
  }

  /**
   * 確認モーダル用の項目を作成する
   * @return 加工後の表示用項目
   */
  protected _createValItem(): UserParams {
    const val = super._createValItem();

    val['group.id'] = _.get(
      this.target,
      'groups.0.configuration_groups.0.label'
    );
    val['group.belonging_group_id'] = _.get(
      this.target,
      'groups.0.belonging_group.identification.label'
    );

    return val;
  }

  /**
   * 詳細取得より取得したデータで画面の初期状態を復元する
   */
  private _restoreData(): void {
    this.restoreFlg = true;
    _.set(
      this.params,
      'group.id',
      _.get(this.target, 'groups.0.configuration_groups.0.id')
    );
    _.set(
      this.params,
      'group.label',
      _.get(this.target, 'groups.0.configuration_groups.0.label')
    );
    _.set(
      this.params,
      'group.belonging_group_id',
      _.get(this.target, 'groups.0.belonging_group.identification.id')
    );
    _.set(
      this.params,
      'group.belonging_group_label',
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
        'user.attribute_create_place',
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
        address: _.get(this.target, 'attribute.create_place'),
      },
    };
  }
}
