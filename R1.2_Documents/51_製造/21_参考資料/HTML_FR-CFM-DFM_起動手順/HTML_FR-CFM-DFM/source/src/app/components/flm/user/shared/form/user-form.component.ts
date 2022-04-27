import * as _ from 'lodash';
import { ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { SearchModalValues } from '../../../../../types/common';
import { UserParams } from '../../../../../types/flm/user';

import { ScreenCode } from '../../../../../constants/flm/screen-codes/user-management';

import { KbaAbstractRegisterComponent } from '../../../../../components/shared/kba-abstract-component/kba-abstract-register-component';
import { KbaAuthoritySelectComponent } from '../../../../shared/kba-authority-select/kba-authority-select.component';
import { KbaSelectedComponent } from '../../../../shared/kba-selected/kba-selected.component';
import { KbaFormTableSelectComponent } from '../../../../shared/kba-form-table-select/kba-form-table-select.component';
import { KbaUserSearchModalComponent } from '../../../../shared/kba-user-search-modal/kba-user-search-modal.component';
import { KbaBelongingFormTableSelectComponent } from '../../../../shared/kba-belonging-form-table-select/kba-belonging-form-table-select.component';

import { CommonHeaderService } from '../../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../../services/shared/kba-modal.service';
import { UserService } from '../../../../../services/flm/user/user.service';
import { KbaAlertService } from '../../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../../services/api/api.service';
import { KbaNavigationService } from '../../../../../services/shared/kba-navigation.service';
import { WildCardCharacters } from '../../../../../constants/wild-card-characters';

export abstract class UserFormComponent extends KbaAbstractRegisterComponent {
  @ViewChild(KbaAuthoritySelectComponent, { static: false })
  authoritySelectComponent: KbaAuthoritySelectComponent;
  @ViewChild(KbaSelectedComponent, { static: false })
  roleSelectComponent: KbaSelectedComponent;
  @ViewChild('groupId', { static: false })
  groupSelectComponent: KbaFormTableSelectComponent;
  @ViewChild('belongingGroupId', { static: false })
  belongingGroupSelectComponent: KbaBelongingFormTableSelectComponent;

  loading = true;
  enabledUserSearch = false;

  params: UserParams = {
    group: {
      id: '',
      belonging_group_id: '',
      granted_role_id: '',
      granted_authority_ids: [],
    },
    user: {
      attribute_create_place: '',
    },
  };

  userSearchParams = {
    user_account: '',
  };

  descItem: any[] = [];
  valItem: any;

  userForm: FormGroup = new FormGroup({});
  defaultAuthorities: any[] = [];
  selectedAuthorities: any[] = [];
  selectedUser = {};
  userId = '';
  isSearchedUser = false;
  selectedBelongingName = '';
  selectedBelongingNameColor = '';
  userSearchModalValues: SearchModalValues = {};
  isEmptyConfigurationGroups = false;
  userNameEnglishDisplayable = false;
  userNameEnglishLabel = '';

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    protected router: Router,
    protected alertService: KbaAlertService,
    protected modalService: KbaModalService,
    protected userService: UserService,
    protected api: ApiService
  ) {
    super(nav, title, header);
  }

  /**
   * 権限選択モーダルの選択結果が有効かどうか
   * @return true: 有効 / false: 無効
   */
  get isModalAuthoritySelectOk() {
    if (_.isUndefined(this.authoritySelectComponent)) {
      return true;
    }

    return this.authoritySelectComponent.isAuthoritySelectOk();
  }

  /**
   * 検索ボタン押下コールバック
   */
  onClickSearch() {
    this.modalService.customOpen(
      KbaUserSearchModalComponent,
      {
        labels: this.userSearchModalValues.labels,
        resource: this.userSearchModalValues.resource,
        fields: this.userSearchModalValues.fields,
        updateModalValues: (modalValues: SearchModalValues) =>
          (this.userSearchModalValues = modalValues),
        ok: user => {
          this.selectedUser = user;
          this.userId = _.get(user, 'identification.id');
          _.set(
            this.userSearchParams,
            'user_account',
            _.get(user, 'identification.account')
          );
          this.alertService.close();
        },
      },
      {
        size: 'lg',
      }
    );
  }

  /**
   * 入力内容リセットコールバック
   *
   * 入力内容リセット確認モーダルを表示する。
   * 確認後、入力内容をリセットする。
   */
  onClickReset(): void {
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      ok: () => this._reset(),
    });
  }

  /**
   * 登録/変更ボタン押下コールバック
   */
  onClickSubmit(): void {
    const path = this.isUpdate ? '/users' : '/';
    this._registerModalOpen(path);
  }

  /**
   * 続けて登録ボタン押下コールバック
   */
  onClickContinue(): void {
    this.isSearchedUser = false;
    this._registerModalOpen('/users/new');
  }

  /**
   * ユーザ一覧(共通認証) 検索を行う
   */
  searchUserAcount(): void {
    this.alertService.close();
    const { user_account } = this.userSearchParams;

    if (_.isEmpty(user_account) || this.isSearchedUser) {
      return;
    }

    if (
      WildCardCharacters.filter(char => user_account.includes(char)).length > 0
    ) {
      this.selectedUser = null;
      this.isSearchedUser = true;
      this.alertService.show(this.labels.wild_card_error, true, 'danger');
      return;
    }

    const params = {
      user_account: this.userSearchParams.user_account,
    };
    this.api
      .fetchCommonAuthenticationUsers(params)
      .then((res: any) => {
        this.selectedUser = res.result_data.users[0];
        if (this.selectedUser) {
          this.userId = _.get(this.selectedUser, 'identification.id');
        } else {
          this.alertService.show(this.labels.user_not_found, true, 'danger');
        }
        this.isSearchedUser = true;
      })
      .catch(errorData => {
        this.selectedUser = null;
        this.isSearchedUser = true;
        this._setError(errorData, this.alertService);
      });
  }

  /**
   * ユーザID入力後 Enter 押下時コールバック
   */
  onEnterUserAccount(): void {
    this.searchUserAcount();
  }

  /**
   * ユーザID入力後フォーカスアウト時コールバック
   */
  onBlurUserAccount(): void {
    this.searchUserAcount();
  }

  /**
   * ユーザID変更時コールバック
   */
  onChangeUserAcount(): void {
    this.selectedUser = {};
    this.isSearchedUser = false;
  }

  /**
   * グループID変更時の処理
   * @param value 選択値
   */
  async onGroupIdChange(value) {
    let screenCode = '';
    let belonging_group_id = '';
    const param = {
      configuration_group_id: value,
    };

    if (this.isUpdate) {
      screenCode = ScreenCode.edit;
      belonging_group_id = this.params.group.belonging_group_id;
    } else {
      screenCode = ScreenCode.regist;
    }

    const res = await this.userService.fetchBelongingGroupIdByGroupId(
      screenCode,
      param
    );
    this.resource.user.group.belonging_group_id =
      res.user.group.belonging_group_id;
    if (this.belongingGroupSelectComponent) {
      this.belongingGroupSelectComponent.refresh();
    }
  }

  /**
   * 所属グループID変更時の処理
   * @param value 選択値
   */
  async onBelongingGroupIdChange(value) {
    let screenCode = '';
    let granted_role_id = '';
    const param = {
      belonging_group_id: value,
    };

    if (this.isUpdate) {
      screenCode = ScreenCode.edit;
      granted_role_id = this.params.group.granted_role_id;
    } else {
      screenCode = ScreenCode.regist;
    }

    const res = await this.userService.fetchGrantedRoleIdByBelongingGroupId(
      screenCode,
      param
    );
    this.resource.user.group.granted_role_id = res.user.group.granted_role_id;
    this.params.group.granted_role_id = granted_role_id;
    if (this.roleSelectComponent) {
      await this.roleSelectComponent.refresh();
    }
  }

  /**
   * 権限選択モーダルが閉じられた際のコールバック
   * @param authorities 選択済み情報
   */
  onCloseAuthoritySelectModal(authorities): void {
    this.defaultAuthorities = [];
    this.selectedAuthorities = authorities;
  }

  /**
   * 入力された内容を API に渡し登録を行う
   * @param userId ユーザシーケンスID
   * @param params パラメータ
   * @param path 遷移後のパス
   */
  protected abstract _register(
    userId: string,
    params: UserParams,
    path: string
  );

  /**
   * フォームに入力された内容をリセットする
   */
  protected abstract _reset();

  /**
   * 権限ID変更時の処理
   * @param value 選択値
   */
  protected _onGrantedRoleIdChange(value): void {
    const param = {
      granted_role_id: value,
    };
    this.userService
      .fetchGrantedAuthorityIdsByGrantedRoleId(ScreenCode.regist, param)
      .then((res: any) => {
        this.authoritySelectComponent.reset();
        this._setDefaultAuthority(res);
        this.resource.user.group.granted_authority_ids = _.cloneDeep(
          res.user.group.granted_authority_ids
        );
      });
  }

  /**
   * 権限選択モーダルの権限の選択肢を生成する
   */
  protected _authorities() {
    return _.get(this.resource, 'user.group.granted_authority_ids').values;
  }

  /**
   * デフォルト権限を選択済み状態にする
   * @param resource リソース
   */
  protected _setDefaultAuthority(resource): void {
    if (_.has(resource, 'user.group.granted_authority_checked_items')) {
      this.defaultAuthorities = _.map(
        resource.user.group.granted_authority_checked_items.values,
        v => v.value
      );
    }
  }

  /**
   * 登録用のパラメタを反映する
   */
  protected _reflectRegistParams(): void {
    _.set(
      this.params,
      'group.granted_authority_ids',
      this.authoritySelectComponent.getSelectedParam()
    );
  }

  /**
   * フォームの部品を angular の form に登録します。
   */
  protected _buildFormControls(): void {
    this.userForm = new FormGroup({});

    // ユーザID
    // 登録の場合
    if (!this.isUpdate) {
      this.userForm.addControl(
        'user_account',
        new FormControl('', Validators.required)
      );
    } else {
      this.userForm.addControl('user_account', new FormControl());
    }
  }

  /**
   * 登録確認モーダル用の項目を作成する
   * @return 加工後の表示用項目
   */
  protected _createValItem(): UserParams {
    const val = _.cloneDeep(this.params);

    val['group.id'] = this._getResourceValueName(
      'user.group.id',
      this.params.group.id
    );
    val['user_account'] = _.get(this.selectedUser, 'identification.account');
    val['email'] = _.get(this.selectedUser, 'identification.email');
    val['user_label'] = _.get(this.selectedUser, 'identification.label');
    val['user_label_english'] = _.get(
      this.selectedUser,
      'identification.label_english'
    );
    val['group.belonging_group_id'] = this._getResourceValueName(
      'user.group.belonging_group_id',
      this.params.group.belonging_group_id
    );
    val['phone_no'] = _.get(this.selectedUser, 'attribute.phone_no');
    val['address'] = _.get(this.params, 'user.attribute_create_place');
    val['group.granted_role.name'] = this._getResourceValueName(
      'user.group.granted_role_id',
      this.params.group.granted_role_id
    );
    val['group.granted_authority_names'] = _.map(
      this.authoritySelectComponent.getAuthorities(
        _.chain(_.get(val, 'group.granted_authority_ids'))
          .orderBy()
          .value()
      ),
      'name'
    ).join(', ');
    return val;
  }

  /**
   * 登録確認画面オープン
   *
   * 登録/変更確認モーダルを表示する。
   * 確認後、登録/変更処理をおこない、指定画面に遷移する
   *
   * @param path 確認後遷移先のパス
   */
  private _registerModalOpen(path: string): void {
    this._reflectRegistParams();
    this.descItem = this._createDescItem();
    this.valItem = this._createValItem();
    this.modalService.open({
      title: this.labels.submit_modal_title,
      labels: this.labels,
      content: this.submitModalContent,
      ok: () => {
        this._register(
          this.userId,
          _.omit(this.params, ['group.id', 'content']),
          path
        );
      },
    });
  }

  /**
   * 登録確認モーダル用のヘッダを作成する
   * @return 表示用項目
   */
  private _createDescItem(): object[] {
    const desc = [];
    const thList = [
      { path: 'user.group.id', name: 'group.id', displayable: this.exists('user.group.id', true) && !this.isEmptyConfigurationGroups },
      { path: 'user_account', name: 'user_account', displayable: true },
      { path: 'user_label', name: 'user_label', displayable: true },
      { path: 'user_label_english', name: 'user_label_english', displayable: this.userNameEnglishDisplayable },
      { path: 'email', name: 'email', displayable: true },
      { path: 'phone_no', name: 'phone_no', displayable: true },
      { path: 'user.group.belonging_group_id', name: 'group.belonging_group_id', displayable: true },
      { path: 'user.attribute_create_place', name: 'address', displayable: true },
      { path: 'user.group.granted_role_id', name: 'group.granted_role.name', displayable: true },
    ];

    // リソースおよびラベルからヘッダを作成
    _.each(thList, th => {
      // ユーザ名称（英語）は指定項目（専用のフラグ）にて制御を行う
      if (th.path === 'user_label_english' && this.userNameEnglishDisplayable) {
        desc.push({
          label: this.userNameEnglishLabel,
          name: th.name,
          displayable: th.displayable,
        });

        return;
      }

      const tmpResource = _.get(this.resource, th.path);
      if (tmpResource) {
        desc.push({
          label: tmpResource.name,
          name: th.name,
          displayable: th.displayable,
        });
      } else {
        const tmpLabel = _.get(this.labels, th.path);
        if (tmpLabel) {
          desc.push({
            label: tmpLabel,
            name: th.name,
            displayable: th.displayable,
          });
        }
      }
    });

    return desc;
  }
}
