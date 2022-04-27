import * as _ from 'lodash';
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

import { TableHeader, ModalValues, Fields } from '../../../../types/common';
import {
  UserIndexParams,
  UserDeleteParams,
  AuthoritiesUpdateParams,
} from '../../../../types/flm/user';

import { ScreenCode } from '../../../../constants/flm/screen-codes/user-management';
import { FunctionCode } from '../../../../constants/flm/function-codes/user-management';

import { KbaAbstractIndexComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-index-component';
import { KbaAuthoritySelectComponent } from '../../../shared/kba-authority-select/kba-authority-select.component';
import { KbaSelectedComponent } from '../../../shared/kba-selected/kba-selected.component';

import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { UserService } from '../../../../services/flm/user/user.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { AuthenticationService } from '../../../../services/shared/authentication.service';

@Component({
  selector: 'app-user-index',
  templateUrl: './user-index.component.html',
  styleUrls: ['./user-index.component.scss'],
})
export class UserIndexComponent extends KbaAbstractIndexComponent
  implements OnInit {
  @ViewChild('deleteModalContent', { static: false })
  deleteModalContent: TemplateRef<null>;
  @ViewChild('belongingGroupId', { static: false })
  belongingGroupSelectComponent: KbaSelectedComponent;
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
  fieldSelectPopoverVisible = false;
  fields: Fields;
  deleteModalValues: ModalValues;

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    router: Router,
    header: CommonHeaderService,
    modalService: KbaModalService,
    ref: ChangeDetectorRef,
    private userService: UserService,
    private alertService: KbaAlertService,
    private api: ApiService,
    private authenticationService: AuthenticationService
  ) {
    super(navigationService, title, router, ref, header, modalService);
  }

  /**
   * テーブルに表示するデータを取得
   */
  async fetchList(sort_key?: string) {
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    this.isFetching = true;
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
  onCloseAuthoritySelectModal(selectedAuthorities, user) {
    const userId = _.get(user, 'identification.id');
    this.authoritiesUpdateParams = {
      user: {
        group: {
          belonging_group_id: _.get(
            user,
            'group.belonging_group.identification.id'
          ),
          granted_authority_ids: selectedAuthorities,
        },
        update_datetime: _.get(user, 'identification.update_datetime'),
      },
    };
    this.userService
      .updateAuthorities(userId, this.authoritiesUpdateParams)
      .then(res => {
        this.fetchList(this.sortingParams['sort']);
        this.alertService.show(this.labels.authority_update_finish_message);
      });
  }

  /**
   * 権限リンク押下コールバック
   * @param user ユーザ情報
   */
  async onClickSelect(user, index: number) {
    const authoritySelect = this.authoritySelectComponentList.toArray()[index];

    authoritySelect.reset();
    await this._authorities(user);
    authoritySelect.onClickSelect();
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
          belonging_group_id: _.get(
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
   * @param user システム通知
   */
  async onClickDelete(user: object) {
    const id = _.get(user, 'identification.id');
    const belongingGroupId = _.get(
      user,
      'group.belonging_group.identification.id'
    );
    const res = await this.userService.fetchUserDetail(
      id,
      { belonging_group_id: belongingGroupId },
      this.deleteModalValues.requestHeaderParams
    );

    this.deleteModalValues.listVal = this._createModalListVal(
      _.get(res, 'result_data.user')
    );

    this.deleteParams = {
      belonging_group_id: belongingGroupId,
      update_datetime: _.get(user, 'identification.update_datetime'),
    };

    this.modalService.open({
      title: this.labels.delete_modal_title,
      labels: this.labels,
      content: this.deleteModalContent,
      okBtnLabel: this.labels.delete,
      okBtnClass: 'btn-delete',
      ok: () => {
        this.userService.deleteUsers(id, this.deleteParams).then(() => {
          this.fetchList(this.sortingParams['sort']);
          this.alertService.show(this.labels.finish_message);
        });
      },
    });
  }

  /**
   * グループID変更時の処理
   * @param value 選択値
   */
  onGroupIdChange(value) {
    const param = {
      configuration_group_id: value,
    };
    return this.userService
      .fetchBelongingGroupIdByGroupIdIndex(ScreenCode.list, param)
      .then(async (res: any) => {
        this.resource.belonging_group_id = res.belonging_group_id;
        if (this.belongingGroupSelectComponent) {
          await this.belongingGroupSelectComponent.refresh();
          this.belongingGroupSelectComponent.reset();
        }
      });
  }

  /**
   * 表示項目設定ボタン押下時の処理
   */
  onClickFieldSelect() {
    this.fieldSelectPopoverVisible = !this.fieldSelectPopoverVisible;
  }

  /**
   * 指定項目設定ボタン押下時の処理
   * @param event イベント
   */
  async onFieldSelectOk(event) {
    await this.api.updateField(FunctionCode.listFunction, event.fields);
    const res = await new Promise(resolve =>
      this.api
        .fetchFields(FunctionCode.listFunction)
        .subscribe(_res => resolve(_res))
    );
    this._updateFields(res);
    this.fetchList(this.sortingParams['sort']);
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
  protected async _fetchDataForInitialize(): Promise<void> {
    const res = await this.userService.fetchInitData();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this.fieldResources = res.fieldResources;
    this.deleteModalValues = this._getModalValues(res.deleteFields);
    this._setTitle();
    this._reflectXFields(res.fields);
    this._updateFields(res.fields);
    this.updatable = res.updatable;
    this.deletable = res.deletable;

    const groupId = this.exists('configuration_group_id')
      ? this.resource.configuration_group_id.values[0].value
      : this.api.getGroupId();

    await this.onGroupIdChange(groupId);
  }

  protected _dataKey(key: string): string {
    return key
      .split('.')
      .slice(1)
      .join('.');
  }

  /**
   * 初期検索前に処理を行う。
   */
  protected async _beforeInitFetchList(): Promise<any> {
    if (this.exists('configuration_group_id')) {
      const res = await this.userService.fetchBelongingGroupIdByGroupIdIndex(
        ScreenCode.list,
        {
          configuration_group_id: _.get(
            this.resource,
            'configuration_group_id.values[0].value'
          ),
        }
      );
      _.merge(this.resource, res);
      _.set(
        this.params,
        'belonging_group_id',
        _.get(this.resource, 'belonging_group_id.values[0].value')
      );
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
   * 指定項目取得 API の結果を反映
   * @param fields 指定項目
   */
  private _updateFields(fields) {
    this.fields = fields;
    this.thList = this._createThList(fields);
    const xFields = this._createXFields(fields);
    this.sortableThList = this.sortableThLists(this.thList);
    this._setXFields(xFields);
  }

  /**
   * モーダルに表示されるユーザーのデータを作成する
   * @param user ユーザーデータ
   */
  private _createModalListVal(user) {
    const listData = user;
    listData.groups = user.groups[0];
    listData.groups.granted_authority_names = _.map(
      _.get(user, 'groups.granted_authorities'),
      'name'
    ).join('、');
    listData.groups.configuration_groups =
      listData.groups.configuration_groups[0];
    return listData;
  }
}
