import * as moment from 'moment';
import { reduce } from 'lodash';
import { Injectable } from '@angular/core';

import { CommonDatePickerDay } from '../../vendor/k-common-module/interfaces';

import { DatePickerParams } from '../../types/calendar';

import {
  DateTimeFormatKind,
  DateFormat,
  YearMonthFormat,
  DateTimeFormat,
} from '../../constants/date-format';
import { Calendar } from '../../constants/calendar';

import { KbaCalendarService } from '../../services/shared/kba-calendar.service';

type Moment = moment.Moment;
type MomentUnitOfTimeStartOf = moment.unitOfTime.StartOf;

@Injectable()
export class KbaDatePickerService extends KbaCalendarService {
  private _initialBaseDay: string;

  get initialBaseDay() {
    return this._initialBaseDay;
  }

  set initialBaseDay(initialBaseDay: string) {
    this._initialBaseDay = initialBaseDay;
  }

  /**
   * 引数の日付が当日日付かどうかを返却する
   * @param day
   * @return true:当日日付 / false: 当日日付以外
   */
  isToday(day: Moment): boolean {
    return day.isSame(this.today, 'day');
  }

  /**
   * 引数の日付が先月日付かどうかを返却する
   * @param day
   * @return true:先月日付 / false: 先月日付以外
   */
  isLastMonth(day: Moment): boolean {
    return day.isBefore(this.baseDay, 'day');
  }

  /**
   * 引数の日付が来月日付かどうかを返却する
   * @param day
   * @return true:来月日付 / false: 来月日付以外
   */
  isNextMonth(day: Moment): boolean {
    return day.isAfter(this.endOfMonthDay, 'day');
  }

  /**
   * 引数の日付がすでに選択済日付かどうかを返却する
   * @param day
   * @param selectedDayString
   * @param compareUnit
   * @return true:選択済日付 / false: 選択済日付以外
   */
  isSelected(day: Moment): boolean {
    return this._isSelected(day, this.initialBaseDay, 'day');
  }

  /**
   * 引数の日付が選択不可日付かどうかを返却する
   * @param day
   * @param enableDateRange
   * @return true:選択不可日付 / false: 選択不可日付以外
   */
  isDisabled(day: Moment): boolean {
    return this._isDisabled(day, 'day');
  }

  /**
   * カレンダータイトルを編集する
   * ※日付フォーマットに従った変換を行う
   *
   * @returns 日付フォーマットに従った「年月」
   */
  getTitle(): string {
    switch (this.dateFormat) {
      case DateTimeFormatKind.yearFirst:
        return this.baseDay.format(YearMonthFormat.slash);
      case DateTimeFormatKind.monthFirst:
      case DateTimeFormatKind.dayFirst:
        return this.baseDay.format(YearMonthFormat.slashMonthFirst);
      default:
        return this.baseDay.format(YearMonthFormat.hyphen);
    }
  }

  /**
   * カレンダー用の日付を生成する
   */
  createCalendar(): CommonDatePickerDay[] {
    let startDay;
    switch (true) {
      case this.baseDay.day() === this.beginningWday:
        startDay = this.baseDay.clone();
        break;
      case this.baseDay.day() < this.beginningWday:
        startDay = this.baseDay
          .clone()
          .day(this.beginningWday - Calendar.dayOfWeekLength);
        break;
      default:
        startDay = this.baseDay.clone().day(this.beginningWday);
    }

    this.endOfMonthDay = this.baseDay.clone().endOf('month');

    const days = [];
    for (let i = 0; i < Calendar.daysLength; i++) {
      const day = startDay.clone().add(i, 'days');

      days.push({
        disabled: this.isDisabled(day),
        isToday: this.isToday(day),
        isSelected: this.isSelected(day),
        isLastMonth: this.isLastMonth(day),
        isNextMonth: this.isNextMonth(day),
        YYYYMMDD: day.format(DateFormat.params),
        date: day.date(),
      });
    }

    return days;
  }

  /**
   * 共通パーツに渡す用の日付を設定する
   * ※_createCalendarで生成した一次元配列を1週間 * 5週の2次元配列に変換して設定する
   */
  convertDays(): CommonDatePickerDay[][] {
    return reduce(
      this.createCalendar(),
      (array, day, idx) => {
        const weekIdx = Math.floor(idx / Calendar.dayOfWeekLength);
        array[weekIdx] = array[weekIdx] || [];
        array[weekIdx].push(day);

        return array;
      },
      []
    );
  }

  /**
   * テキストボックス表示用の日付文字を編集する
   * ※日付フォーマットに従った変換を行う
   *
   * @param day 日付オブジェクト
   * @param dateFormat 日付フォーマット
   * @returns 日付フォーマットに従った「年月日」
   */
  getInputText(day: Moment, dateFormat: string): string {
    return day.format(this.inputDateFormat(dateFormat));
  }

  /**
   * テキストボックス表示用の日付文字を編集する
   * ※日付フォーマットに従った変換を行う
   *
   * @param day 日付オブジェクト
   * @param dateFormat 日付フォーマット
   * @returns 日付フォーマットに従った「年月日」
   */
  getInputDatetimeText(day: Moment, dateFormat: string): string {
    return day.format(this.inputDateTimeFormat(dateFormat));
  }

  /**
   * 日付文字列のフォーマットを変換する
   * @param date 日付
   * @param srcDateFormat 変換元日付形式
   * @param destDateFormat 変換先日付形式
   */
  convertDateString(
    date: string,
    srcDateFormat: string,
    destDateFormat: string
  ) {
    return moment(date, srcDateFormat).format(destDateFormat);
  }

  /**
   * ユーザ設定の日付フォーマットを返却する
   * @param dateFormat 日付フォーマット
   * @returns 日付フォーマットに従った「年月日」
   */
  inputDateFormat(dateFormat: string): string {
    switch (dateFormat) {
      case DateTimeFormatKind.yearFirst:
        return DateFormat.slash;
      case DateTimeFormatKind.monthFirst:
        return DateFormat.slashMonthFirst;
      case DateTimeFormatKind.dayFirst:
        return DateFormat.slashDayFirst;
      default:
        return DateFormat.hyphen;
    }
  }

  /**
   * ユーザ設定の日付フォーマットを返却する
   * @param dateFormat 日付フォーマット
   * @returns 日付フォーマットに従った「年月日 + 時分秒」
   */
  inputDateTimeFormat(dateFormat: string): string {
    switch (dateFormat) {
      case DateTimeFormatKind.yearFirst:
        return DateTimeFormat.slash;
      case DateTimeFormatKind.monthFirst:
        return DateTimeFormat.slashMonthFirst;
      case DateTimeFormatKind.dayFirst:
        return DateTimeFormat.slashDayFirst;
      default:
        return DateTimeFormat.hyphen;
    }
  }
}
