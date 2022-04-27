import { ChangeDetectorRef, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Component } from '@angular/core';
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
import { Fields, Resources } from 'app/types/common';
import * as _ from 'lodash';

@Component({
  selector: 'app-cs-new',
  templateUrl: './cs-new.component.html',
  styleUrls: ['./cs-new.component.scss']
})
export class CsNewComponent extends AbstractIndexComponent implements OnInit{
  @Input()
  public carId: string;
  @Input()
  public resources: Resources;

  @ViewChild('customizeDefinitionName') customizeDefinitionName: ElementRef;
  @ViewChild('customizeDefinitionVersion') customizeDefinitionVersion: ElementRef;
  @ViewChild('fromToDatePicker') fromToDatePicker: ElementRef;
  @ViewChild('isEnabled') isEnabled: ElementRef;
  @ViewChild('priority') priority: ElementRef;

  // デートピッカー関連
  beginningWday : number;
  enableDateRange : string[];
  _dateFormat : string;
  timeZone : string;
  datePickerParams: Object;

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

  protected async fetchList(): Promise<any> {
    this._searchParams.customize_usage_definition_id = (this.customizeDefinitionName as any).itemParams.regist_customize_usage_definition_name;
    this._searchParams.customize_usage_definition_version = (this.customizeDefinitionVersion as any).itemParams.regist_customize_usage_definition_version;
    this.fetchCustomizeSettingData();
    this.isInitialize = false;
  }

  protected async _fetchDataForInitialize(): Promise<any> {
    this.labels = this.resources.label;
    this.resource = this.resources.resource;
    this.initialize(this.resources);
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

    _.set(
      this.params,
      'customize_setting.edit_start_date_ymd',
      this.datePickerService.toMoment().format(
        DateFormat.hyphen
      ));
    _.set(
      this.params,
      'customize_setting.edit_end_date_ymd',
      this.datePickerService.toMoment().add(1, 'month').format(
        DateFormat.hyphen
      ));

    const today = this.datePickerService.toMoment();

    _.set(
      this.params,
      'customize_setting.date_from_formatted',
      today
        .clone()
        .subtract(1, 'month')
        .format(this.datePickerService.inputDateFormat(this._dateFormat))
    );
    _.set(this.params, 'date_to', today.format(DateFormat.hyphen));
    _.set(
      this.params,
      'customize_setting.date_to_formatted',
      today.format(this.datePickerService.inputDateFormat(this._dateFormat))
    );
  }

  refreshCustomizeDefinitionName(data: any){
    if(!this.isInitialize){
      this._searchParams.customize_usage_definition_id = data;
      this.fetchCustomizeSettingData();
    }
  }

  refreshCustomizeDefinitionVersion(data: any){
    if(!this.isInitialize){
      this._searchParams.customize_usage_definition_version = data;
      this.fetchCustomizeSettingData();
    }
  }

  async fetchCustomizeSettingData() : Promise<any>{
    this.thList = this._createThList(this.fields);
    this.thList.forEach(element => {
      element.formatKey = 'customize_definition.' + element.formatKey;
    });
    this._searchParams.car_id = this.carId;
    const res = await this.customSettingService.fetchCustomizeSettingList(
      this._searchParams,
      this.requestHeaderParams
    );
    const formatted = this._formatList(res.result_data.customize_definitions, this.thList);
    this._fillLists(res.result_header, formatted);
  }
}
