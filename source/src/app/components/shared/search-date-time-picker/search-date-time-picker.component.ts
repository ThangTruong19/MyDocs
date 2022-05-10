import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    ViewChild,
} from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { DateFormat } from 'app/constants/date-format';
import { DatePickerService } from 'app/services/shared/date-picker.service';
import { AppDatePickerComponent } from 'app/components/shared/date-picker/date-picker.component';
import { AppTimePickerComponent } from 'app/components/shared/time-picker/time-picker.component';
import { Labels, Resources } from 'app/types/common';
import { TimePickerParams } from 'app/types/calendar';
import { TimePickerService } from 'app/services/shared/time-picker.service';

type Moment = moment.Moment;

@Component({
    selector: 'app-search-date-time-picker',
    templateUrl: './search-date-time-picker.component.html',
    styleUrls: ['./search-date-time-picker.component.scss'],
    providers: [DatePickerService],
})
export class SearchDateTimePickerComponent implements OnInit {

    private readonly DATE_TIME_SEPARATOR = ' ';

    @ViewChild('datePicker', { static: false })
    public datePicker: AppDatePickerComponent;

    @ViewChild('timePicker', { static: false })
    public timePicker: AppTimePickerComponent;

    @Input() public itemName: string;
    @Input() public itemParams: any;
    @Input() public itemResource: Resources;
    @Input() public itemLabel: Labels;
    @Input() public display: string;
    @Input() public showLabel = true;
    @Input() public id: string;
    @Input() public dateFormat: string;
    @Input() public enableDateRange: string[];
    @Input() public futureDateSelectable: boolean;
    @Input() public timeZone: string;
    @Input() public beginningWday: number;
    @Input() public isDisabled = false;
    @Input() public required = false;
    @Input() public initialBaseDateTime: string;
    @Input() public showSeconds = false;
    @Input() public showMilliseconds = false;
    @Input() public hoursStep = 1;
    @Input() public minutesStep = 1;
    @Input() public secondsStep = 1;
    @Input() public millisecondsStep = 1;

    @Output() public selectFrom: EventEmitter<string> = new EventEmitter();
    @Output() public selectTo: EventEmitter<string> = new EventEmitter();
    @Output() public selectDateTime: EventEmitter<string> = new EventEmitter();

    public isVisible = false;
    public datePickerId: string;
    public timePickerId: string;
    public dateDisplay: string;
    public timeDisplay: string;
    public initialBaseDay: string;
    public initialBaseTime: string;

    public get displayDateLabel(): string {

        if (
            this.itemParams[this.itemName] == null ||
            this.itemParams[this.itemName] === ''
        ) {
            return '';
        }

        const itemParamVal: string = this.itemParams[this.itemName];
        const splitItemParams: string[] = itemParamVal.split(this.DATE_TIME_SEPARATOR);
        if (splitItemParams.length > 0) {
            const day: moment.Moment = moment(splitItemParams[0], DateFormat.hyphen);
            this.dateDisplay = this.datePickerService.getInputText(day, this.dateFormat);
            const display: string = this.getDateTimeDisplay(this.dateDisplay, this.timeDisplay);
            if (this.display && this.itemParams[this.display] !== display) {
                this.itemParams[this.display] = display;
            }
            return this.dateDisplay;
        } else {
            return '';
        }
    }

    public get displayTimeLabel(): string {

        if (
            this.itemParams[this.itemName] == null ||
            this.itemParams[this.itemName] === ''
        ) {
            return '';
        }

        const itemParamVal: string = this.itemParams[this.itemName];
        const splitItemParams: string[] = itemParamVal.split(this.DATE_TIME_SEPARATOR);
        if (splitItemParams.length > 1) {
            this.timeDisplay = splitItemParams[1];
            const display: string = this.getDateTimeDisplay(this.dateDisplay, this.timeDisplay);
            if (this.display && this.itemParams[this.display] !== display) {
                this.itemParams[this.display] = display;
            }
            return this.timeDisplay;
        } else if (splitItemParams.length > 0) {
            this.timeDisplay = this.timePickerService.getInitTimeValue(this.showSeconds, this.showMilliseconds);
            return this.timeDisplay;
        } else {
            return '';
        }
    }

    constructor(
        private datePickerService: DatePickerService,
        private timePickerService: TimePickerService
    ) { }

    public ngOnInit(): void {
        if (!this._checkVisible()) {
            _.unset(this.itemParams, this.itemName);
            return;
        }

        this.datePickerId = this.id;
        this.timePickerId = this.id + '_time_picker';

        if (this.initialBaseDateTime) {
            const initalBaseDateTimes: string[] = this.initialBaseDateTime.split(this.DATE_TIME_SEPARATOR);
            if (initalBaseDateTimes.length > 0) {
                this.initialBaseDay = initalBaseDateTimes[0];
            }
            if (initalBaseDateTimes.length > 1) {
                this.initialBaseTime = initalBaseDateTimes[1];
            }
        }
    }

    /**
     * 日付選択時コールバック
     * @param day 選択済日付
     */
    public onSelectDate(day: Moment): void {
        this.dateDisplay = day ? day.format(DateFormat.hyphen) : '';

        const dateTime: string = this.getDateTimeDisplay(this.dateDisplay, this.timeDisplay);
        this.itemParams[this.itemName] = dateTime;
        this.selectDateTime.emit(this.itemParams[this.itemName]);
    }

    /**
     * 時刻選択時コールバック
     * @param timeParams 選択済日付
     */
    public onSelectTime(timeParams: TimePickerParams) {
        this.timeDisplay = timeParams.selectedTime;
        const dateTime: string = this.getDateTimeDisplay(this.dateDisplay, this.timeDisplay);
        this.itemParams[this.itemName] = dateTime;
        this.selectDateTime.emit(this.itemParams[this.itemName]);
    }

    private getDateTimeDisplay(dateDisplay: string, timeDisplay: string): string {
        let dateTimeDisplay: string = dateDisplay;
        if (dateDisplay && timeDisplay) {
            dateTimeDisplay += this.DATE_TIME_SEPARATOR + timeDisplay;
        }
        return dateTimeDisplay;
    }

    /**
     * 表示可能判定
     *
     * @return true 表示可能/false 表示不能
     */
    private _checkVisible(): boolean {
        this.isVisible = _.has(this.itemResource, this.itemName);
        return this.isVisible;
    }

}
