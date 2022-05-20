import * as moment from 'moment';
import { isEmpty, forEach } from 'lodash';
import { Injectable } from '@angular/core';
import {
    CommonDatePickerDay,
    CommonMonthPickerMonth,
    MonthLabels,
} from 'app/vendors/k-common-module/interfaces';
import { MonthPickerParams, DatePickerParams } from 'app/types/calendar';
import {
    DateFormat,
    DateTimeFormat,
} from 'app/constants/date-format';
import { UserSettingService } from 'app/services/api/user-setting.service';
import { Labels } from 'app/types/common';

type Moment = moment.Moment;
type MomentUnitOfTimeStartOf = moment.unitOfTime.StartOf;

@Injectable()
export abstract class CalendarService {
    protected timeZone: string;
    protected dateFormat: string;
    protected beginningWday: number;
    protected enableDateRange: string[];
    protected endOfMonthDay: Moment;
    protected _baseDay: Moment;
    protected _today: Moment;

    constructor(protected userSettingService: UserSettingService) { }

    public get today() {
        return this._today;
    }

    public set today(today: Moment) {
        this._today = today;
    }

    public get baseDay() {
        return this._baseDay;
    }

    public set baseDay(baseDay: Moment) {
        this._baseDay = baseDay;
    }

    public initialize(params: MonthPickerParams | DatePickerParams) {
        forEach(params, (value: any, key: any) => {
            const comp: { [key: string]: any } = <{ [key: string]: any }>this;
            comp[`${key}`] = value;
        });
        this.today = this.toMoment();
    }

    /**
     * 日付文字列からmomentを生成する
     * ※引数がなし or 空文字の場合は当日を生成
     *
     * @param dateString 日付文字列
     * @param clearHours 時以下の情報をクリアする
     */
    public toMoment(dateString: string = '', clearHours = true): Moment {
        if (!isEmpty(dateString)) {
            const parsed: moment.Moment = moment(
                dateString.replace(/Z/g, ''),
                DateTimeFormat.hyphen
            );

            return clearHours
                ? parsed.set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })
                : parsed;
        }

        let timeZone: string;

        try {
            timeZone =
                this.timeZone ||
                this.userSettingService.getDatePickerConfig().time_difference;
        } catch (e) {
            return moment(0, 'hh');
        }

        return moment()
            .utc()
            .utcOffset(timeZone)
            .set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
    }

    /**
     * 月のラベルを取得する
     * @param labels ラベル
     */
    public getMonthLabels(labels: Labels): MonthLabels {
        return [
            labels._common.calendar_january,
            labels._common.calendar_february,
            labels._common.calendar_march,
            labels._common.calendar_april,
            labels._common.calendar_may,
            labels._common.calendar_june,
            labels._common.calendar_july,
            labels._common.calendar_august,
            labels._common.calendar_september,
            labels._common.calendar_october,
            labels._common.calendar_november,
            labels._common.calendar_december,
        ];
    }

    /**
     * ユーザ設定から日付の型式を逆引きする
     */
    public getCurrentDateFormat(): string {
        return this.inputDateFormat(
            this.userSettingService.getDatePickerConfig().date_format_code
        );
    }

    /**
     * 相対表記の日付の選択範囲を絶対表記形式にフォーマットする
     * @param dateRange 日付範囲
     */
    public parseDateRange(dateRange: string[]): string[] {
        const absolutePattern = /\d{8}/;
        const yearPattern = /(-?\d+)[Yy]/;
        const monthPattern = /(-?\d+)[Mm]/;
        const datePattern = /(-?\d+)[Dd]/;

        return dateRange.map((date: string) => {
            if (absolutePattern.test(date)) {
                return date;
            }

            let temp: RegExpExecArray | null;
            return this.toMoment()
                .add({
                    years: (temp = yearPattern.exec(date)) ? +temp[1] : 0,
                    months: (temp = monthPattern.exec(date)) ? +temp[1] : 0,
                    days: (temp = datePattern.exec(date)) ? +temp[1] : 0,
                })
                .format(DateFormat.params);
        });
    }

    /**
     * カレンダー用の日付を生成する
     */
    public abstract createCalendar(): CommonMonthPickerMonth[] | CommonDatePickerDay[];

    /**
     * テキストボックス表示用の日付文字を編集する
     * ※日付フォーマットに従った変換を行う
     *
     * @param day 日付オブジェクト
     * @returns 日付フォーマットに従った「年月日」
     */
    public abstract getInputText(day: Moment, dateFormat: string): string;

    /**
     * ユーザ設定の日付フォーマットを返却する
     *
     * @returns 日付フォーマットに従った「年月日」
     */
    public abstract inputDateFormat(dateFormat: string): string;

    /**
     * 引数の日付がすでに選択済日付かどうかを返却する
     * @param day
     * @param selectedDayString
     * @param compareUnit
     * @return true:選択済日付 / false: 選択済日付以外
     */
    protected _isSelected(
        day: Moment,
        selectedDayString: string,
        compareUnit: MomentUnitOfTimeStartOf
    ): boolean {
        return day.isSame(this.toMoment(selectedDayString), compareUnit);
    }

    /**
     * 引数の日付が選択不可日付かどうかを返却する
     * @param day
     * @param compareUnit
     * @return true:選択不可日付 / false: 選択不可日付以外
     */
    protected _isDisabled(
        day: Moment,
        compareUnit: MomentUnitOfTimeStartOf
    ): boolean {
        return !day.isBetween(
            moment(this.enableDateRange[0], DateFormat.params),
            moment(this.enableDateRange[1], DateFormat.params),
            compareUnit,
            '[]'
        );
    }

}
