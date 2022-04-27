import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';

import {
  GraphMode,
  GraphType,
} from '../../../../../constants/flm/site-management';
import { Moment } from '../../../../../types/calendar';

import {
  DateFormat,
  YearMonthFormat,
} from '../../../../../constants/date-format';

import { KbaDatePickerComponent } from '../../../../shared/kba-date-picker/kba-date-picker.component';

import { KbaDatePickerService } from '../../../../../services/shared/kba-date-picker.service';
import { KbaMonthPickerService } from '../../../../../services/shared/kba-month-picker.service';
import { UserSettingService } from '../../../../../services/api/user-setting.service';

@Component({
  selector: 'app-stat-header',
  templateUrl: './stat-header.component.html',
  styleUrls: ['./stat-header.component.scss'],
})
export class StatHeaderComponent implements OnInit {
  @ViewChild('datePickerFrom', { static: false })
  datePickerFrom: KbaDatePickerComponent;
  @ViewChild('datePickerTo', { static: false })
  datePickerTo: KbaDatePickerComponent;
  @Input() labels;
  @Input() datePickerLabels;
  @Input() resource;
  @Input() graphMode;
  @Input() graphType;

  @Output() graphModeChange: EventEmitter<GraphMode> = new EventEmitter();
  @Output() graphTypeChange: EventEmitter<GraphType> = new EventEmitter();
  @Output() yearMonthChange: EventEmitter<{
    year_month_from: string;
    year_month_to: string;
  }> = new EventEmitter();
  @Output() dateChange: EventEmitter<{
    date_from: string;
    date_to: string;
  }> = new EventEmitter();

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

  GraphMode = GraphMode;
  GraphType = GraphType;

  constructor(
    private monthPickerService: KbaMonthPickerService,
    private datePickerService: KbaDatePickerService,
    private userSettingService: UserSettingService
  ) { }

  async ngOnInit() {
    await this._initializeDatePicker();
    this.monthlyParams = this._getInitialYearMonth();
    this.dailyParams = this._getInitialDate();
    if (this.graphMode === GraphMode.monthly) {
      this._emitYearMonthChangeEvent();
    } else {
      this._emitDateChangeEvent();
    }
  }

  /**
   * 年月の文字列を取得
   * @param monthYear 年月
   */
  getMonthYearString(monthYear: Moment) {
    return this.monthPickerService.getInputText(
      monthYear,
      this.monthPickerService.inputDateFormat(this.dateFormat)
    );
  }

  /**
   * 日付の文字列を取得
   * @param date 日付
   */
  getDateString(date: Moment) {
    return this.datePickerService.getInputText(
      date,
      this.datePickerService.inputDateFormat(this.dateFormat)
    );
  }

  /**
   * 年月の文字列を取得
   * @param monthYear 年月
   */
  getMonthYearStringDisplay(monthYear: Moment) {
    return monthYear.format(this.monthPickerService.getCurrentDateFormat());
  }

  /**
   * 日付の文字列を取得
   * @param date 日付
   */
  getDateStringDisplay(date: Moment) {
    return date.format(this.datePickerService.getCurrentDateFormat());
  }

  /**
   * 月次・日次の切り替え
   * @param graphMode 選択肢
   */
  handleSelectGraphMode(graphMode: string) {
    this.graphMode = graphMode;
    this.graphModeChange.emit(graphMode);

    if (graphMode === GraphMode.monthly) {
      this._resetMonthPicker();
    } else {
      this._resetDatePicker();
    }
  }

  /**
   * 月次・日次の有効状態を取得
   * @param graphMode 選択肢
   */
  isGraphActive(graphMode: string) {
    return graphMode === this.graphMode;
  }

  /**
   * グラフ形式の切り替え
   * @param type グラフ形式
   */
  handleSelectGraphType(graphType: string) {
    this.graphType = graphType;
    this.graphTypeChange.emit(graphType);
  }

  /**
   * グラフ形式の有効状態を取得
   * @param type グラフ形式
   */
  isGraphTypeActive(graphType: string) {
    return graphType === this.graphType;
  }

