import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SelectTypeComponent } from 'app/components/shared/select-type/select-type.component';
import { DateFormat, DateTimeFormat } from 'app/constants/date-format';
import { UserSettingService } from 'app/services/api/user-setting.service';
import { CdRequestPeriodTabService } from 'app/services/customize_data_request/request-period/cd-request-period-tab/cd-request-period-tab.service';
import { CdRequestPeriodComfirmService } from 'app/services/customize_data_request/request-period/request-period-comfirm/cd-request-period-comfirm.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { DatePickerService } from 'app/services/shared/date-picker.service';
import { ModalService } from 'app/services/shared/modal.service';
import { MonthPickerService } from 'app/services/shared/month-picker.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import * as _ from 'lodash';
import { Moment } from 'moment';

@Component({
  selector: 'app-cd-request-period-tab',
  templateUrl: './cd-request-period-tab.component.html',
  styleUrls: ['./cd-request-period-tab.component.scss']
})
export class CdRequestPeriodTabComponent implements OnInit {

  @ViewChild('cdRequestPeriodComfirmModalContent', { static: false }) cdRequestPeriodComfirmModalContent: TemplateRef<null>;
  @ViewChild('cdCurrentRequestComfirmModalContent', { static: false }) cdCurrentRequestComfirmModalContent: TemplateRef<null>;
  @ViewChild('cdExpectedTrafficConfirmModalContent', { static: false }) cdExpectedTrafficConfirmModalContent: TemplateRef<null>;
  @ViewChild('cdRequestNumberComfirmModalContent', { static: false }) cdRequestNumberComfirmModalContent: TemplateRef<null>;

  @ViewChild('requestMumberDefinitionIdKind', { static: false }) requestMumberDefinitionIdKind: SelectTypeComponent;

  modalResource: any;
  @Input() labels: any;
  @Input() resource: any;
  @Input() lists: any;
  @Input() params: any;
  @Input() thList: any;
  @Input() sortableThList: string[] = [];

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

  initResource: any;
  // thList = [
  //   {
  //     label: '車両情報',
  //     name: 'columnName1',
  //     displayable: true,
  //   },
  // ];
  sortingParams = {
    sort: '',
    sortLabel: '',
  };

  monthlyParams: { year_month_from: Moment; year_month_to: Moment } = {
    year_month_from: this.datePickerService.toMoment(),
    year_month_to: this.datePickerService.toMoment(),
  };
  dailyParams: { date_from: Moment; date_to: Moment } = {
    date_from: this.datePickerService.toMoment(),
    date_to: this.datePickerService.toMoment(),
  };

