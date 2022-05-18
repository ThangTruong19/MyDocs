import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AbstractIndexComponent } from 'app/components/shared/abstract-component/abstract-index.component';
import { DateFormat } from 'app/constants/date-format';
import { UserSettingService } from 'app/services/api/user-setting.service';
import { CustomizeSettingService } from 'app/services/customize_setting/customize-setting.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { DatePickerService } from 'app/services/shared/date-picker.service';
import { ModalService } from 'app/services/shared/modal.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { Resources, TableHeader } from 'app/types/common';
import * as _ from 'lodash';

// モーダルからの返却値
interface CustomizeUsageDefinitionResponseData {
  customize_usage_definition_id?: string;
  customize_usage_definition_name?: string;
  customize_usage_definition_version?: number;
  start_date?: string;
  end_date?: string;
  edit_mode?: string;
  customize_definitions?: CustomizeDefinitionResponseData[]
}
interface CustomizeDefinitionResponseData {
  customize_definition_id?: string;
  customize_definition_name?: string;
  assumption_data_value?: number;
  priority?: string;
  priority_name?: string;
  active_kind?: string;
  active_name?: string;
  latest_operation_code?: string;
  latest_operation_code_name?: string;
  status?: string;
  status_name?: string;
  start_date?: string;
  end_date?: string;
  first_receive_datetime?: string;
  latest_receive_datetime?: string;
  aggregation_condition_id?: string;
  aggregation_condition_name?: string;
  send_condition_id?: string;
  send_condition_name?: string;
  customize_access_level?: string;
  customize_access_level_name?: string;
}

/**
 * カスタマイズ設定変更
 */
@Component({
  selector: 'app-cs-edit',
  templateUrl: './cs-edit.component.html',
  styleUrls: ['./cs-edit.component.scss']
})
export class CsEditComponent extends AbstractIndexComponent implements OnInit {
  @Input()
  public carId: string;
  @Input()
  public resources: Resources;
  @Input()
  public initThList: TableHeader[];
  @Input()
  public inputParams = {
    edit_customize_usage_definition_version: '',
    edit_start_date: '',
    edit_end_date: '',
    edit_active_name: '',
    edit_priority_name: '',
    edit_customize_usage_definition_name: '',
    edit_customize_usage_definition_id: ''
  };

  private apiResult: any;
  public modalResponse: CustomizeUsageDefinitionResponseData;

  @ViewChild('customizeDefinitionVersion') customizeDefinitionVersion: ElementRef;
  @ViewChild('fromToDatePicker') fromToDatePicker: ElementRef;
  @ViewChild('requestType') requestType: ElementRef;
  @ViewChild('isEnabled') isEnabled: ElementRef;
  @ViewChild('priority') priority: ElementRef;

  // デートピッカー関連
  beginningWday: number;
  enableDateRange: string[];
  _dateFormat: string;
  timeZone: string;
  datePickerParams: Object;
  isDelete: boolean = false;

  _searchParams = {
    car_id: "",
    customize_usage_definition_id: "",
    customize_usage_definition_version: ""
  };
  isInitialize: boolean = true;

  constructor(
    nav: NavigationService,
    title: Title,
    header: CommonHeaderService,
    router: Router,
    private modal: ModalService,
    private cdRef: ChangeDetectorRef,
    private customSettingService: CustomizeSettingService,
    protected userSettingService: UserSettingService,
    protected datePickerService: DatePickerService,
  ) {
    super(nav, title, router, cdRef, header, modal);
    this.shouldDestroyNavigation = false;
  }

  /**
   * Fetching list data for the table in the screen
   */
  protected async fetchList(): Promise<any> {
    // Setting the request parameters before calling API
    this._searchParams.customize_usage_definition_id = this.inputParams.edit_customize_usage_definition_id;
    this._searchParams.customize_usage_definition_version = (this.customizeDefinitionVersion as any).itemParams.regist_customize_usage_definition_version;
    // Call & fetch data from API
    this.fetchCustomizeSettingData();
    this.isInitialize = false;
  }

  /**
   * Fetching labels, resources to be displayed in the screen
   */
  protected async _fetchDataForInitialize(): Promise<any> {
    this.labels = this.resources.label;
    this.resource = this.resources.resource;
    this.params = _.clone(this.inputParams);
    this.initialize(this.resources);

    if (this.resource.edit_priority_control_flg.values[0].value) {
      _.set(this.params, 'edit_priority_name', 'high');
    } else {
      _.set(this.params, 'edit_priority_name', 'low');
    }
    this._initializeDatePicker();

    this.thList = this.initThList;

    // FORMAT TABLE
    this.thList.forEach((element: TableHeader) => {
      switch (element.name) {
        case "customize_usage_definitions.customize_usage_definition.customize_definitions.customize_definition_name":
          element.columnStyle = "width:25%"
          break;
        case "customize_usage_definitions.customize_usage_definition.customize_definitions.assumption_data_value":
          element.columnStyle = "width:25%"
          break;
        case "customize_usage_definitions.customize_usage_definition.customize_definitions.aggregation_condition_name":
          element.columnStyle = "width:25%"
          break;
        case "customize_usage_definitions.customize_usage_definition.customize_definitions.send_condition_name":
          element.columnStyle = "width:25%"
          break;
      }
    })

    this.sortableThList = this.sortableThLists(this.thList);
  }

