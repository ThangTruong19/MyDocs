import * as _ from 'lodash';
import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { HistoryMgtListIndexParams, HistoryMgtListFileCreateParams } from 'app/types/history-mgt-list';
import { DatePickerParams } from 'app/types/calendar';
import { Fields, Labels } from 'app/types/common';

import { ProcessingType } from 'app/constants/download';
import { DateFormat } from 'app/constants/date-format';
import { FunctionCodeConst } from 'app/constants/api/function-code-const';

import { AbstractIndexComponent } from 'app/components/shared/abstract-component/abstract-index.component';
import { SelectedComponent } from 'app/components/shared/selected/selected.component';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { ModalService } from 'app/services/shared/modal.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { AlertService } from 'app/services/shared/alert.service';
import { ApiService } from 'app/services/api/api.service';
import { CarListService } from 'app/services/car-list/car-list.service';
import { DatePickerService } from 'app/services/shared/date-picker.service';
import { UserSettingService } from 'app/services/api/user-setting.service';

import { MimeType } from 'app/constants/mime-types';

@Component({
  selector: 'app-car-mgt-list',
  templateUrl: './car-list.component.html',
  styleUrls: ['./car-list.component.scss'],
})
export class CarListComponent extends AbstractIndexComponent {
  @ViewChild('belongingCategoryCode', { static: false })
  belongingCategoryCode: SelectedComponent;
  @ViewChild('belongingCustomizeUsageDefinitionId', { static: false })
  belongingCustomizeUsageDefinitionId: SelectedComponent;

  datePickerParams: DatePickerParams;
  fields: Fields;
  downloadFields: Fields;
  downloadFieldResources: Fields;
  fieldSelectPopoverVisible = false;
  downloadPopoverVisible = false;
  testing = false;
  _dateFormat = '';
  timeZone = '';
  enableDateRange: string[] = [];
  beginningWday: number;
  excludeSearchParams: string[] = ['date_from_formatted', 'date_to_formatted'];
  datePickerLabels: Labels;
  override commaSeparated: string[] = ['serials'];

  constructor(
    navigationService: NavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    protected carListService: CarListService,
    protected api: ApiService,
    protected override modalService: ModalService,
    protected alertService: AlertService,
    protected datePickerService: DatePickerService,
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
    const params: HistoryMgtListIndexParams = {
      customize_operation_history: _.omit(
        this.searchParams,
        this.excludeSearchParams
      )
    };
    const res = await this.carListService.fetchIndexList(
      params,
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
  override onClickSearch(): void {
    super.onClickSearch();
    this.fetchList(this.sortingParams['sort']);
  }

  /**
   * 表示項目設定ボタン押下時の処理
   * @param event イベント
   */
  // onClickFieldSelect(event: any): void {
  //   this.fieldSelectPopoverVisible = !this.fieldSelectPopoverVisible;
  // }

  /**
   * 一括ダウンロードボタン押下時の処理
   */
  // onClickDownloadAll(): void {
  //   this.downloadPopoverVisible = !this.downloadPopoverVisible;
  // }

  /**
   * 対象画面のプルダウン変更時の処理
   * @param value 対象画面
   */
  handleAppCodeChange(value: any) { }

  /**
   * 大分類変更時の処理
   * @param value 選択値
   */
  async onCategoryCodeChange(value: any) {console.log('what');
    // const res = await this.carListService.fetchBelongingCategoryCode(value);
    const res = await this.carListService.fetchAllDropdownSelection(value);
    console.log('throw breaks');console.log(res);

    _.set(
      this.resource,
      'operation_history.code',
      _.get(res, 'operation_history.code')
    );
    if (this.belongingCategoryCode) {
      this.belongingCategoryCode.reset();
      this.belongingCategoryCode.refresh();
    }
  }

  /**
 * カスタマイズ用途定義変更時の処理
 * @param value 選択値
 */
  async onCustomizeUsageDefinitionIdChange(value: any) {//alert('what 2 '+value);

    // const res = await this.carListService.fetchBelongingCustomizeUsageDefinitionId(value);
    // _.set(
    //   this.resource,
    //   'operation_history.customize_definition_id',
    //   _.get(res, 'operation_history.customize_definition_id')
    // );
    // if (this.belongingCustomizeUsageDefinitionId) {
    //   this.belongingCustomizeUsageDefinitionId.reset();
    //   this.belongingCustomizeUsageDefinitionId.refresh();
    // }

    // alert('what 2 '+value);
    if (value == 3) {
      this.downloadPopoverVisible = true;
    }
    // alert(this.downloadPopoverVisible);
  }

  /**
   * ダウンロードOKボタン押下時の処理
   * @param event イベント
   */
  async onDownloadOk(event: any): Promise<void> {
    await this.api.updateField(
      FunctionCodeConst.HISTORY_MGT_LIST_DOWNLOAD_FUNCTION,
      // event.fields
      this.fields
    );
    await this._downloadTemplate(
      this.fields.map((f: { path: string }) => f.path),
      // event.fileType
      MimeType.excel
    );
  }

  /**
   * 表示項目設定 OK ボタン押下時の処理
   * @param event イベント
   */
  // async onFieldSelectOk(event: any): Promise<void> {
  //   await this.api.updateField(
  //     FunctionCodeConst.HISTORY_MGT_LIST_FUNCTION,
  //     event.fields
  //   );
  //   const res = await new Promise((resolve) =>
  //     this.api
  //       .fetchFields(FunctionCodeConst.HISTORY_MGT_LIST_FUNCTION)
  //       .subscribe((_res) => resolve(_res))
  //   );
  //   this._updateFields(res);
  //   this.fetchList(this.sortingParams['sort']);
  // }

  /**
   * 初期化 API を呼ぶ
   */
  protected async _fetchDataForInitialize(): Promise<void> {
    const res: any = await this.carListService.fetchIndexInitData();
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
  protected _updateFields(fields: any): void {
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
  protected async _downloadTemplate(fields: any, accept: any): Promise<void> {
    const params: HistoryMgtListFileCreateParams = {
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
      const res: any = await this.carListService.createFile(params, header);
      await this.api.downloadFile(res.result_data.file_id, accept);
    } finally {
      this._hideLoadingSpinner();
    }
  }

  /**
   * 初期検索前の処理
   * 依存するリソースを更新する
   */
  protected override async _beforeInitFetchList(): Promise<any> {
    if (this.exists('operation_history.category_code')) {
      await this.onCategoryCodeChange(
        _.get(this.resource, 'operation_history.category_code.values[0].value')
      );
    }
  }

  protected override _getSearchParams(params: any): HistoryMgtListIndexParams {
    return _.reduce(
      params,
      (res: any, val, key) => {
        res[key] = this.commaSeparated.includes(key) ? val.split(',') : val;
        return res;
      },
      {}
    );
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
      today.clone().subtract(1, 'month').format(DateFormat.hyphen)
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











  candisable(data: any): boolean {

    // this.fetchList(this.sortingParams['sort']);


    // console.log(data);
    // this.downloadPopoverVisible = false;
    // console.log(this.fields.terminalModeType);

    //<i class="kba-icon kba-icon-edit"></i>

    return true;
  }

  public handleClick(): void {
    this.router.navigated = false;
    this.router.navigateByUrl("/customize_data_request");
  }
}