  beginningWday: number;
  dateFormat: string;
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
    ref: ChangeDetectorRef,
    router: Router,
    private modalService: ModalService,
    private cdRef: ChangeDetectorRef,
    private cdRequestPeriodTabService: CdRequestPeriodTabService,
    private cdRequestPeriodComfirmService: CdRequestPeriodComfirmService,
    protected userSettingService: UserSettingService,
    private datePickerService: DatePickerService,
    private monthPickerService: MonthPickerService,) {

  }

  placeholder: string = '';

  ngOnInit(): void {
    this.listSelections = this.resource.request_number_definition_ids.values;
    this.placeholder = this.resource.request_number_definition_ids.placeholder_text;
    console.log('labels', this.labels);
    console.log('resource', this.resource);
    console.log('lists', this.lists);

    const _window = window as any;
    this.datePickerParams = {
      dateFormat: this.dateFormat,
      timeZone: this.timeZone,
    };
    this.datePickerService.initialize(this.datePickerParams);
    this.monthPickerService.initialize(this.datePickerParams);
    this.enableDateRange = this.datePickerService.parseDateRange(_window.settings.datePickerRange.other);

    // this._refreshMonthPickerDateRange();
    // this._refreshDatePickerDateRange();
    this._datePickerInitialize();

    // this.lists.originList = [{
    //   columnName1: 'PC200-8-1234',
    // }, {
    //   columnName1: 'PC200-8-1111',
    // }];
    // this.lists.visibleList = this.lists.originList;
  }

  onChangeItems(): void {
    this.changed.emit();
    console.log(this.listSelections);
  }

  /**
   * 日付選択時コールバック
   * @param day 選択済日付
   */
  onSelectDate(day: Moment) {
    console.log(day);
  }

  /**
   * 選択済みタグの x ボタン押下時の処理
   * @param id 選択済みタグに紐づけられた ID
   */
  onClickRemoveTag(value: number) {
    this.selectedListItems = this.selectedListItems.filter(
      (item: any) => item.value !== value
    );
    this.changed.emit();
  }

  /**
   * データ送信要求 ボタン押下
   */
  sendData(): void {
    console.log("params", this.params);
    this.modalService.open(
      {
        title: this.labels.confirm_title,
        labels: this.labels,
        content: this.cdRequestPeriodComfirmModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          console.log("OK");
          this.cdRequestPeriodComfirmService
            .ok(this.initParams)
            .then(res => {
              console.log("RES", res);
            });
        },
      },
      {
        size: 'lg',
      }
    );
  }

  /**
   * 現在カスタマイズ送信要求確認 ボタン押下
   */
  sendAppConfirm(): void {
    this.modalService.open(
      {
        title: this.labels.confirm_title,
        labels: this.labels,
        content: this.cdCurrentRequestComfirmModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          console.log("OK");
          this.cdRequestPeriodComfirmService
            .ok(this.initParams)
            .then(res => {
              console.log("RES", res);
            });
        },
      },
      {
        size: 'lg',
      }
    );
  }

  /**
   * 日付の文字列を取得
   * @param date 日付
   */
  getDateString(date: Moment) {
    console.log("getDateString", this.datePickerService.getInputText(
      date,
      this.datePickerService.inputDateFormat(this.dateFormat)
    ));
    return this.datePickerService.getInputText(
      date,
      this.datePickerService.inputDateFormat(this.dateFormat)
    );
  }

  /**
  * デートピッカー選択時のコールバック
  * @param path パス
  * @param date 選択された日
  */
  handleSelectDate(path: string, date: Moment) {
    console.log("date", date);
  }

  /**
   * 本日ボタンの活性・非活性を制御する
   * from の日付が to より未来を選択することを防止
   */
  toggleTodayButton(): boolean {
    return !this.datePickerService.isToday(this.dailyParams.date_to);
  }

  /**
   * 日付の選択範囲を初期化する
   */
  private _refreshMonthPickerDateRange() {
    const initialYearMonth = this._getInitialYearMonth();
    const enableDateRange = _.cloneDeep(this.enableDateRange);

    if (
      this.monthPickerFromDateRange == null &&
      this.monthPickerToDateRange == null
    ) {
      this.monthPickerFromDateRange = [
        enableDateRange[0],
        initialYearMonth.year_month_to.format(DateFormat.params),
      ];
      this.monthPickerToDateRange = [
        initialYearMonth.year_month_from.format(DateFormat.params),
        enableDateRange[1],
      ];
    } else {
      this.monthPickerFromDateRange[0] = enableDateRange[0];
      this.monthPickerFromDateRange[1] = initialYearMonth.year_month_to.format(
        DateFormat.params
      );
      this.monthPickerToDateRange[0] = initialYearMonth.year_month_from.format(
        DateFormat.params
      );
      this.monthPickerToDateRange[1] = this.datePickerService
        .toMoment()
        .format(DateFormat.params);
    }
  }

  /**
   * 日付の選択範囲を初期化する
   */
  private _refreshDatePickerDateRange() {
    const initialDate = this._getInitialDate();
    const enableDateRange = _.cloneDeep(this.enableDateRange);

    if (
      this.datePickerFromDateRange == null &&
      this.datePickerToDateRange == null
    ) {
      this.datePickerFromDateRange = [
        enableDateRange[0],
        initialDate.date_to.format(DateFormat.params),
      ];
      this.datePickerToDateRange = [
        initialDate.date_from.format(DateFormat.params),
        enableDateRange[1],
      ];
    } else {
      this.datePickerFromDateRange[0] = enableDateRange[0];
      this.datePickerFromDateRange[1] = initialDate.date_to.format(
        DateFormat.params
      );
      this.datePickerToDateRange[0] = initialDate.date_from.format(
        DateFormat.params
      );
      this.datePickerToDateRange[1] = this.datePickerService
        .toMoment()
        .format(DateFormat.params);
    }
    console.log("this.datePickerFromDateRange", this.datePickerFromDateRange);
  }

  /**
  * 初期表示時の年月を取得する
  */
  private _getInitialYearMonth() {
    return {
      year_month_from: this.datePickerService
        .toMoment()
        .set({ date: 1 })
        .subtract(1, 'year'),
      year_month_to: this.datePickerService
        .toMoment()
        .set({ date: 1 })
        .subtract(1, 'month'),
    };
  }

  /**
   * 初期表示時の年月日を取得する
   */
  private _getInitialDate() {
    return {
      date_from: this.datePickerService.toMoment().subtract(1, 'month'),
      date_to: this.datePickerService.toMoment().subtract(1, 'day'),
    };
  }

  /**
   * デートピッカーの初期化
   */
  private async _datePickerInitialize(): Promise<any> {
    const datePickerConfig = this.userSettingService.getDatePickerConfig();
    this.beginningWday = datePickerConfig.first_day_of_week_kind;
    const _window = window as any;
    this.enableDateRange = _window.settings.datePickerRange.other;
    this.dateFormat = datePickerConfig.date_format_code;
    this.timeZone = datePickerConfig.time_difference;

    this.datePickerParams = {
      timeZone: this.timeZone,
      dateFormat: this.dateFormat,
    };

    this.datePickerService.initialize(this.datePickerParams);

    const today = this.datePickerService.toMoment();

    _.set(
      this.params,
      'request_number_datetime_from',
      today.clone().format(DateTimeFormat.slashDateTimeMilliseconds)
    );
    _.set(
      this.params,
      'request_number_datetime_from_formatted',
      today
        .clone().format(this.datePickerService.inputDateFormat(this.dateFormat))
    );
    _.set(this.params, 'request_number_datetime_to', today
      .add(23, 'hours')
      .add(59, 'minutes')
      .add(59, 'seconds')
      .add(999, 'milliseconds')
      .format(DateTimeFormat.slashDateTimeMilliseconds));
    _.set(
      this.params,
      'request_number_datetime_to_formatted',
      today
        .format(this.datePickerService.inputDateFormat(this.dateFormat))
    );
  }

  expectedTrafficConfirm(): void {
    this.modalService.open(
      {
        title: this.labels.expected_traffic_confirm_title,
        labels: this.labels,
        content: this.cdExpectedTrafficConfirmModalContent,
        closeBtnLabel: this.labels.close
      },
      {
        size: 'lg',
      }
    );
  }

  testRowspan(): void {
    this.modalService.open(
      {
        title: this.labels.confirm_title,
        labels: this.labels,
        content: this.cdRequestNumberComfirmModalContent,
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

  /**
   * 要求種別変更時コールバック
   */
  onChangeRequestNumber(): void {
    const params = this.requestMumberDefinitionIdKind.getSelectedParam();
    console.log("params", params);
  }
}
