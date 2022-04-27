import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { CommonMonthPickerMonth } from 'app/vendors/k-common-module/interfaces';

import {
    DateTimeFormatKind,
    YearMonthFormat,
} from 'app/constants/date-format';
import { Calendar } from 'app/constants/calendar';

import { CalendarService } from './calendar.service';

type Moment = moment.Moment;

/**
 * 月次カレンダー用のサービス
 */
@Injectable()
export class MonthPickerService extends CalendarService {
    private _initialBaseYearMonth: string;

    public get initialBaseYearMonth() {
        return this._initialBaseYearMonth;
    }

    public set initialBaseYearMonth(initialBaseYearMonth: string) {
        this._initialBaseYearMonth = initialBaseYearMonth;
    }

    /**
     * 引数の日付が当月かどうかを返却する
     * @param day
     * @return true: 当月 / false: 当月以外
     */
    public isThisMonth(day: Moment): boolean {
        return day.isSame(this.today, 'month');
    }

    /**
     * 引数の日付がすでに選択済日付かどうかを返却する
     * @param day
     * @return true:選択済日付 / false: 選択済日付以外
     */
    public isSelected(day: Moment): boolean {
        return this._isSelected(day, this.initialBaseYearMonth, 'month');
    }

    /**
     * 引数の日付が選択不可日付かどうかを返却する
     * @param day
     * @param enableDateRange
     * @return true:選択不可日付 / false: 選択不可日付以外
     */
    public isDisabled(day: Moment): boolean {
        return this._isDisabled(day, 'month');
    }

    /**
     * カレンダー用の日付を生成する
     */
    public createCalendar(): CommonMonthPickerMonth[] {
        const startDay: moment.Moment = this.baseDay.clone().startOf('year');
        const monthList: CommonMonthPickerMonth[] = [];

        for (let i = 0; i < Calendar.monthsLength; i++) {
            const day: moment.Moment = startDay.clone().add(i, 'months');

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
     * @returns 日付フォーマットに従った「年月」
     */
    public getInputText(day: Moment, dateFormat: string): string {
        return day.format(this.inputDateFormat(dateFormat));
    }

    /**
     * ユーザ設定の日付フォーマットを返却する
     * @param dateFormat 日付フォーマット
     * @returns 日付フォーマットに従った「年月日」
     */
    public inputDateFormat(dateFormat: string): string {
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