  /**
   * デートピッカーを初期化する
   */
  private _initializeDatePicker(): void {
    const datePickerConfig = this.userSettingService.getDatePickerConfig();
    this.beginningWday = datePickerConfig.first_day_of_week_kind;
    const _window = window as any;
    this.enableDateRange = _window.settings.datePickerRange.other;
    this._dateFormat = datePickerConfig.date_format_code;
    this.timeZone = datePickerConfig.time_difference;

    let datePickerParams = {
      timeZone: this.timeZone,
      dateFormat: this._dateFormat,
    };
    this.datePickerService.initialize(datePickerParams);
  }

  /**
   * Refresh table's data in case the dropdown [バージョン] changes its value
   * @param data New selected option of the dropdown
   */
  refreshCustomizeDefinitionVersion(data: any) {
    if (!this.isInitialize) {
      // Setting the request parameters before calling API
      this._searchParams.customize_usage_definition_version = data;
      // Call & fetch data from API
      this.fetchCustomizeSettingData();
    }
  }

  /**
   * Get list data from the API
   */
  async fetchCustomizeSettingData(): Promise<any> {
    this._searchParams.car_id = this.carId;
    // Call & fetch data from API
    this.apiResult = await this.customSettingService.fetchCustomizeSettingList(
      this._searchParams,
      this.requestHeaderParams
    );
    // Format the acquired data to be displayed in the table
    let contents = (this.apiResult.result_data.customize_definitions as any[]).map((cur: any) => {
      return {
        customize_usage_definition: {
          customize_definitions: {
            customize_definition_name: cur.customize_definition.customize_definition_name,
            assumption_data_value: cur.customize_definition.assumption_data_value,
            aggregation_condition_name: cur.customize_definition.aggregation_condition_name,
            send_condition_name: cur.customize_definition.send_condition_name,
          }
        }
      }
    })

    const formatted = this._formatList(contents, this.thList);
    this._fillLists(this.apiResult.result_header, formatted);
  }

  /**
   * Hide/Show 「開始日・終了日・有効/無効・優先度」based on the selected value of a combobox [要求種別]
   * @param The selected value of a combobox [要求種別] (更新/削除)
   */
  changeRequestType(data: any): void {
    if (data === 'update') {
      this.isDelete = false;
    } else {
      this.isDelete = true;
    }
  }

  /**
   * Closing dialog callback function
   */
  public closeEditDialog(): void {
    this.modalResponse = {
      customize_usage_definition_id: '',
      customize_usage_definition_name: this.params.edit_customize_usage_definition_name,
      customize_usage_definition_version: this.params.edit_customize_usage_definition_version,
      start_date: this.datePickerService.convertDateString(this.params.edit_start_date, DateFormat.hyphen, DateFormat.slash),
      end_date: this.datePickerService.convertDateString(this.params.edit_end_date, DateFormat.hyphen, DateFormat.slash),
      edit_mode: this.params.edit_customize_edit_kind,
      customize_definitions: this._formatListData(this.apiResult.result_data.customize_definitions)
    }
  }

  /**
   * Format list data to be displayed in the caller screen
   * @param List data to be formatted
   * @returns The formatted list data
   */
  private _formatListData(list: any[]): any[] {
    let resultLst: any[] = [];
    list.forEach(element => {
      resultLst.push({
        customize_definition_id: element.customize_definition.customize_definition_id,
        customize_definition_name: element.customize_definition.customize_definition_name,
        assumption_data_value: element.customize_definition.assumption_data_value,
        active_kind: this.params.edit_active_name,
        active_name: (this.isEnabled as any).items.filter((element: { id: any; }) => element.id == this.params.edit_active_name)[0].name,
        latest_operation_code: element.customize_definition.latest_operation_code,
        latest_operation_code_name: "-",
        status: element.customize_definition.status,
        status_name: element.customize_definition.status_name,
        start_date: element.customize_definition.start_date,
        end_date: element.customize_definition.end_date,
        first_receive_datetime: element.customize_definition.first_receive_datetime,
        latest_receive_datetime: element.customize_definition.last_receive_datetime,
        aggregation_condition_id: element.customize_definition.aggregation_condition_id,
        aggregation_condition_name: element.customize_definition.aggregation_condition_name,
        send_condition_id: element.customize_definition.send_condition_id,
        send_condition_name: element.customize_definition.send_condition_name,
        customize_access_level: element.customize_definition.customize_access_level,
        customize_access_level_name: element.customize_definition.customize_access_level_name,
        priority: (this.priority as any).items.filter((element: { id: any; }) => element.id == this.params.edit_priority_name)[0].id,
        priority_name: (this.priority as any).items.filter((element: { id: any; }) => element.id == this.params.edit_priority_name)[0].name,
      })
    });
    return resultLst;
  }
}