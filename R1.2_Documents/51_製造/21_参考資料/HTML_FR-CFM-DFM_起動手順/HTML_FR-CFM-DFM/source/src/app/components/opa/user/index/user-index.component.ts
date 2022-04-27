import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import { ModalValues, TableHeader } from '../../../../types/common';
import {
  UserIndexParams,
  UserDeleteParams,
  AuthoritiesUpdateParams,
} from '../../../../types/opa/user';

import { ScreenCode } from '../../../../constants/opa/screen-codes/user-management';
import { FilterReservedWord } from '../../../../constants/condition';

import { KbaAuthoritySelectComponent } from '../../../shared/kba-authority-select/kba-authority-select.component';
import { KbaSelectedComponent } from '../../../shared/kba-selected/kba-selected.component';
import { KbaAbstractIndexComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-index-component';

import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { UserService } from '../../../../services/opa/user/user.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { AuthenticationService } from '../../../../services/shared/authentication.service';
import { ApiService } from '../../../../services/api/api.service';

@Component({
  selector: 'app-user-index',
  templateUrl: './user-index.component.html',
  styleUrls: ['./user-index.component.scss'],
})
export class UserIndexComponent extends KbaAbstractIndexComponent
  implements OnInit {
  @ViewChild('deleteModalContent', { static: false })
  deleteModalContent: TemplateRef<null>;
  @ViewChild('roleSelectComponent', { static: false })
  roleSelectComponent: KbaSelectedComponent;
  @ViewChildren(KbaAuthoritySelectComponent)
  authoritySelectComponentList: QueryList<KbaAuthoritySelectComponent>;

  params: UserIndexParams;
  deleteParams: UserDeleteParams;
  authoritiesUpdateParams: AuthoritiesUpdateParams;
  thList: TableHeader[];
  notSortingColumns = [];
  selectedAuthorities: any[] = [];
  authorities = [];
  deleteModalValues: ModalValues;

  deleteModalPromise: Promise<void>;

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    router: Router,
    header: CommonHeaderService,
    modalService: KbaModalService,
    ref: ChangeDetectorRef,
    private userService: UserService,
    private alertService: KbaAlertService,
    private authenticationService: AuthenticationService,
    private api: ApiService
  ) {
    super(navigationService, title, router, ref, header, modalService);
  }

  /**
   * テーブルに表示するデータを取得
   */
  async fetchList(sort_key?: string) {
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    this.isFetching = true;
    if (this.exists('group_kind_ids')) {
      this.searchParams.group_kind_ids =
        this.resource.group_kind_ids.values[0] ?
          this.resource.group_kind_ids.values[0].value.split(',') : null;
    }
    const res = await this.userService.fetchIndexList(
      this.searchParams,
      this.requestHeaderParams
    );
    this._fillLists(res.result_header, res.result_data.users);
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * 権限選択モーダルが閉じられた際のコールバック
   * @param selectedAuthorities 選択済み権限情報
   * @param user ユーザ情報
   */
  async onCloseAuthoritySelectModal(selectedAuthorities, user) {
    this._showLoadingSpinner();

    const userId = _.get(user, 'identification.id');
    this.authoritiesUpdateParams = {
      user: {
        group: {
          granted_authority_ids: selectedAuthorities,
          belonging_group_id: _.get(
            user,
            'group.belonging_group.identification.id'
          ),
        },
        update_datetime: _.get(user, 'identification.update_datetime'),
      },
    };
    await this.userService.updateAuthorities(userId, this.authoritiesUpdateParams);
    this.fetchList(this.sortingParams['sort']);

    this._hideLoadingSpinner();
    this.alertService.show(this.labels.authority_update_finish_message);
  }

  /**
   * 権限リンク押下コールバック
   * @param user ユーザ情報
   */
  async onClickSelect(user, index: number) {
    this._showLoadingSpinner();

    const authoritySelect = this.authoritySelectComponentList.toArray()[index];

    authoritySelect.reset();
    await this._authorities(user);
    authoritySelect.onClickSelect();

    this._hideLoadingSpinner();
  }

  /**
   * 編集ボタン押下コールバック
   * @param target 編集対象のオブジェクト
   */
  onClickEdit(target) {
    this.router.navigate(
      ['/users/', _.get(target, 'identification.id'), 'edit'],
      {
        queryParams: {
          user_group_id: _.get(
            target,
            'group.belonging_group.identification.id'
          ),
        },
      }
    );
  }

  /**
   * 検索処理
   */
  onClickSearch() {
    super.onClickSearch();
    this.fetchList(this.sortingParams['sort']);
  }

  /**
   * 削除ボタン押下コールバック
   *
   * 確認モーダルを表示し、確認後に削除APIをリクエストする。
   * リクエスト成功時にアラートメッセージを表示し、一覧を初期化する。
   *
   * @param user ユーザーデータ
   */
  async onClickDelete(user) {
    this._showLoadingSpinner();

    if (this.deleteModalValues == null) {
      await this.deleteModalPromise;
    }

    const id = _.get(user, 'identification.id');
    const groupId = _.get(user, 'group.belonging_group.identification.id');
    const res = await this.userService.fetchUserDetail(
      id,
      { belonging_group_id: groupId },
      this.deleteModalValues.requestHeaderParams
    );

    this.deleteModalValues.listVal = this._createModalListVal(
      _.get(res, 'result_data.user')
    );

    this.deleteParams = {
      belonging_group_id: groupId,
      update_datetime: _.get(user, 'identification.update_datetime'),
    };

    this._hideLoadingSpinner();

    this.modalService.open({
      title: this.labels.delete_modal_title,
      labels: this.labels,
      content: this.deleteModalContent,
      okBtnLabel: this.labels.delete,
      okBtnClass: 'btn-delete',
      ok: async () => {
        this._showLoadingSpinner();

        await this.userService.deleteUsers(id, this.deleteParams);

        this._hideLoadingSpinner();
        this.fetchList(this.sortingParams['sort']);
        this.alertService.show(this.labels.finish_message);
      },
    });
  }

  /**
   * 削除ボタンの表示可否
   * @param data データ
   */
  deleteIconHidden(data) {
    return (
      data.identification.account ===
        this.authenticationService.currentUserId &&
      data.group.belonging_group.identification.id === this.api.getGroupId()
    );
  }

  /**
   * テーブルの初期化に必要なデータを取得
   */
  protected async _fetchDataForInitialize() {
    const res = await this.userService.fetchInitData();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this._reflectXFields(res.fields);
    this.thList = this._createThList(res.fields);
    this.sortableThList = this.sortableThLists(this.thList);
    this.updatable = res.updatable;
    this.deletable = res.deletable;
  }

  protected _afterInitFetchList() {
    this.deleteModalPromise = this._buildDeleteModalValues();
  }

  protected _dataKey(key: string): string {
    return key
      .split('.')
      .slice(1)
      .join('.');
  }

  /**
   * 初期検索前の処理
   * 依存するリソースを更新する
   */
  protected async _beforeInitFetchList() {
    if (this.exists('group_id')) {
      this.params.role_id = this.resource.role_id.values[0].value;
    }
  }

  /**
   * モーダルに必要なデータを取得する
   * @override
   * @param fields 指定項目
   */
  protected _getModalValues(fields): ModalValues {
    const requestHeaderParams = { 'X-Fields': this._createXFields(fields) };
    const desc = this._createThList(fields).map(d => {
      if (d.name === 'user.groups.granted_role') {
        d.displayable = false;
      }
      return d;
    });
    return {
      requestHeaderParams,
      listDesc: desc,
      listVal: {},
    };
  }

  /**
   * 検索条件パラメータを取得する
   * @override
   * @param params パラメータ
   */
  protected _getSearchParams(params) {
    const _params = _.clone(params);
    if (_params.role_id !== FilterReservedWord.selectAll) {
      _params.user_kind = _params.role_id;
    }
    delete _params.role_id;
    return _params;
  }

  /**
   * ユーザーに設定されている権限情報を取得する
   * @param user ユーザーデータ
   */
  private async _authorities(user): Promise<any> {
    const param = {
      granted_role_id: _.get(user, 'group.granted_role.id'),
    };
    const res = await this.userService.fetchGrantedAuthorityIdsByRoleId(
      ScreenCode.list,
      param
    );
    this.authorities = res.user.group.granted_authority_ids.values;
    this.selectedAuthorities = _.map(
      _.get(user, 'group.granted_authorities'),
      'id'
    );
    this.safeDetectChanges();
  }

  /**
   * モーダルに表示されるユーザーのデータを作成する
   * @param user ユーザーデータ
   */
  private _createModalListVal(user) {
    const listData = user;
    listData['groups'] = user.groups[0];
    listData['groups']['granted_authority_names'] = _.map(
      _.get(user, 'groups.granted_authorities'),
      'name'
    ).join('、');
    return listData;
  }

  /**
   * 削除モーダル用ヘッダ項目生成
   */
  private _buildDeleteModalValues() {
    return new Promise<void>(async (resolve) => {
      const res = await this.userService.fetchIndexDeleteFields();
      this.deleteModalValues = this._getModalValues(res);
      resolve();
    });
  }
}
