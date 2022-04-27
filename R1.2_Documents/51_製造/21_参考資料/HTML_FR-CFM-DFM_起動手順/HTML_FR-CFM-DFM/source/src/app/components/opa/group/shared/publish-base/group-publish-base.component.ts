import * as _ from 'lodash';
import { ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { KbaAbstractIndexComponent } from '../../../../shared/kba-abstract-component/kba-abstract-index-component';
import { KbaNavigationService } from '../../../../../services/shared/kba-navigation.service';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CommonHeaderService } from '../../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../../services/shared/kba-alert.service';
import { GroupService } from '../../../../../services/opa/group/group.service';
import {
  InitializeApiResult,
  ModalValues,
  Api,
  Fields,
} from '../../../../../types/common';
import { KbaPaginationComponent } from '../../../../shared/kba-pagination/kba-pagination.component';
import { ScopeGroupKind } from '../../../../../constants/opa/scope-group-kind';
import { cloneDeep, get } from 'lodash';
import { RequestHeaderParams } from '../../../../../types/request';
import { ApiService } from '../../../../../services/api/api.service';
import { ProcessingType } from '../../../../../constants/download';
import { KbaSelectedComponent } from '../../../../shared/kba-selected/kba-selected.component';

export abstract class GroupPublishBaseComponent extends KbaAbstractIndexComponent {
  @ViewChild(KbaPaginationComponent, { static: false })
  pagination: KbaPaginationComponent;
  @ViewChild('groupKindSelect', { static: false })
  groupKindSelect: KbaSelectedComponent;
  @ViewChild('scopeSearchModalContent', { static: false })
  scopeSearchModalContent: TemplateRef<null>;
  @ViewChild('resetModalContent', { static: false })
  resetModalContent: TemplateRef<null>;
  @ViewChild('submitModalContent', { static: false })
  submitModalContent: TemplateRef<null>;

  registModalValues: ModalValues;
  selectModalValues: ModalValues;
  confirmModalValues: ModalValues;
  downloadFields: Fields;
  downloadFieldResources: Fields;
  downloadPopoverVisible = false;
  targetId: string;
  targetGroupKind: string;
  template: 'index' | 'edit' = 'index';
  currentScopeGroups;
  additionalGroups = [];
  removalGroups = [];
  tempAdditionalGroups;
  tempRemovalGroups;
  confirmAdditionalGroups = [];
  confirmRemovalGroups = [];
  currentItem;
  submitModalHeader;
  modalResource;
  submitModalItems;
  abstract downloadFunctionCode: string;
  abstract scopeCheckIdKey;
  targetItemLabel: string;

