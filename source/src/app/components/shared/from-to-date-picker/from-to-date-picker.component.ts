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
import {
    SearchDatePickerComponent
} from 'app/components/shared/search-date-picker/search-date-picker.component';

import { Labels, Resources } from 'app/types/common';

@Component({
    selector: 'app-from-to-date-picker',
    templateUrl: './from-to-date-picker.component.html',
    styleUrls: ['./from-to-date-picker.component.scss'],
})
export class FromToDatePickerComponent implements OnInit {

    @ViewChild('dateFrom', { static: false })
    public dateFrom: SearchDatePickerComponent;

    @ViewChild('dateTo', { static: false })
    public dateTo: SearchDatePickerComponent;

    @Input() public params: any;
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

    @Output() public selectFrom: EventEmitter<string> = new EventEmitter();
    @Output() public selectTo: EventEmitter<string> = new EventEmitter();

    public displayable: boolean;
    public fromDateRange: string[] = [];
    public toDateRange: string[] = [];
    public fromBaseDay: string;
    public toBaseDay: string;
    public fromTodayButtonDisabled = false;
    public toTodayButtonDisabled = false;

    constructor(private datePickerService: DatePickerService) { }

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

        this.fromBaseDay = this.params[this.from];
        this.toBaseDay = this.params[this.to];
    }

    public handleSelectFromDate(date: string): void {
        this.fromBaseDay = date;
        this.toBaseDay = this.params[this.to];
        const toDateRange: string[] = this._getToDateRange(this.enableDateRange, date);
        this.toDateRange[0] = toDateRange[0];
        this.toDateRange[1] = toDateRange[1];
        this.dateTo.datePicker.updateYearsListTo(
            moment(this.toDateRange[0], DateFormat.params)
        );

        if (this.toBaseDay == null || this.toBaseDay.length === 0) {
            const compareValues: moment.Moment[] = [this.datePickerService.toMoment()];

            if (this.fromBaseDay != null && this.fromBaseDay.length > 0) {
                compareValues.push(moment(this.fromBaseDay, DateFormat.hyphen));
            }

            this.toBaseDay = moment.max(...compareValues).format(DateFormat.hyphen);
        }

        this.selectFrom.emit(date);
    }

    public handleSelectToDate(date: string): void {
        this.toBaseDay = date;
        this.fromBaseDay = this.params[this.from];
        const fromDateRange: string[] = this._getFromDateRange(this.enableDateRange, date);
        this.fromDateRange[0] = fromDateRange[0];
        this.fromDateRange[1] = fromDateRange[1];
        this.dateFrom.datePicker.updateYearsListFrom(
            moment(this.fromDateRange[1], DateFormat.params)
        );

        if (this.fromBaseDay == null || this.fromBaseDay.length === 0) {
            const compareValues: moment.Moment[] = [this.datePickerService.toMoment()];

            if (this.toBaseDay != null && this.toBaseDay.length > 0) {
                compareValues.push(moment(this.toBaseDay, DateFormat.hyphen));
            }

            this.fromBaseDay = moment.min(...compareValues).format(DateFormat.hyphen);
        }

        this.selectTo.emit(date);
    }

    private _getFromDateRange(dateRange: string[], dateTo: string): string[] {
        const newRange: string[] = [...dateRange];

        if (dateTo != null && dateTo.length > 0) {
            newRange[1] = this.datePickerService
                .toMoment(dateTo, true)
                .format('YYYYMMDD');
        }

        return newRange;
    }

    private _getToDateRange(dateRange: string[], dateFrom: string): string[] {
        const newRange: string[] = [...dateRange];

        if (dateFrom != null && dateFrom.length > 0) {
            newRange[0] = this.datePickerService
                .toMoment(dateFrom, true)
                .format('YYYYMMDD');
        }

        return newRange;
    }

}