  /**
   * マンスピッカー選択時のコールバック
   * @param path パス
   * @param month 選択された月
   */
  handleSelectMonth(path: string, month: Moment) {
    this.monthlyParams[path] = month;

    const tempMonth = moment(month, DateFormat.params);
    switch (path) {
      case 'year_month_from':
        this.monthlyParams.year_month_to = moment.min(
          this.monthlyParams.year_month_to,
          tempMonth.add(1, 'year').subtract(1, 'month')
        );
        break;

      case 'year_month_to':
        this.monthlyParams.year_month_from = moment.max(
          this.monthlyParams.year_month_from,
          tempMonth.subtract(1, 'year').add(1, 'month')
        );
        break;
    }

    this.monthPickerToDateRange[0] = this.monthlyParams.year_month_from.format(
      DateFormat.params
    );
    this.monthPickerFromDateRange[1] = this.monthlyParams.year_month_to.format(
      DateFormat.params
    );

    this._emitYearMonthChangeEvent();
  }

  /**
   * デートピッカー選択時のコールバック
   * @param path パス
   * @param date 選択された日
   */
  handleSelectDate(path: string, date: Moment) {
    this.dailyParams[path] = date;
    const tempDate = moment(date, DateFormat.params);
    this.datePickerFrom.updateYearsListFrom(tempDate);
    this.datePickerTo.updateYearsListTo(tempDate);
    switch (path) {
      case 'date_from':
        this.dailyParams.date_to = moment.min(
          this.dailyParams.date_to,
          tempDate.add(1, 'month').subtract(1, 'day')
        );
        break;

      case 'date_to':
        this.dailyParams.date_from = moment.max(
          this.dailyParams.date_from,
          tempDate.subtract(1, 'month').add(1, 'day')
        );
        break;
    }

    this.datePickerToDateRange[0] = this.dailyParams.date_from.format(
      DateFormat.params
    );
    this.datePickerFromDateRange[1] = this.dailyParams.date_to.format(
      DateFormat.params
    );

    this._emitDateChangeEvent();
  }

  /**
   * 先月まで / 昨日までボタン押下時のコールバック
   */
  handleClickResetDatePicker() {
    if (this.graphMode === GraphMode.monthly) {
      this._resetMonthPicker();
    } else {
      this._resetDatePicker();
    }
  }

  /**
   * 前月 / 前日ボタン押下時のコールバック
   */
  handleClickShiftBack() {
    if (this.graphMode === GraphMode.monthly) {
      this.monthlyParams.year_month_from = moment(
        this.monthlyParams.year_month_from
      ).subtract(1, 'month');
      this.monthlyParams.year_month_to = moment(
        this.monthlyParams.year_month_to
      ).subtract(1, 'month');
      this.monthPickerToDateRange[0] = this.monthlyParams.year_month_from.format(
        DateFormat.params
      );
      this.monthPickerFromDateRange[1] = this.monthlyParams.year_month_to.format(
        DateFormat.params
      );
      this._emitYearMonthChangeEvent();
    } else {
      this.dailyParams.date_from = moment(this.dailyParams.date_from).subtract(
        1,
        'day'
      );
      this.dailyParams.date_to = moment(this.dailyParams.date_to).subtract(
        1,
        'day'
      );
      this.datePickerToDateRange[0] = this.dailyParams.date_from.format(
        DateFormat.params
      );
      this.datePickerFromDateRange[1] = this.dailyParams.date_to.format(
        DateFormat.params
      );
      this._emitDateChangeEvent();
    }
  }

