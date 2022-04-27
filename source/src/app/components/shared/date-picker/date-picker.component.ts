import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import {
    CommonDatePickerDay,
    DatePickerLabels,
    OnClickDayValues,
    DatePickerTitle,
    MonthLabels,
} from 'app/vendors/k-common-module/interfaces';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as $ from 'jquery';
import { DatePickerParams } from 'app/types/calendar';
import { DateFormat } from 'app/constants/date-format';
import { DatePickerService } from 'app/services/shared/date-picker.service';

type Moment = moment.Moment;

@Component({
    selector: 'app-date-picker',
    templateUrl: './date-picker.component.html',
    providers: [DatePickerService],
})
export class AppDatePickerComponent implements OnInit {

    @Input() public id: string;
    @Input() public labels: any;
    @Input() public dateFormat: string;
    @Input() public enableDateRange: string[];
    @Input() public futureDateSelectable = false;
    @Input() public timeZone: string;
    @Input() public beginningWday: number;
    @Input() public initialBaseDay: string;
    @Input() public isVisibleClearButton = true;
    @Input() public disableTodayButton = false;

    @Output() public selectDate: EventEmitter<Moment> = new EventEmitter<Moment>();

    public days: CommonDatePickerDay[][];
    public title: DatePickerTitle = {
        year: null,
        month: null,
    };
    public years: number[];
    public datePickerLabels: DatePickerLabels;
    public datePickerWeekLabels: string[];
    public params: DatePickerParams;
    public monthLabels: MonthLabels;
    public datePickerCssClass: string;

    public get todayDisabled(): boolean {
        return this.datePickerService.isDisabled(
            moment(
                this.datePickerService.today.format(DateFormat.params),
                DateFormat.params
            )
        );
    }

    constructor(
        private datePickerService: DatePickerService,
        private elementRef: ElementRef
    ) {
    }

    ngOnInit(): void {
        const parsedDateRange: string[] = this.datePickerService.parseDateRange(
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

        const appModal: JQuery<any> = $(this.elementRef.nativeElement).closest('.app-modal');
        if (appModal.length) {
            this.datePickerCssClass = 'modal-app-picker';
        } else {
            this.datePickerCssClass = '';
        }
    }

    /**
     * 「次の月へ」ボタン活性・非活性制御
     */
    public isDisabledNextMonthButton(): boolean {
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
    public idDisabledPrevMonthButton(): boolean {
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
    public onClickDay({ ev, day }: OnClickDayValues): void {
        ev.preventDefault();
        this.selectDate.emit(this.datePickerService.toMoment(day.YYYYMMDD));
    }

    /**
     * カレンダーが開かれた際のコールバック
     */
    public onOpened(): void {
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
    public onClickPrev(): void {
        this.datePickerService.baseDay.subtract(1, 'months');
        this._initCalendar();
    }

    /**
     * 「次の月へ」ボタン押下時のコールバック
     */
    public onClickNext(): void {
        this.datePickerService.baseDay.add(1, 'months');
        this._initCalendar();
    }

    /**
     * 「閉じる」ボタン押下時のコールバック
     */
    public onClickClose(): void {
        // noop
    }

    /**
     * 「本日」ボタン押下時のコールバック
     */
    public onClickToday(): void {
        this.selectDate.emit(this.datePickerService.toMoment());
    }

    /**
     * 「クリア」ボタン押下時のコールバック
     */
    public onClickClear(): void {
        this.selectDate.emit(null);
    }

    /**
     * 年変更時のコールバック
     * @param year 選択された年
     */
    public onChangeYear(year: number): void {
        this.datePickerService.baseDay.year(year);
        this._initCalendar();
    }

    /**
     * 月変更時のコールバック
     * @param month 選択された月
     */
    public onChangeMonth(month: number): void {
        this.datePickerService.baseDay.month(month - 1);
        this._initCalendar();
    }

    /**
     * 年のプルダウンの選択肢を更新する (上限付き)
     */
    public updateYearsListFrom(to: Moment): void {
        this.years = _.range(
            moment(this.enableDateRange[0], DateFormat.params).year(),
            to.year() + 1
        );
    }

    /**
     * 年のプルダウンの選択肢を更新する (下限付き)
     */
    public updateYearsListTo(from: Moment): void {
        this.years = _.range(
            from.year(),
            moment(this.enableDateRange[1], DateFormat.params).year() + 1
        );
    }

    private _getWeekLabels(): string[] {
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
    private _initCalendar(): void {
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
        const firstArray: string[] = weekLabels.slice(this.beginningWday);
        const secondArray: string[] = weekLabels.slice(0, this.beginningWday);

        return firstArray.concat(secondArray);
    }

}
