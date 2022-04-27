import * as moment from 'moment';
import * as _ from 'lodash';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import {
  CommonMonthPickerMonth,
  MonthPickerLabels,
  OnClickMonthValues,
} from '../../../vendor/k-common-module/interfaces';

import { MonthPickerParams } from '../../../types/calendar';

import {
  DateTimeFormatKind,
  DateFormat,
  YearMonthFormat,
} from '../../../constants/date-format';
import { Calendar } from '../../../constants/calendar';

import { KbaMonthPickerService } from '../../../services/shared/kba-month-picker.service';

type Moment = moment.Moment;

@Component({
  selector: 'app-kba-month-picker',
  templateUrl: './kba-month-picker.component.html',
  styleUrls: ['./kba-month-picker.component.scss'],
  providers: [KbaMonthPickerService],
})
export class KbaMonthPickerComponent implements OnInit {
  @Input() id: string;
  @Input() labels: any;
  @Input() dateFormat: string;
  @Input() enableDateRange: string[];
  @Input() futureDateSelectable = false;
  @Input() timeZone: string;
  @Input() initialBaseYearMonth: string;
  @Input() isVisibleClearButton = true;
  @Output() selectMonth = new EventEmitter<Moment>();

  monthList: CommonMonthPickerMonth[];
  monthPickerLabels: MonthPickerLabels;
  selectYear: string;
  params: MonthPickerParams;

  constructor(private monthPickerService: KbaMonthPickerService) {
    // noop
  }

  ngOnInit() {
    const parsedDateRange = this.monthPickerService.parseDateRange(
      this.enableDateRange
    );
    this.enableDateRange[0] = parsedDateRange[0];
    this.enableDateRange[1] = parsedDateRange[1];

    this.params = {
      timeZone: this.timeZone,
      dateFormat: this.dateFormat,
      enableDateRange: this.enableDateRange,
    };
    this.monthPickerService.initialize(this.params);

    this.monthPickerLabels = {
      closeButton: this.labels._common.close,
      clearButton: this.labels._common.clear,
      title: '',
      months: this.monthPickerService.getMonthLabels(this.labels),
    };

    // 未来日選択不可の場合は選択可能範囲の終端に今日日付を設定
    this.enableDateRange[1] = this.futureDateSelectable
      ? this.enableDateRange[1]
      : this.monthPickerService.today.format(DateFormat.params);
  }

  /**
   * 「次の年へ」ボタン活性・非活性制御
   */
  isDisabledNextYearButton() {
    if (_.isEmpty(this.monthPickerService.baseDay)) {
      return false;
    }

    return this.monthPickerService.baseDay.isSameOrAfter(
      this.monthPickerService.toMoment(this.enableDateRange[1]),
      'year'
    );
  }

  /**
   * 月選択時のコールバック
   * @param OnClickDayValues { ev: MouseEvent, monthObj: CommonMonthPickerMonth }
   */
  onClickMonth({ ev, monthObj }: OnClickMonthValues) {
    ev.preventDefault();
    this.selectMonth.emit(
      this.monthPickerService.toMoment(
        `${this.selectYear}${('00' + monthObj.month).slice(-2)}01`
      )
    );
  }

  /**
   * カレンダーが開かれた際のコールバック
   */
  onOpened() {
    this.monthPickerService.initialBaseYearMonth = this.initialBaseYearMonth;
    this.monthPickerService.baseDay = (this.initialBaseYearMonth
      ? this.monthPickerService.toMoment(this.initialBaseYearMonth)
      : moment().set({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    ).startOf('year');
    this.selectYear = this.monthPickerService.baseDay.format('YYYY');
    this._initCalendar();
  }

  /**
   * 「前の月へ」ボタン押下時のコールバック
   */
  onClickPrev() {
    this.monthPickerService.baseDay.subtract(1, 'years');
    this.selectYear = this.monthPickerService.baseDay.format('YYYY');
    this._initCalendar();
  }

  /**
   * 「次の月へ」ボタン押下時のコールバック
   */
  onClickNext() {
    this.monthPickerService.baseDay.add(1, 'years');
    this.selectYear = this.monthPickerService.baseDay.format('YYYY');
    this._initCalendar();
  }

  /**
   * 「閉じる」ボタン押下時のコールバック
   */
  onClickClose() {
    // noop
  }

  /**
   * クリアボタン押下時のコールバック
   */
  onClickClear() {
    this.selectMonth.emit(null);
  }

  /**
   * カレンダーを初期化する
   */
  private _initCalendar() {
    this.monthPickerLabels.title = this.monthPickerService.baseDay.format(
      'YYYY'
    );
    this.monthList = this.monthPickerService.createCalendar();
  }
}
