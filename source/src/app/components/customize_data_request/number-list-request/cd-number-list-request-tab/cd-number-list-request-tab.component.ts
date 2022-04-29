import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AbstractIndexComponent } from 'app/components/shared/abstract-component/abstract-index.component';
import { DateFormat, DateTimeFormat } from 'app/constants/date-format';
import { UserSettingService } from 'app/services/api/user-setting.service';
import { CdNumberListRequestTabService } from 'app/services/customize_data_request/number-list-request/cd-number-list-request-tab/cd-number-list-request-tab.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { DatePickerService } from 'app/services/shared/date-picker.service';
import { ModalService } from 'app/services/shared/modal.service';
import { MonthPickerService } from 'app/services/shared/month-picker.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { Fields } from 'app/types/common';
import * as _ from 'lodash';
import { Moment } from 'moment';

/**
 * 送信番号一覧要求タブ
 */
@Component({
  selector: 'app-cd-number-list-request-tab',
  templateUrl: './cd-number-list-request-tab.component.html',
  styleUrls: ['./cd-number-list-request-tab.component.scss']
})
export class CdNumberListRequestTabComponent extends AbstractIndexComponent implements OnInit {

  @ViewChild('cdNumberListRequestComfirmModalContent', { static: false }) cdNumberListRequestComfirmModalContent: TemplateRef<null>;

  // @Input() override labels: any;
  // @Input() override resource: any;
  @Input() override lists: any;
  @Input() override params: any;
  @Input() override thList: any;
  // @Input() override sortableThList: string[] = [];

  thListModal: any = [];

  initParams = {
    "definition_id_kind": "0",
    "definition_ids": [
      "1"
    ],
    "model_type_rev_serials": [
      "D85PX-15E0-A12345"
    ],
    "request_route_kind": "0",
    "datetime_from": "2020-02-29T00:00:00.000Z",
    "datetime_to": "2020-02-29T00:00:00.000Z",
    "car_data_amount_upper_limit": "1234567890"
  };

  request_period_kind: string = "1";
  listSelections: any = [];
  selectedListItems: any = [];
  fields: Fields;
  initResource: any;

  // sortingParams = {
  //   sort: '',
  //   sortLabel: '',
  // };

  monthlyParams: { year_month_from: Moment; year_month_to: Moment } = {
    year_month_from: this.datePickerService.toMoment(),
    year_month_to: this.datePickerService.toMoment(),
  };
  dailyParams: { date_from: Moment; date_to: Moment } = {
    date_from: this.datePickerService.toMoment(),
    date_to: this.datePickerService.toMoment(),
  };

  beginningWday: number;
  _dateFormat: string;
  timeZone: string;
  enableDateRange: string[];
  monthPickerFromDateRange: string[];
  monthPickerToDateRange: string[];
  datePickerFromDateRange: string[];
  datePickerToDateRange: string[];
  datePickerParams: any;

  @Output() changed: EventEmitter<any> = new EventEmitter();

  constructor(
    nav: NavigationService,
    title: Title,
    header: CommonHeaderService,
    router: Router,
    override modalService: ModalService,
    cdRef: ChangeDetectorRef,
    private cdNumberListRequestTabService: CdNumberListRequestTabService,
    protected userSettingService: UserSettingService,
    private datePickerService: DatePickerService,
    private monthPickerService: MonthPickerService,) {
    super(nav, title, router, cdRef, header);

  }

  protected async fetchList(sort_key?: string): Promise<any> {
    // throw new Error('Method not implemented.');
  }
  protected async _fetchDataForInitialize(): Promise<any> {
    const res = await this.cdNumberListRequestTabService.fetchCarInitData();
    this.initialize(res);
    this.params = _.cloneDeep(this.initParams);
    this.labels = res.label;
    this.initResource = res.resource;
    this.resource = _.cloneDeep(this.initResource);
    this._setTitle();
    this._afterInitialize();
    this._updateFields(res.fields);
    console.log("res", res);
  }

  protected async _afterInitialize(): Promise<any> {
    const datePickerConfig = this.userSettingService.getDatePickerConfig();
    this.beginningWday = datePickerConfig.first_day_of_week_kind;
    const _window = window as any;
    this.enableDateRange = _window.settings.datePickerRange.car;
    // this.enableDateRange = this.datePickerService.parseDateRange(_window.settings.datePickerRange.other);

    let dateFormat = datePickerConfig.date_format_code;
    this.timeZone = datePickerConfig.time_difference;

    this.listSelections = this.resource.request_number_definition_ids.values;
    this.datePickerParams = {
      timeZone: this.timeZone,
      dateFormat: dateFormat,
    };
    this.datePickerService.initialize(this.datePickerParams);
    this._datePickerInitialize();
    // this.lists.originList = ['columnName1', 'columnName2'];
    // this.lists.visibleList = this.lists.originList;
  }

  /**
   * 指定項目を更新
   * @param fields 指定項目
   */
  protected _updateFields(fields: any): void {
    this.fields = fields;
    this.thListModal = this._createThList(fields);
    this.sortableThList = this.sortableThLists(this.thListModal);
    this._reflectXFields(fields);
    console.log(this.thListModal);
  }

  placeholder: string = '';

  // ngOnInit(): void {
  //   this.listSelections = this.resource.request_number_definition_ids.values;
  //   this.placeholder = this.resource.request_number_definition_ids.placeholder_text;
  //   console.log('labels', this.labels);
  //   console.log('resource', this.resource);
  //   console.log('lists', this.lists);
  //   console.log('params', this.params);

  //   const _window = window as any;
  //   this.datePickerParams = {
  //     dateFormat: this.dateFormat,
  //     timeZone: this.timeZone,
  //   };
  //   this.datePickerService.initialize(this.datePickerParams);
  //   this.monthPickerService.initialize(this.datePickerParams);
  //   this.enableDateRange = this.datePickerService.parseDateRange(_window.settings.datePickerRange.other);

  //   this._datePickerInitialize();
  // }

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
      'send_number_list_request_datetime_from',
      today.clone().format(DateTimeFormat.slashDateTimeMilliseconds)
    );
    _.set(
      this.params,
      'send_number_list_request_datetime_from_formatted',
      today
        .clone().format(this.datePickerService.inputDateFormat(this._dateFormat))
    );
    _.set(this.params, 'send_number_list_request_datetime_to', today
      .add(23, 'hours')
      .add(59, 'minutes')
      .add(59, 'seconds')
      .add(999, 'milliseconds')
      .format(DateTimeFormat.slashDateTimeMilliseconds));
    _.set(
      this.params,
      'send_number_list_request_datetime_to_formatted',
      today
        .format(this.datePickerService.inputDateFormat(this._dateFormat))
    );
  }

  /**
   * 送信番号一覧要求確認 ボタン押下
   */
  openDialogNumberListRequestComfirm(): void {
    console.log("params", this.params);
    this.modalService.open(
      {
        title: this.labels.confirm_title,
        labels: this.labels,
        content: this.cdNumberListRequestComfirmModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          console.log("OK");
        },
      },
      {
        size: 'lg',
      }
    );
  }

}
