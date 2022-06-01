import * as _ from 'lodash';
import { Component, ChangeDetectorRef, ViewChild, TemplateRef, ViewChildren, QueryList, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { Fields, Labels, TableHeader } from 'app/types/common';

import { FunctionCodeConst } from 'app/constants/api/function-code-const';

import { AbstractIndexComponent } from 'app/components/shared/abstract-component/abstract-index.component';
import { SelectedComponent } from 'app/components/shared/selected/selected.component';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { ModalService } from 'app/services/shared/modal.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { AlertService } from 'app/services/shared/alert.service';
import { ApiService } from 'app/services/api/api.service';
import { UserSettingService } from 'app/services/api/user-setting.service';
import { UserService } from 'app/services/shared/user.service';
import { FilterReservedWord } from 'app/constants/condition';
import { ScreenCodeConst } from 'app/constants/api/screen-code-const';
import { AuthoritiesUpdateParams, UserDeleteParams, UserIndexParams } from 'app/types/user';
import { AuthoritySelectComponent } from './authority-select/authority-select.component';

@Component({
  selector: 'app-authority-mgt-list',
  templateUrl: './authority-mgt-list.component.html',
  styleUrls: ['./authority-mgt-list.component.scss']
})
export class AuthorityMgtListComponent extends AbstractIndexComponent
  implements OnInit {

  @ViewChild('deleteModalContent', { static: false })
  deleteModalContent: TemplateRef<null>;
  @ViewChild('belongingGroupId', { static: false })
  belongingGroupSelectComponent: SelectedComponent;
  @ViewChildren(AuthoritySelectComponent)
  authoritySelectComponentList: QueryList<AuthoritySelectComponent>;

  override params: UserIndexParams;
  deleteParams: UserDeleteParams;
  authoritiesUpdateParams: AuthoritiesUpdateParams;
  override thList: TableHeader[];
  fields: Fields
  fieldSelectPopoverVisible = false;
  downloadPopoverVisible = false;
  _dateFormat = '';
  timeZone = '';
  enableDateRange: string[] = [];
  beginningWday: number;
  excludeSearchParams: string[] = ['date_from_formatted', 'date_to_formatted'];
  override commaSeparated: string[] = ['serials'];
  selectedAuthorities: any[] = [];
  authorityKinds: any[] = [];
  authorities: any = [];
  accessLevel: any;

  constructor(
    navigationService: NavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    private userService: UserService,
    private api: ApiService,
    private alertService: AlertService,
  ) {
    super(navigationService, title, router, ref, header);
  }

  /**
   * 現在のパラメータを一覧取得APIに引き渡し、一覧画面に表示するリストを取得する
   * @param sort_key ソートキー
   */
  async fetchList(sort_key?: string):Promise<void> {
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
  onCloseAuthoritySelectModal(selectedAuthorities: any, user: any):void {
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
      .then(_ => {
        this.fetchList(this.sortingParams['sort']);
        this.alertService.show(this.labels.authority_update_finish_message);
      });
  }

  /**
 * 権限リンク押下コールバック
 * @param user ユーザ情報
 * @param index 押下した行番号
 */
  async onClickSelect(user: any, index: number):Promise<void> {

    const authoritySelect = this.authoritySelectComponentList.toArray()[index];

    authoritySelect.reset();
    await this._authorities(user);
    authoritySelect.onClickSelect();

  }

  /**
   * ユーザーに設定されている権限情報を取得する
   * @param user ユーザーデータ
   */
  private async _authorities(user: any): Promise<any> {
    const accessKindTop = "0"
    const param = {
      granted_role_id: _.get(user, 'group.granted_role.id'),
    };
    const res = await this.userService.fetchGrantedAuthorityIdsByRoleId(
      ScreenCodeConst.AUTHORITY_MGT_LIST_CODE,
      param
    );

    this.authorities = []
    let listAuthorities = res.user.group.granted_authority_ids.values
    this.selectedAuthorities = _.map(
      _.get(user, 'group.granted_authorities'),
      'id'
    );

    // 設定されている権限のアクセスレベルを取得
    const notfind = -1
    let accessKind
    for (let i = 0; i < listAuthorities.length; i++) {
      if (this.selectedAuthorities.indexOf(listAuthorities[i].value) != notfind) {
        accessKind = listAuthorities[i].kind
        break;
      }
    }

    if (accessKind == null) {
      accessKind = accessKindTop
    }

    this.authoritiesKindList(accessKind, listAuthorities)

    this.safeDetectChanges();
  }

  /**
   * アクセスレベルと合致する権限を取得する
   * @param accessKind アクセスレベル
   * @param listAuthorities 権限一覧
   */
  authoritiesKindList(accessKind: string, listAuthorities: any):void {
    // this.authoritiesとユーザのアクセスレベルを比較して、適合するものだけを取得する
    for (let i = 0; i < listAuthorities.length; i++) {
      if (listAuthorities[i].kind == accessKind) {
        this.authorities.push(listAuthorities[i])
      }
    }

  }

  /**
   * 検索ボタン押下時の処理
   * 現在のパラメータを更新してリストを取得する
   */
  override onClickSearch(): void {
    super.onClickSearch();
    this.fetchList(this.sortingParams['sort']);
  }

  /**
   * グループID変更時の処理
   * @param value 選択値
   */
  onGroupIdChange(value: any):Promise<void> {
    const param = {
      configuration_group_id: value,
    };
    return this.userService
      .fetchBelongingGroupIdByGroupIdIndex(ScreenCodeConst.AUTHORITY_MGT_LIST_CODE, param)
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
  onClickFieldSelect(): void {
    this.fieldSelectPopoverVisible = !this.fieldSelectPopoverVisible;
  }

  /**
   * 一括ダウンロードボタン押下時の処理
   */
  onClickDownloadAll(): void {
    this.downloadPopoverVisible = !this.downloadPopoverVisible;
  }

  /**
   * 表示項目設定 OK ボタン押下時の処理
   * @param event イベント
   */
  async onFieldSelectOk(event: any): Promise<void> {
    await this.api.updateField(
      FunctionCodeConst.AUTHORITY_MGT_LIST_FUNCTION,
      event.fields
    );
    const res = await new Promise((resolve) =>
      this.api
        .fetchFields(FunctionCodeConst.AUTHORITY_MGT_LIST_FUNCTION)
        .subscribe((_res) => resolve(_res))
    );
    this._updateFields(res);
    this.fetchList(this.sortingParams['sort']);
  }

  /**
   * 文字列のリムーブ
   * @param str 元の文字列
   * @param remove 除去する文字列
   */
  removeStr(str: string, remove: string):string {
    return str.replace(remove, "")
  }

  // /**
  //  * 初期化 API を呼ぶ
  //  */
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

  }

  /**
   * 指定項目取得 API の結果を反映
   * @param fields 指定項目
   */
  private _updateFields(fields: any):void {
    this.fields = fields;
    this.thList = this._createThList(fields);
    const xFields = this._createXFields(fields);
    this.sortableThList = this.sortableThLists(this.thList);
    this._setXFields(xFields);
  }

  /**
   * 初期検索前の処理
   * 依存するリソースを更新する
   */

  protected override async _beforeInitFetchList(): Promise<any> {
    if (this.exists('configuration_group_id')) {
      const res = await this.userService.fetchBelongingGroupIdByGroupIdIndex(
        ScreenCodeConst.AUTHORITY_MGT_LIST_CODE,
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
   * 検索条件パラメータを取得する
   * @override
   * @param params パラメータ
   */
  protected override _getSearchParams(params: any):any {
    const _params = _.clone(params);
    if (_params.role_id != FilterReservedWord.selectAll) {
      _params.user_kind = _params.role_id;
    }
    delete _params.role_id;
    return _params;
  }
}