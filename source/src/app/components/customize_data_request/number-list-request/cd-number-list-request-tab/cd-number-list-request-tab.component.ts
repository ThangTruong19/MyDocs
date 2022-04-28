import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DateFormat, DateTimeFormat } from 'app/constants/date-format';
import { UserSettingService } from 'app/services/api/user-setting.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { DatePickerService } from 'app/services/shared/date-picker.service';
import { ModalService } from 'app/services/shared/modal.service';
import { MonthPickerService } from 'app/services/shared/month-picker.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import * as _ from 'lodash';
import { Moment } from 'moment';

@Component({
  selector: 'app-cd-number-list-request-tab',
  templateUrl: './cd-number-list-request-tab.component.html',
  styleUrls: ['./cd-number-list-request-tab.component.scss']
})
export class CdNumberListRequestTabComponent implements OnInit {

  @Input() labels: any;
  @Input() resource: any;
  @Input() lists: any;
  @Input() params: any;
  @Input() thList: any;
  @Input() sortableThList: string[] = [];

  request_period_kind: string = "1";
  listSelections: any = [];
  selectedListItems: any = [];

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
    console.log('params', this.params);

    const _window = window as any;
    this.datePickerParams = {
      dateFormat: this.dateFormat,
      timeZone: this.timeZone,
    };
    this.datePickerService.initialize(this.datePickerParams);
    this.monthPickerService.initialize(this.datePickerParams);
    this.enableDateRange = this.datePickerService.parseDateRange(_window.settings.datePickerRange.other);

    this._datePickerInitialize();
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
      'send_number_list_request_datetime_from',
      today.clone().format(DateTimeFormat.slashDateTimeMilliseconds)
    );
    _.set(
      this.params,
      'send_number_list_request_datetime_from_formatted',
      today
        .clone().format(this.datePickerService.inputDateFormat(this.dateFormat))
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
        .format(this.datePickerService.inputDateFormat(this.dateFormat))
    );
  }
}
