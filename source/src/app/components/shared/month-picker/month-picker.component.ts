import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as $ from 'jquery';
import {
    CommonMonthPickerMonth,
    MonthPickerLabels,
    OnClickMonthValues,
} from 'app/vendors/k-common-module/interfaces';
import { MonthPickerParams } from 'app/types/calendar';
import { Labels } from 'app/types/common';
import {
    DateFormat,
} from 'app/constants/date-format';
import { MonthPickerService } from 'app/services/shared/month-picker.service';

type Moment = moment.Moment;

@Component({
    selector: 'app-month-picker',
    templateUrl: './month-picker.component.html',
    providers: [MonthPickerService],
})
export class AppMonthPickerComponent implements OnInit {

    @Input() public id: string;
    @Input() public labels: Labels;
    @Input() public dateFormat: string;
    @Input() public enableDateRange: string[];
    @Input() public futureDateSelectable = false;
    @Input() public timeZone: string;
    @Input() public initialBaseYearMonth: string;
    @Input() public isVisibleClearButton = true;
    @Output() public selectMonth: EventEmitter<Moment> = new EventEmitter<Moment>();

    public monthList: CommonMonthPickerMonth[];
    public monthPickerLabels: MonthPickerLabels;
    public selectYear: string;
    public params: MonthPickerParams;
    public monthPickerCssClass: string;

    constructor(
        private monthPickerService: MonthPickerService,
        private elementRef: ElementRef
    ) {
    }

    ngOnInit(): void {
        const parsedDateRange: string[] = this.monthPickerService.parseDateRange(
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

        const appModal: JQuery<any> = $(this.elementRef.nativeElement).closest('.app-modal');
        if (appModal.length) {
            this.monthPickerCssClass = 'modal-app-picker';
        } else {
            this.monthPickerCssClass = '';
        }
    }

    /**
     * 「次の年へ」ボタン活性・非活性制御
     */
    public isDisabledNextYearButton(): boolean {
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
    public onClickMonth({ ev, monthObj }: OnClickMonthValues): void {
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
    public onOpened(): void {
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
    public onClickPrev(): void {
        this.monthPickerService.baseDay.subtract(1, 'years');
        this.selectYear = this.monthPickerService.baseDay.format('YYYY');
        this._initCalendar();
    }

    /**
     * 「次の月へ」ボタン押下時のコールバック
     */
    public onClickNext(): void {
        this.monthPickerService.baseDay.add(1, 'years');
        this.selectYear = this.monthPickerService.baseDay.format('YYYY');
        this._initCalendar();
    }

    /**
     * 「閉じる」ボタン押下時のコールバック
     */
    public onClickClose(): void {
        // noop
    }

    /**
     * クリアボタン押下時のコールバック
     */
    public onClickClear(): void {
        this.selectMonth.emit(null);
    }

    /**
     * カレンダーを初期化する
     */
    private _initCalendar(): void {
        this.monthPickerLabels.title = this.monthPickerService.baseDay.format(
            'YYYY'
        );
        this.monthList = this.monthPickerService.createCalendar();
    }
}
