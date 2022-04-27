import * as _ from 'lodash';
import { ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import {
  HistoryIndexParams,
  HistoryFileCreateParams,
} from '../../../types/history';
import { DatePickerParams } from '../../../types/calendar';
import { Fields, Labels } from '../../../types/common';

import { ProcessingType } from '../../../constants/download';
import { DateFormat } from '../../../constants/date-format';

import { KbaAbstractIndexComponent } from '../../shared/kba-abstract-component/kba-abstract-index-component';
import { KbaSelectedComponent } from '../kba-selected/kba-selected.component';

import { CommonHeaderService } from '../../../services/shared/common-header.service';
import { KbaModalService } from '../../../services/shared/kba-modal.service';
import { KbaNavigationService } from '../../../services/shared/kba-navigation.service';
import { KbaAlertService } from '../../../services/shared/kba-alert.service';
import { ApiService } from '../../../services/api/api.service';
import { HistoryService } from '../../../services/opa/history/history.service';
import { KbaDatePickerService } from '../../../services/shared/kba-date-picker.service';
import { UserSettingService } from '../../../services/api/user-setting.service';

export abstract class KbaHistoryCommonComponent extends KbaAbstractIndexComponent {
  @ViewChild('belongingCategoryCode', { static: false })
  belongingCategoryCodeSelectComponent: KbaSelectedComponent;
  @ViewChild('belongingGroupKindId', { static: false })
  belongingGroupKindSelectComponent: KbaSelectedComponent;

  functionCode;
  datePickerParams: DatePickerParams;
  fields: Fields;
  downloadFields: Fields;
  downloadFieldResources: Fields;
  fieldSelectPopoverVisible = false;
  downloadPopoverVisible = false;
  _dateFormat = '';
  timeZone = '';
  enableDateRange: string[] = [];
  beginningWday: number;
  excludeSearchParams: string[] = ['date_from_formatted', 'date_to_formatted'];
  datePickerLabels: Labels;
  commaSeparated: string[] = ['serials'];

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    protected historyService: HistoryService,
    protected api: ApiService,
    protected modalService: KbaModalService,
    protected alertService: KbaAlertService,
    protected datePickerService: KbaDatePickerService,
    protected userSettingService: UserSettingService
  ) {
    super(navigationService, title, router, ref, header);
  }

  /**
   * 現在のパラメータを一覧取得APIに引き渡し、一覧画面に表示するリストを取得する
   * @param sort_key ソートキー
   */
  async fetchList(sort_key?: string): Promise<void> {
    this.isFetching = true;
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    const searchParams: HistoryIndexParams = _.omit(
      this.searchParams,
      this.excludeSearchParams
    );
    const res = await this.historyService.fetchIndexList(
      searchParams,
      this.requestHeaderParams
    );
    const list = this._formatList(
      res.result_data.operation_histories,
      this.thList
    );
    this._fillLists(res.result_header, list);
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * 検索ボタン押下時の処理
   * 現在のパラメータを更新してリストを取得する
   */
  onClickSearch(): void {
    super.onClickSearch();
    this.fetchList(this.sortingParams['sort']);
  }

  /**
   * 表示項目設定ボタン押下時の処理
   * @param event イベント
   */
  onClickFieldSelect(event): void {
    this.fieldSelectPopoverVisible = !this.fieldSelectPopoverVisible;
  }

  /**
   * 一括ダウンロードボタン押下時の処理
   */
  onClickDownloadAll(): void {
    this.downloadPopoverVisible = !this.downloadPopoverVisible;
  }

  /**
   * 対象画面のプルダウン変更時の処理
   * @param value 対象画面
   */
  handleAppCodeChange(value) {}

  /**
   * 大分類変更時の処理
   * @param value 選択値
   */
  async onCategoryCodeChange(value) {
    const res = await this.historyService.fetchBelongingCode(value);
    _.set(
      this.resource,
      'operation_history.code',
      _.get(res, 'operation_history.code')
    );
    if (this.belongingCategoryCodeSelectComponent) {
      this.belongingCategoryCodeSelectComponent.reset();
      this.belongingCategoryCodeSelectComponent.refresh();
    }
  }

  /**
   * グループ分類変更時の処理
   * @param value 選択値
   */
  async onGroupKindChange(value) {
    const res = await this.historyService.fetchBelongingGroup(value);
    _.set(
      this.resource,
      'operation_history.group_id',
      _.get(res, 'operation_history.group_id')
    );
    if (this.belongingGroupKindSelectComponent) {
      this.belongingGroupKindSelectComponent.reset();
      this.belongingGroupKindSelectComponent.refresh();
    }
  }

  /**
   * ダウンロードOKボタン押下時の処理
   * @param event イベント
   */
  async onDownloadOk(event): Promise<void> {
    await this.api.updateField(
      this.functionCode.listDownloadFunction,
      event.fields
    );
    await this._downloadTemplate(event.fields.map(f => f.path), event.fileType);
  }

  /**
   * 表示項目設定 OK ボタン押下時の処理
   * @param event イベント
   */
  async onFieldSelectOk(event): Promise<void> {
    await this.api.updateField(this.functionCode.listFunction, event.fields);
    const res = await new Promise(resolve =>
      this.api
        .fetchFields(this.functionCode.listFunction)
        .subscribe(_res => resolve(_res))
    );
    this._updateFields(res);
    this.fetchList(this.sortingParams['sort']);
  }

  /**
   * 初期化 API を呼ぶ
   */
  protected async _fetchDataForInitialize(): Promise<void> {
    const res: any = await this.historyService.fetchIndexInitData();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this.updatable = res.updatable;
    this.deletable = res.deletable;
    this._updateFields(res.fields);
    this.fieldResources = res.fieldResources;
    this.downloadFields = res.downloadFields;
    this.downloadFieldResources = res.downloadFieldResources;
    this._datePickerInitialize();
  }

  /**
   * 指定項目を更新
   * @param fields 指定項目
   */
  protected _updateFields(fields): void {
    this.fields = fields;
    this.thList = this._createThList(fields);
    this.sortableThList = this.sortableThLists(this.thList);
    this._reflectXFields(fields);
  }

  /**
   * テンプレートダウンロード
   * @param fields ダウンロード対象項目
   * @param accept ダウンロード形式
   */
  protected async _downloadTemplate(fields, accept): Promise<void> {
    const params: HistoryFileCreateParams = {
      operation_history: _.omit(this.searchParams, this.excludeSearchParams),
      file_create_condition: {
        file_content_type: accept,
        processing_type: ProcessingType.sync,
      },
    };
    const header = _.cloneDeep(this.requestHeaderParams);
    header['X-Sort'] = this.sortingParams['sort'];
    header['X-Fields'] = fields;
    this._showLoadingSpinner();
    try {
      const res: any = await this.historyService.createFile(params, header);
      await this.api.downloadFile(res.result_data.file_id, accept);
    } finally {
      this._hideLoadingSpinner();
    }
  }

  /**
   * 初期検索前の処理
   * 依存するリソースを更新する
   */
  protected async _beforeInitFetchList(): Promise<any> {
    if (this.exists('operation_history.category_code')) {
      await this.onCategoryCodeChange(
        _.get(this.resource, 'operation_history.category_code.values[0].value')
      );
    }

    if (this.exists('operation_history.group_kind_id')) {
      await this.onGroupKindChange(
        _.get(this.resource, 'operation_history.group_kind_id.values[0].value')
      );
    }
  }

  protected _getSearchParams(params): HistoryIndexParams {
    return _.reduce(params, (res, val, key) => {
      res[key] = this.commaSeparated.includes(key) ? val.split(',') : val;
      return res;
    }, {});
  }

  /**
   * デートピッカーの初期化
   */
  private async _datePickerInitialize(): Promise<any> {
    const datePickerConfig = this.userSettingService.getDatePickerConfig();
    this.beginningWday = datePickerConfig.first_day_of_week_kind;
    const _window = window as any;
    this.enableDateRange = _window.settings.datePickerRange.other;
    this._dateFormat = datePickerConfig.date_format_code;
    this.timeZone = datePickerConfig.time_difference;

    this.datePickerParams = {
      timeZone: this.timeZone,
      dateFormat: this._dateFormat,
    };

    this.datePickerService.initialize(this.datePickerParams);

    const today = this.datePickerService.toMoment();

    _.set(
      this.params,
      'date_from',
      today
        .clone()
        .subtract(1, 'month')
        .format(DateFormat.hyphen)
    );
    _.set(
      this.params,
      'date_from_formatted',
      today
        .clone()
        .subtract(1, 'month')
        .format(this.datePickerService.inputDateFormat(this._dateFormat))
    );
    _.set(this.params, 'date_to', today.format(DateFormat.hyphen));
    _.set(
      this.params,
      'date_to_formatted',
      today.format(this.datePickerService.inputDateFormat(this._dateFormat))
    );
  }
}
