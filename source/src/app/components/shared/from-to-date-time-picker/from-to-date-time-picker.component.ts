import {
    Component,
    OnInit,
    Input,
    ViewChild,
    Output,
    EventEmitter,
} from '@angular/core';
import * as moment from 'moment';
import { DatePickerService } from 'app/services/shared/date-picker.service';
import { DateFormat } from 'app/constants/date-format';
import { Labels, Resources } from 'app/types/common';
import {
    SearchDateTimePickerComponent
} from 'app/components/shared/search-date-time-picker/search-date-time-picker.component';
import { RequestParams } from 'app/types/request';

@Component({
    selector: 'app-from-to-date-time-picker',
    templateUrl: './from-to-date-time-picker.component.html',
    styleUrls: ['./from-to-date-time-picker.component.scss'],
})
export class FromToDateTimePickerComponent implements OnInit {

    @ViewChild('dateTimeFrom', { static: false })
    public dateTimeFrom: SearchDateTimePickerComponent;

    @ViewChild('dateTimeTo', { static: false })
    public dateTimeTo: SearchDateTimePickerComponent;

    @Input() public params: RequestParams;
    @Input() public resource: Resources;
    @Input() public labels: Labels;
    @Input() public from: string;
    @Input() public to: string;
    @Input() public enableDateRange: string[];
    @Input() public dateFormat: string;
    @Input() public beginningWday: string;
    @Input() public timeZone: string;
    @Input() public futureDateSelectable = false;
    @Input() public fromId = 'date_from';
    @Input() public toId = 'date_to';
    @Input() public fromShowLabel = true;
    @Input() public toShowLabel = false;
    @Input() public fromDisplay?: string;
    @Input() public toDisplay?: string;
    @Input() public required?: boolean;
    @Input() public showSeconds = false;
    @Input() public showMilliseconds = false;

    @Output() public selectFrom: EventEmitter<string> = new EventEmitter();
    @Output() public selectTo: EventEmitter<string> = new EventEmitter();

    public displayable: boolean;
    public fromDateRange: string[] = [];
    public toDateRange: string[] = [];
    public fromBaseDateTime: string;
    public toBaseDateTime: string;
    public fromTodayButtonDisabled = false;
    public toTodayButtonDisabled = false;

    constructor(
        private datePickerService: DatePickerService
    ) {
    }

    ngOnInit(): void {
        this.displayable =
            this.resource[this.from] != null && this.resource[this.to] != null;
        this.enableDateRange = this.datePickerService.parseDateRange(
            this.enableDateRange
        );

        const fromDateRange: string[] = this._getFromDateRange(
            this.enableDateRange,
            this.params[this.to]
        );
        this.fromDateRange[0] = fromDateRange[0];
        this.fromDateRange[1] = fromDateRange[1];

        const toDateRange: string[] = this._getToDateRange(
            this.enableDateRange,
            this.params[this.from]
        );
        this.toDateRange[0] = toDateRange[0];
        this.toDateRange[1] = toDateRange[1];

        this.fromBaseDateTime = this.params[this.from];
        this.toBaseDateTime = this.params[this.to];
    }

    public handleSelectFromDateTime(dateTime: string): void {
        this.fromBaseDateTime = dateTime;
        this.toBaseDateTime = this.params[this.to];
        const toDateRange: string[] = this._getToDateRange(this.enableDateRange, dateTime);
        this.toDateRange[0] = toDateRange[0];
        this.toDateRange[1] = toDateRange[1];
        this.dateTimeTo.datePicker.updateYearsListTo(
            moment(this.toDateRange[0], DateFormat.params)
        );

        if (this.toBaseDateTime == null || this.toBaseDateTime.length === 0) {
            const compareValues: moment.Moment[] = [this.datePickerService.toMoment()];

            if (this.fromBaseDateTime != null && this.fromBaseDateTime.length > 0) {
                compareValues.push(moment(this.fromBaseDateTime, DateFormat.hyphen));
            }

            this.toBaseDateTime = moment.max(...compareValues).format(DateFormat.hyphen);
        }

        this.selectFrom.emit(dateTime);
    }

    public handleSelectToDateTime(dateTime: string): void {
        this.toBaseDateTime = dateTime;
        this.fromBaseDateTime = this.params[this.from];
        const fromDateRange: string[] = this._getFromDateRange(this.enableDateRange, dateTime);
        this.fromDateRange[0] = fromDateRange[0];
        this.fromDateRange[1] = fromDateRange[1];
        this.dateTimeFrom.datePicker.updateYearsListFrom(
            moment(this.fromDateRange[1], DateFormat.params)
        );

        if (this.fromBaseDateTime == null || this.fromBaseDateTime.length === 0) {
            const compareValues: moment.Moment[] = [this.datePickerService.toMoment()];

            if (this.toBaseDateTime != null && this.toBaseDateTime.length > 0) {
                compareValues.push(moment(this.toBaseDateTime, DateFormat.hyphen));
            }

            this.fromBaseDateTime = moment.min(...compareValues).format(DateFormat.hyphen);
        }

        this.selectTo.emit(dateTime);
    }

    private _getFromDateRange(dateRange: string[], dateTimeTo: string): string[] {
        const newRange: string[] = [...dateRange];

        if (dateTimeTo != null && dateTimeTo.length > 0) {
            const dateTimeFormat: string = this.getDateTimeFormat();
            newRange[1] = this.datePickerService
                .toMoment(dateTimeTo, true)
                .format(dateTimeFormat);
        }

        return newRange;
    }

    private _getToDateRange(dateRange: string[], dateTimeFrom: string): string[] {
        const newRange: string[] = [...dateRange];

        if (dateTimeFrom != null && dateTimeFrom.length > 0) {
            const dateTimeFormat: string = this.getDateTimeFormat();
            newRange[0] = this.datePickerService
                .toMoment(dateTimeFrom, true)
                .format(dateTimeFormat);
        }

        return newRange;
    }

    /**
     * 時刻フォーマットを取得する。
     */
    private getDateTimeFormat(): string {
        let dateTimeFormat: string;
        if (this.showMilliseconds) {
            dateTimeFormat = 'YYYYMMDD HHmmssSSS';
        } else if (this.showSeconds) {
            dateTimeFormat = 'YYYYMMDD HHmmss';
        } else {
            dateTimeFormat = 'YYYYMMDD HHmm';
        }
        return dateTimeFormat;
    }

}