  /**
   * 翌月 / 翌日ボタン押下時のコールバック
   */
  handleClickShiftNext() {
    if (this.graphMode === GraphMode.monthly) {
      this.monthlyParams.year_month_from = moment(
        this.monthlyParams.year_month_from
      ).add(1, 'month');
      this.monthlyParams.year_month_to = moment(
        this.monthlyParams.year_month_to
      ).add(1, 'month');
      this.monthPickerToDateRange[0] = this.monthlyParams.year_month_from.format(
        DateFormat.params
      );
      this.monthPickerFromDateRange[1] = this.monthlyParams.year_month_to.format(
        DateFormat.params
      );
      this._emitYearMonthChangeEvent();
    } else {
      this.dailyParams.date_from = moment(this.dailyParams.date_from).add(
        1,
        'day'
      );
      this.dailyParams.date_to = moment(this.dailyParams.date_to).add(1, 'day');
      this.datePickerToDateRange[0] = this.dailyParams.date_from.format(
        DateFormat.params
      );
      this.datePickerFromDateRange[1] = this.dailyParams.date_to.format(
        DateFormat.params
      );
      this._emitDateChangeEvent();
    }
  }

  /**
   * 前月 / 前日ボタンが無効であるかを判定する
   */
  isShiftBackButtonDisabled() {
    if (this.graphMode === GraphMode.monthly) {
      return (
        this.monthlyParams.year_month_from <=
        moment(this.enableDateRange[0], DateFormat.params)
      );
    } else {
      return (
        this.dailyParams.date_from <=
        moment(this.enableDateRange[0], DateFormat.params)
      );
    }
  }

  /**
   * 翌月 / 翌日ボタンが無効であるかを判定する
   */
  isShiftNextButtonDisabled() {
    if (this.graphMode === GraphMode.monthly) {
      return (
        this.monthlyParams.year_month_to >=
        this.datePickerService.toMoment().set({ date: 1 })
      );
    } else {
      return this.dailyParams.date_to >= this.datePickerService.toMoment();
    }
  }

  /**
   * デートピッカーを表示するか
   */
  isDatePickerSectionVisible() {
    if (this.graphMode === GraphMode.monthly) {
      return !!(
        this.resource &&
        this.resource.year_month_from &&
        this.resource.year_month_to
      );
    } else {
      return !!(
        this.resource &&
        this.resource.date_from &&
        this.resource.date_to
      );
    }
  }

  /**
   * 本日ボタンの活性・非活性を制御する
   * from の日付が to より未来を選択することを防止
   */
  toggleTodayButton(): boolean {
    return !this.datePickerService.isToday(this.dailyParams.date_to);
  }

  /**
   * デートピッカーを初期化する
   */
  private async _initializeDatePicker() {
    const datePickerConfig = this.userSettingService.getDatePickerConfig();
    this.beginningWday = datePickerConfig.first_day_of_week_kind;
    this.dateFormat = datePickerConfig.date_format_code;
    this.timeZone = datePickerConfig.time_difference;
    const _window = window as any;
    this.datePickerParams = {
      dateFormat: this.dateFormat,
      timeZone: this.timeZone,
    };
    this.datePickerService.initialize(this.datePickerParams);
    this.monthPickerService.initialize(this.datePickerParams);
    this.enableDateRange = this.datePickerService.parseDateRange(_window.settings.datePickerRange.other);

    this._refreshMonthPickerDateRange();
    this._refreshDatePickerDateRange();
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
  }

  /**
   * マンスピッカーの変更イベントを発火させる
   */
  private _emitYearMonthChangeEvent() {
    this.yearMonthChange.emit(
      _.mapValues(this.monthlyParams, (yearMonth: Moment) =>
        yearMonth.format(YearMonthFormat.hyphen)
      )
    );
  }

  /**
   * デートピッカーの変更イベントを発火させる
   */
  private _emitDateChangeEvent() {
    this.dateChange.emit(
      _.mapValues(this.dailyParams, (date: Moment) =>
        date.format(DateFormat.hyphen)
      )
    );
  }

  /**
   * マンスピッカーを初期化する
   */
  private _resetMonthPicker() {
    this.monthlyParams = this._getInitialYearMonth();
    this._refreshMonthPickerDateRange();
    this._emitYearMonthChangeEvent();
  }

  /**
   * デートピッカーを初期化する
   */
  private _resetDatePicker() {
    this.dailyParams = this._getInitialDate();
    this._refreshDatePickerDateRange();
    this._emitDateChangeEvent();
  }
}
