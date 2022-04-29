import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AbstractIndexComponent } from 'app/components/shared/abstract-component/abstract-index.component';
import { UserSettingService } from 'app/services/api/user-setting.service';
import { CustomizeSettingService } from 'app/services/customize_setting/customize-setting.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { DatePickerService } from 'app/services/shared/date-picker.service';
import { ModalService } from 'app/services/shared/modal.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { Fields, Resources } from 'app/types/common';
import * as _ from 'lodash';

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
  public inputParams = {
    regist_customize_usage_definition_version: '',
    edit_start_date_ymd: '',
    edit_end_date_ymd: '',
    regist_active_name: '',
    regist_priority_name: '',
    regist_customize_usage_definition_name: '',
    regist_customize_usage_definition_id: ''
};

  @ViewChild('customizeDefinitionVersion') customizeDefinitionVersion: ElementRef;
  @ViewChild('fromToDatePicker') fromToDatePicker: ElementRef;
  @ViewChild('requestType') requestType: ElementRef;
  @ViewChild('isEnabled') isEnabled: ElementRef;
  @ViewChild('priority') priority: ElementRef;

  // デートピッカー関連
  beginningWday : number;
  enableDateRange : string[];
  _dateFormat : string;
  timeZone : string;
  datePickerParams: Object;
  isDelete: boolean = false;

  // Table's header definition
  fields : Fields = [
    {
      "display_sequence_no": "1",
      "name": "カスタマイズ定義名",
      "path": "customize_definition.customize_definition_name",
      "control_code": "1",
      "display_code": "1"
    },
    {
      "display_sequence_no": "2",
      "name": "想定通信容量(byte/月)",
      "path": "customize_definition.assumption_data_value",
      "control_code": "1",
      "display_code": "1"
    },
    {
      "display_sequence_no": "3",
      "name": "カスタマイズ集計条件名",
      "path": "customize_definition.aggregation_condition_name",
      "control_code": "1",
      "display_code": "1"
    },
    {
      "display_sequence_no": "4",
      "name": "カスタマイズ送信条件名",
      "path": "customize_definition.send_condition_name",
      "control_code": "1",
      "display_code": "1"
  }];

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
  }

  /**
   * Fetching list data for the table in the screen
   */
  protected async fetchList(): Promise<any> {
    // Setting the request parameters before calling API
    this._searchParams.customize_usage_definition_id = this.inputParams.regist_customize_usage_definition_id;
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
    // TODO: Setting the default selected option for a combobox[優先度] = '低' (Still in Q&A)
    _.set(this.params,'regist_priority_name','low');
    this._initializeDatePicker();
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
  refreshCustomizeDefinitionVersion(data: any){
    if(!this.isInitialize){
      // Setting the request parameters before calling API
      this._searchParams.customize_usage_definition_version = data;
      // Call & fetch data from API
      this.fetchCustomizeSettingData();
    }
  }

  /**
   * Get list data from the API
   */
  async fetchCustomizeSettingData() : Promise<any>{
    this.thList = this._createThList(this.fields);
    this.thList.forEach(element => {
      element.formatKey = 'customize_definition.' + element.formatKey;
    });
    this._searchParams.car_id = this.carId;
    // Call & fetch data from API
    const res = await this.customSettingService.fetchCustomizeSettingList(
      this._searchParams,
      this.requestHeaderParams
    );
    // Format the acquired data to be displayed in the table
    const formatted = this._formatList(res.result_data.customize_definitions, this.thList);
    this._fillLists(res.result_header, formatted);
  }

  /**
   * Hide/Show 「開始日・終了日・有効/無効・優先度」based on the selected value of a combobox [要求種別]
   * @param The selected value of a combobox [要求種別] (更新/削除)
   */
  changeRequestType(data: any): void{
    if(data === 'update'){
      this.isDelete = false;
    }else{
      this.isDelete = true;
    }
  }
}