  abstract get editContentTitle(): string;
  abstract fetchScope: (
    id: string,
    params,
    requestHeaderParams: RequestHeaderParams
  ) => Promise<Api>;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    modal: KbaModalService,
    protected alertService: KbaAlertService,
    protected groupService: GroupService,
    private api: ApiService
  ) {
    super(nav, title, router, ref, header, modal);
  }

  async fetchList(sort_key?: string): Promise<any> {
    this.targetId = null;
    this.isFetching = true;
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    const res = await this._fetchList(
      this.searchParams,
      this.requestHeaderParams
    );
    const list = this._formatList(res.result_data.groups, this.thList);
    this._fillLists(res.result_header, list);
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * ダウンロードボタン押下時の処理
   */
  handleClickDownload() {
    this.downloadPopoverVisible = !this.downloadPopoverVisible;
  }

  /**
   * ラジオボタン選択時の処理
   * @param data データ
   */
  handleSelectItem(data) {
    this.targetId = data['groups.identification.id'];
    this.targetGroupKind = data['groups.identification.kind_id'];
  }

  /**
   * ダウンロードOKボタン押下時の処理
   */
  async handleClickDownloadOk(event) {
    await this.api.updateField(this.downloadFunctionCode, event.fields);
    await this._downloadTemplate(
      event.fields.map(field => field.path),
      event.fileType
    );
  }

  /**
   * 公開グループ / 顧客登録押下時の処理
   */
  async onClickPublishTargetEdit() {
    this.template = 'edit';
    await this._updateScopeThList(this.targetGroupKind);
    const res = await this.fetchScope(
      this.targetId,
      {
        scope_group_kind: ScopeGroupKind.set,
      },
      this.registModalValues.requestHeaderParams
    );
    this.currentItem = res.result_data.group;
    this.currentScopeGroups = this.currentItem.scope_groups;
  }

  /**
   * 戻るボタン押下時の処理
   */
  onClickBack() {
    this.template = 'index';
    this._reset();
    this.targetId = null;
    this.currentItem = null;
    this.safeDetectChanges();
    this.pagination.buildOptions();
  }

  /**
   * 公開設定選択ボタン押下時の処理
   */
  onClickScopeSelect() {
    this.modalService.open(
      {
        title: this.labels.scope_search_modal_title,
        labels: this.labels,
        content: this.scopeSearchModalContent,
        okBtnLabel: this.labels.reflect_btn,
        enableOk: false,
        ok: () => {
          this.additionalGroups = cloneDeep(this.tempAdditionalGroups);
          this.removalGroups = cloneDeep(this.tempRemovalGroups);
        },
      },
      {
        size: 'lg',
      }
    );
  }

  /**
   * 選択グループ更新時の処理
   * @param groups グループ
   */
  updateScopeGroups(groups) {
    this.tempAdditionalGroups = groups.added;
    this.tempRemovalGroups = groups.removed;
  }

  /**
   * リセット押下時の処理
   */
  onClickReset() {
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      ok: () => this._reset(),
    });
  }

  /**
   * 登録ボタン押下時の処理
   */
  async onClickSubmit() {
    this._showLoadingSpinner();
    this.submitModalItems = {
      target_item_label: get(this.currentItem, 'identification.label'),
    };
    this.confirmAdditionalGroups = this.additionalGroups;
    this.confirmRemovalGroups = this.removalGroups;

    if (this.submitModalHeader == null) {
      this.submitModalHeader = this._createSubmitModalHeader();
    }
    this._hideLoadingSpinner();

    this.modalService.open(
      {
        title: this.labels.submit_modal_title,
        labels: this.labels,
        content: this.submitModalContent,
        ok: () => this._submit(),
      },
      {
        size: 'lg',
      }
    );
  }

  /**
   * 検索ボタン押下時の処理
   * @override
   */
  onClickSearch() {
    super.onClickSearch();
    this.fetchList(this.sortingParams['sort']);
  }

  protected abstract _fetchDataForInitialize(): Promise<any>;

  /**
   * 共通の初期化処理を行う
   * @param res 初期化APIレスポンス
   */
  protected _initialize(res: InitializeApiResult) {
    this.labels = res.label;
    this.resource = res.resource;
    this.modalResource = cloneDeep(this.resource);
    this._setTitle();
    this.initialize(res);
    this.thList = this._createThList(res.fields);
    if (res.registFields) {
      this.registModalValues = this._getModalValues(res.registFields);
      const descItem = this.registModalValues.listDesc.find(
        desc => desc.name === 'group.identification.label'
      );
      this.targetItemLabel = descItem ? descItem.label : '';
    }
    if (res.selectFields) {
      this.selectModalValues = this._getModalValues(res.selectFields);
    }
    if (res.confirmFields) {
      this.confirmModalValues = this._getModalValues(res.confirmFields);
    }
    this.sortableThList = this.sortableThLists(this.thList);
    this.downloadFields = res.downloadFields;
    this.downloadFieldResources = res.downloadFieldResources;
    this._reflectXFields(res.fields);
  }

  protected abstract _callSubmitApi(id, params);

  protected _dataKey(key: string) {
    if (/^group\.scope_groups/.test(key)) {
      return key
        .split('.')
        .slice(2)
        .join('.');
    }

    return key;
  }

  /**
   * 入力内容をAPIに投げる
   */
  protected async _submit() {
    const params = this._createSubmitParams();

    this._showLoadingSpinner();

    await this._callSubmitApi(this.targetId, params);
    await this.router.navigateByUrl('/');

    this._hideLoadingSpinner();
    this.alertService.show(this.labels.finish_message);
  }

  /**
   * 登録APIに渡すパラメータを作成
   */
  protected abstract _createSubmitParams();

  /**
   * APIの戻り値によってテーブルのヘッダの表示制御を行う
   * @param item 項目
   */
  protected async _updateScopeThList(item) {}

  /**
   * 一覧取得 API を呼ぶ
   * @param searchParams 検索条件
   * @param requestHeaderParams ヘッダ
   */
  protected _fetchList(searchParams, requestHeaderParams) {
    return this.groupService.fetchPublishSettingGroups(
      this.searchParams,
      this.requestHeaderParams
    );
  }

  /**
   * 確認モーダルのヘッダを作成
   */
  private _createSubmitModalHeader() {
    return ['target_item_label', 'scope_items'].map(name => ({
      name,
      label: name === 'scope_items' ? this.labels[name] : this.targetItemLabel,
      displayable: true,
    }));
  }

  /**
   * 検索条件をリセット
   */
  private _resetSearchCondition() {
    this.params.group_label = '';
    this.groupKindSelect.reset();
    this.pagination.initOptions();
    this.safeDetectChanges();
  }

  /**
   * 入力内容をリセット
   */
  private _reset() {
    this.additionalGroups = [];
    this.removalGroups = [];
  }

  /**
   * テンプレートダウンロード
   * @param fields ダウンロード対象項目
   * @param accept ダウンロード形式
   */
  private async _downloadTemplate(fields, accept) {
    const header = _.clone(this.requestHeaderParams);
    header['X-Sort'] = this.sortingParams['sort'];
    header['X-Fields'] = fields;

    this._showLoadingSpinner();
    try {
      const res: any = await this.groupService.createPublishSettingGroupsFile(
        {
          ...this.searchParams,
          file_content_type: accept,
          processing_type: ProcessingType.sync,
        },
        header
      );

      await this.api.downloadFile(res.result_data.file_id, accept);
    } finally {
      this._hideLoadingSpinner();
    }
  }
}
