import * as moment from 'moment';
import * as _ from 'lodash';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import {
  CommonDatePickerDay,
  DatePickerLabels,
  OnClickDayValues,
  DatePickerTitle,
  MonthLabels,
} from '../../../vendor/k-common-module/interfaces';

import { DatePickerParams } from '../../../types/calendar';

import { DateFormat } from '../../../constants/date-format';

import { KbaDatePickerService } from '../../../services/shared/kba-date-picker.service';

type Moment = moment.Moment;

@Component({
  selector: 'app-kba-date-picker',
  templateUrl: './kba-date-picker.component.html',
  styleUrls: ['./kba-date-picker.component.scss'],
  providers: [KbaDatePickerService],
})
export class KbaDatePickerComponent implements OnInit {
  @Input()
  id: string;
  @Input()
  labels;
  @Input()
  dateFormat: string;
  @Input()
  enableDateRange: string[];
  @Input()
  futureDateSelectable = false;
  @Input()
  timeZone: string;
  @Input()
  beginningWday: number;
  @Input()
  initialBaseDay: string;
  @Input()
  isVisibleClearButton = true;
  @Input()
  disableTodayButton = false;
  @Output()
  selectDate = new EventEmitter<Moment>();

  days: CommonDatePickerDay[][];
  title: DatePickerTitle = {
    year: null,
    month: null,
  };
  years: number[];
  datePickerLabels: DatePickerLabels;
  datePickerWeekLabels: string[];
  params: DatePickerParams;
  monthLabels: MonthLabels;

  get todayDisabled() {
    return this.datePickerService.isDisabled(
      moment(
        this.datePickerService.today.format(DateFormat.params),
        DateFormat.params
      )
    );
  }

  constructor(private datePickerService: KbaDatePickerService) {
    // noop
  }

  ngOnInit() {
    const parsedDateRange = this.datePickerService.parseDateRange(
      this.enableDateRange
    );
    this.enableDateRange[0] = parsedDateRange[0];
    this.enableDateRange[1] = parsedDateRange[1];

    this.params = {
      timeZone: this.timeZone,
      dateFormat: this.dateFormat,
      beginningWday: this.beginningWday,
      enableDateRange: this.enableDateRange,
    };
    this.datePickerService.initialize(this.params);
    this.datePickerWeekLabels = this._sortWeekLabels(this._getWeekLabels());

    this.datePickerLabels = {
      todayButton: this.labels._common.today,
      closeButton: this.labels._common.close,
      clearButton: this.labels._common.clear,
      title: '',
    };

    this.years = _.range(
      moment(this.enableDateRange[0], DateFormat.params).year(),
      moment(this.enableDateRange[1], DateFormat.params).year() + 1
    );

    this.monthLabels = this.datePickerService.getMonthLabels(this.labels);
    // 未来日選択不可の場合は選択可能範囲の終端に今日日付を設定
    this.enableDateRange[1] = this.futureDateSelectable
      ? this.enableDateRange[1]
      : this.datePickerService.today.format(DateFormat.params);
  }

  /**
   * 「次の月へ」ボタン活性・非活性制御
   */
  isDisabledNextMonthButton(): boolean {
    if (_.isEmpty(this.datePickerService.baseDay)) {
      return false;
    }

    return this.datePickerService.baseDay.isSameOrAfter(
      this.datePickerService.toMoment(this.enableDateRange[1]),
      'month'
    );
  }

  /**
   * 「前の月へ」ボタン活性・非活性制御
   */
  idDisabledPrevMonthButton() {
    if (_.isEmpty(this.datePickerService.baseDay)) {
      return false;
    }

    return this.datePickerService.baseDay.isSameOrBefore(
      this.datePickerService.toMoment(this.enableDateRange[0]),
      'month'
    );
  }

  /**
   * 日付選択時のコールバック
   * @param OnClickDayValues { ev: MouseEvent, day: CommonDatePickerDay }
   */
  onClickDay({ ev, day }: OnClickDayValues) {
    ev.preventDefault();
    this.selectDate.emit(this.datePickerService.toMoment(day.YYYYMMDD));
  }

  /**
   * カレンダーが開かれた際のコールバック
   */
  onOpened() {
    this.datePickerService.initialBaseDay = this.initialBaseDay;
    this.datePickerService.baseDay = (this.initialBaseDay
      ? this.datePickerService.toMoment(this.initialBaseDay)
      : moment().set({ hours: 0, minutes: 0, seconds: 0 })
    ).startOf('month');
    this._initCalendar();
  }

  /**
   * 「前の月へ」ボタン押下時のコールバック
   */
  onClickPrev() {
    this.datePickerService.baseDay.subtract(1, 'months');
    this._initCalendar();
  }

  /**
   * 「次の月へ」ボタン押下時のコールバック
   */
  onClickNext() {
    this.datePickerService.baseDay.add(1, 'months');
    this._initCalendar();
  }

  /**
   * 「閉じる」ボタン押下時のコールバック
   */
  onClickClose() {
    // noop
  }

  /**
   * 「本日」ボタン押下時のコールバック
   */
  onClickToday() {
    this.selectDate.emit(this.datePickerService.toMoment());
  }

  /**
   * 「クリア」ボタン押下時のコールバック
   */
  onClickClear() {
    this.selectDate.emit(null);
  }

  /**
   * 年変更時のコールバック
   * @param year 選択された年
   */
  onChangeYear(year: number) {
    this.datePickerService.baseDay.year(year);
    this._initCalendar();
  }

  /**
   * 月変更時のコールバック
   * @param month 選択された月
   */
  onChangeMonth(month: number) {
    this.datePickerService.baseDay.month(month - 1);
    this._initCalendar();
  }

  /**
   * 年のプルダウンの選択肢を更新する (上限付き)
   */
  updateYearsListFrom(to: Moment): void {
    this.years = _.range(
      moment(this.enableDateRange[0], DateFormat.params).year(),
      to.year() + 1
    );
  }

  /**
   * 年のプルダウンの選択肢を更新する (下限付き)
   */
  updateYearsListTo(from: Moment): void {
    this.years = _.range(
      from.year(),
      moment(this.enableDateRange[1], DateFormat.params).year() + 1
    );
  }

  private _getWeekLabels() {
    return [
      this.labels._common.calendar_sunday,
      this.labels._common.calendar_monday,
      this.labels._common.calendar_tuesday,
      this.labels._common.calendar_wednesday,
      this.labels._common.calendar_thursday,
      this.labels._common.calendar_friday,
      this.labels._common.calendar_saturday,
    ];
  }

  /**
   * カレンダーを初期化する
   */
  private _initCalendar() {
    this.datePickerLabels.title = this.datePickerService.getTitle();
    this.days = this.datePickerService.convertDays();
    this.title = {
      year: this.datePickerService.baseDay.year(),
      month: this.datePickerService.baseDay.month() + 1,
    };
  }

  /**
   * 週ラベルリソースを週開始曜日を元に並び変える
   * @returns 週ラベル
   */
  private _sortWeekLabels(weekLabels: string[]): string[] {
    const firstArray = weekLabels.slice(this.beginningWday);
    const secondArray = weekLabels.slice(0, this.beginningWday);

    return firstArray.concat(secondArray);
  }
}
