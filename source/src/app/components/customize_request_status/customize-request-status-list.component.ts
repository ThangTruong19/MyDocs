import * as _ from 'lodash';
import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { CustomizeRequestStatusListIndexParams } from 'app/types/customize-request-status-list';
import { DatePickerParams } from 'app/types/calendar';
import { Fields, Labels, TableHeader, TableMergeColumn, TableOptions } from 'app/types/common';

import { DateFormat } from 'app/constants/date-format';

import { AbstractIndexComponent } from 'app/components/shared/abstract-component/abstract-index.component';
import { SelectedComponent } from 'app/components/shared/selected/selected.component';
import { SearchDatePickerComponent } from '../shared/search-date-picker/search-date-picker.component';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { ModalService } from 'app/services/shared/modal.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { AlertService } from 'app/services/shared/alert.service';
import { ApiService } from 'app/services/api/api.service';
import { CustomizeRequestStatusListService } from 'app/services/customize_request_status/customize-request-status-list.service';
import { DatePickerService } from 'app/services/shared/date-picker.service';
import { UserSettingService } from 'app/services/api/user-setting.service';

@Component({
  selector: 'app-customize-request-status-list',
  templateUrl: './customize-request-status-list.component.html',
  styleUrls: ['./customize-request-status-list.component.scss']
})
export class CustomizeRequestStatusListComponent extends AbstractIndexComponent {
  @ViewChild('belongingCustomizeUsageDefinitionId', { static: false })
  belongingCustomizeUsageDefinitionId: SelectedComponent;

  datePickerParams: DatePickerParams;
  fields: Fields;
  _dateFormat = '';
  timeZone = '';
  enableDateRange: string[] = [];
  beginningWday: number;
  datePickerLabels: Labels;
  override commaSeparated: string[] = [
    'division_codes',
    'models',
    'type_revs',
    'serials',
  ];

  public mergeColumns: TableMergeColumn[] = [];

  constructor(
    navigationService: NavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    protected customizeRequestStatusListService: CustomizeRequestStatusListService,
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
    const params: CustomizeRequestStatusListIndexParams = {
      customize_usage_definition_id: this.searchParams.customize_usage_definition_id,
      customize_definition_id: this.searchParams.customize_definition_id,
      car_identification: {
        division_codes: this.searchParams.division_codes,
        models: this.searchParams.models,
        type_revs: this.searchParams.type_revs,
        serials: this.searchParams.serials
      },
      request_status: {
        api_code: this.searchParams.api_code,
        status: this.searchParams.status,
        request_registration_date_from: this.searchParams.request_registration_date_from,
        request_registration_date_to: this.searchParams.request_registration_date_to
      }
    }
    const res = await this.customizeRequestStatusListService.fetchIndexList(
      params,
      this.requestHeaderParams
    );
    const list = this._formatList(
      res.result_data.request_status,
      this.thList
    );
    this._fillLists(res.result_header, list);
    this.isFetching = false;
    this._afterFetchList();

    this.mergeColumns = [
      { groupByColumns: ['request_status.car_identification.model', 'request_status.car_identification.type_rev'],
        targetColumn: 'request_status.car_identification.serial' },  // 「機番」列のマージ設定
      { groupByColumns: ['request_status.request_status_information.status_name'],
        targetColumn: 'request_status.request_status_information.status_name' }  // 「ステータス」列のマージ設定
    ]
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
   * 対象画面のプルダウン変更時の処理
   * @param value 対象画面
   */
  handleAppCodeChange(value: any) { }

  /**
   * カスタマイズ用途定義変更時の処理
   * @param value 選択値
   */
  async onCustomizeUsageDefinitionIdChange(value: any) {
    const res = await this.customizeRequestStatusListService.fetchBelongingCustomizeUsageDefinitionId(value);
    _.set(
      this.resource,
      'customize_definition_id',
      _.get(res, 'customize_definition_id')
    );
    if (this.belongingCustomizeUsageDefinitionId) {
      this.belongingCustomizeUsageDefinitionId.reset();
      this.belongingCustomizeUsageDefinitionId.refresh();
    }
  }

  /**
   * 初期化 API を呼ぶ
   */
  protected async _fetchDataForInitialize(): Promise<void> {
    const res: any = await this.customizeRequestStatusListService.fetchIndexInitData();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this.updatable = res.updatable;
    this.deletable = res.deletable;
    this._updateFields(res.fields);
    this.fieldResources = res.fieldResources;
    this._datePickerInitialize();
  }

  /**
   * 指定項目を更新
   * @param fields 指定項目
   */
  protected _updateFields(fields: any): void {
    this.fields = fields;
    const opt: TableOptions = { columnStyles: [
        'width:10%', 'width:5%', 'width:5%'
        , 'width:5%', 'width:5%', 'width:5%'
        , 'width:5%', 'width:15%', 'width:5%'
        , 'width:20%', 'width:5%', 'width:5%', 'width:5%', 'width:5%'
      ]};
    this.thList = this._createThList(fields, opt);

    this.sortableThList = this.sortableThLists(this.thList);
    this._reflectXFields(fields);
  }

  /**
   * 初期検索前の処理
   * 依存するリソースを更新する
   */
  protected override async _beforeInitFetchList(): Promise<any> {
    if (this.exists('customize_usage_definition_id')) {
      await this.onCustomizeUsageDefinitionIdChange(
        _.get(this.resource, 'customize_usage_definition_id.values[0].value')
      );
    }
  }

  protected override _getSearchParams(params: any): CustomizeRequestStatusListIndexParams {
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
      'request_registration_date_from',
      today.clone().subtract(1, 'month').format(DateFormat.hyphen)
    );
    _.set(
      this.params,
      'request_registration_date_from_formatted',
      today
        .clone()
        .subtract(1, 'month')
        .format(this.datePickerService.inputDateFormat(this._dateFormat))
    );
    _.set(this.params, 'request_registration_date_to', today.format(DateFormat.hyphen));
    _.set(
      this.params,
      'request_registration_date_to_formatted',
      today.format(this.datePickerService.inputDateFormat(this._dateFormat))
    );
  }
}
