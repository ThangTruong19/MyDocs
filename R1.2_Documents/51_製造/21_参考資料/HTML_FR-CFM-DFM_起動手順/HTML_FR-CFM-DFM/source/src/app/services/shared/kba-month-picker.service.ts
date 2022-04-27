import * as moment from 'moment';
import { isEmpty } from 'lodash';
import { Injectable } from '@angular/core';

import { CommonMonthPickerMonth } from '../../vendor/k-common-module/interfaces';

import { MonthPickerParams } from '../../types/calendar';

import {
  DateTimeFormatKind,
  DateFormat,
  YearMonthFormat,
} from '../../constants/date-format';
import { Calendar } from '../../constants/calendar';

import { KbaCalendarService } from '../../services/shared/kba-calendar.service';

type Moment = moment.Moment;
type MomentUnitOfTimeStartOf = moment.unitOfTime.StartOf;

@Injectable()
export class KbaMonthPickerService extends KbaCalendarService {
  private _initialBaseYearMonth: string;

  get initialBaseYearMonth() {
    return this._initialBaseYearMonth;
  }

  set initialBaseYearMonth(initialBaseYearMonth: string) {
    this._initialBaseYearMonth = initialBaseYearMonth;
  }

  /**
   * 引数の日付が当月かどうかを返却する
   * @param day
   * @return true: 当月 / false: 当月以外
   */
  isThisMonth(day: Moment): boolean {
    return day.isSame(this.today, 'month');
  }

  /**
   * 引数の日付がすでに選択済日付かどうかを返却する
   * @param day
   * @return true:選択済日付 / false: 選択済日付以外
   */
  isSelected(day: Moment): boolean {
    return this._isSelected(day, this.initialBaseYearMonth, 'month');
  }

  /**
   * 引数の日付が選択不可日付かどうかを返却する
   * @param day
   * @param enableDateRange
   * @return true:選択不可日付 / false: 選択不可日付以外
   */
  isDisabled(day: Moment): boolean {
    return this._isDisabled(day, 'month');
  }

  /**
   * カレンダー用の日付を生成する
   */
  createCalendar(): CommonMonthPickerMonth[] {
    const startDay = this.baseDay.clone().startOf('year');
    const monthList = [];

    for (let i = 0; i < Calendar.monthsLength; i++) {
      const day = startDay.clone().add(i, 'months');

      monthList.push({
        disabled: this.isDisabled(day),
        isThisMonth: this.isThisMonth(day),
        isSelected: this.isSelected(day),
        month: day.month() + 1,
      });
    }

    return monthList;
  }

  /**
   * テキストボックス表示用の日付文字を編集する
   * ※日付フォーマットに従った変換を行う
   *
   * @param day 日付オブジェクト
   * @param dateFormat 日付フォーマット
   * @returns 日付フォーマットに従った「年月」
   */
  getInputText(day: Moment, dateFormat: string): string {
    return day.format(this.inputDateFormat(dateFormat));
  }

  /**
   * ユーザ設定の日付フォーマットを返却する
   * @param dateFormat 日付フォーマット
   * @returns 日付フォーマットに従った「年月日」
   */
  inputDateFormat(dateFormat: string): string {
    switch (dateFormat) {
      case DateTimeFormatKind.yearFirst:
        return YearMonthFormat.slash;
      case DateTimeFormatKind.monthFirst:
      case DateTimeFormatKind.dayFirst:
        return YearMonthFormat.slashMonthFirst;
      default:
        return YearMonthFormat.hyphen;
    }
  }
}
