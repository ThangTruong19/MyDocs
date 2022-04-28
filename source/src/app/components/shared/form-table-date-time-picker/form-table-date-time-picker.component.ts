import {
    Component,
    Input,
    TemplateRef,
    ChangeDetectorRef,
    DoCheck,
    OnInit,
} from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import { DateFormat } from 'app/constants/date-format';
import {
    AbstractFormTableTextComponent
} from 'app/components/shared/abstract-component/abstract-form-table-text.component';
import { DatePickerService } from 'app/services/shared/date-picker.service';
import { TimePickerParams } from 'app/types/calendar';

type Moment = moment.Moment;

@Component({
    selector: '[app-form-table-date-time-picker]',
    templateUrl: './form-table-date-time-picker.component.html',
    styleUrls: ['./form-table-date-time-picker.component.scss'],
    providers: [DatePickerService],
})
export class FormTableDateTimePickerComponent extends AbstractFormTableTextComponent implements OnInit, DoCheck {

    private readonly DATE_TIME_SEPARATOR = ' ';

    @Input() public id: string;
    @Input() public dateFormat: string;
    @Input() public enableDateRange: string[];
    @Input() public futureDateSelectable: boolean;
    @Input() public timeZone: string;
    @Input() public beginningWday: number;
    @Input() public isDisabled = false;
    @Input() public continuous = false;
    @Input() public customContent: TemplateRef<any>;
    @Input() public showSeconds = false;
    @Input() public showMilliseconds = false;
    @Input() public hoursStep = 1;
    @Input() public minutesStep = 1;
    @Input() public secondsStep = 1;
    @Input() public millisecondsStep = 1;

    protected defaultSize = 'small';

    public datePickerId: string;
    public timePickerId: string;
    public dateDisplay: string;
    public timeDisplay: string;

    private tempValue: string | null = null;

    constructor(
        private datePickerService: DatePickerService,
        private ref: ChangeDetectorRef
    ) {
        super();
    }

    public override ngOnInit(): void {
        super.ngOnInit();
        this.datePickerId = this.id;
        this.timePickerId = this.id + '_time_picker';
    }

    ngDoCheck(): void {
        if (!_.isEmpty(this.itemParams[this.itemName]) && this.tempValue !== this.itemParams[this.itemName]) {
            const dateTimes: string[] = this.itemParams[this.itemName].split(this.DATE_TIME_SEPARATOR);
            if (dateTimes.length > 0) {
                this.dateDisplay = dateTimes[0];
            }
            if (dateTimes.length > 1) {
                this.timeDisplay = dateTimes[1];
            }

            this.applyValue();
        }

        this.tempValue = this.itemParams[this.itemName];

    }

    public override handleChange(value: string): void {
        this.tempValue = value;
        super.handleChange(value);
    }

    /**
     * 日付選択時コールバック
     * @param day 選択済日付
     */
    public onSelectDate(day: Moment): void {
        this.dateDisplay = day ? day.format(DateFormat.hyphen) : '';
        this.itemParams[this.itemName] = day ? day.format(DateFormat.hyphen) : '';
        this.itemParams[this.display] = day
            ? this.datePickerService.getInputText(day, this.dateFormat)
            : '';
        const dateTime: string = this.getDateTimeDisplay(this.dateDisplay, this.timeDisplay);
        this.itemParams[this.itemName] = dateTime;
        this.formGroup.get(this.name).setValue(this.itemParams[this.itemName]);
        this.ref.detectChanges();
    }

    /**
     * 時刻選択時コールバック
     * @param timeParams 選択済日付
     */
    public onSelectTime(timeParams: TimePickerParams) {
        this.timeDisplay = timeParams.selectedTime;
        const dateTime: string = this.getDateTimeDisplay(this.dateDisplay, this.timeDisplay);
        this.itemParams[this.itemName] = dateTime;
        this.ref.detectChanges();
    }

    private getDateTimeDisplay(dateDisplay: string, timeDisplay: string): string {
        let dateTimeDisplay: string = dateDisplay;
        if (dateTimeDisplay && timeDisplay) {
            dateTimeDisplay += this.DATE_TIME_SEPARATOR + timeDisplay;
        }
        return dateTimeDisplay;
    }

    public hasError(path: string): boolean {
        return (
            !!this.errorData && this.errorData.some((data: any) => data.keys.includes(path))
        );
    }

    protected _setInitExtra(): void {
        // noop
    }

}
