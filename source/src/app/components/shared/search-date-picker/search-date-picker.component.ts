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
import { Labels, Resources } from 'app/types/common';

type Moment = moment.Moment;

@Component({
    selector: 'app-search-date-picker',
    templateUrl: './search-date-picker.component.html',
    styleUrls: ['./search-date-picker.component.scss'],
    providers: [DatePickerService],
})
export class SearchDatePickerComponent implements OnInit {

    @ViewChild('datePicker', { static: false })
    public datePicker: AppDatePickerComponent;

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
    @Input() public initialBaseDay?: string;

    @Output() public selectDate: EventEmitter<string> = new EventEmitter();

    public isVisible = false;

    public get displayLabel(): string {
        if (
            this.itemParams[this.itemName] == null ||
            this.itemParams[this.itemName] === ''
        ) {
            return '';
        }

        const day: moment.Moment = moment(this.itemParams[this.itemName], DateFormat.hyphen);
        const display: string = this.datePickerService.getInputText(day, this.dateFormat);

        if (this.display && this.itemParams[this.display] !== display) {
            this.itemParams[this.display] = display;
        }

        return display;
    }

    constructor(
        private datePickerService: DatePickerService
    ) { }

    public ngOnInit(): void {
        if (!this._checkVisible()) {
            _.unset(this.itemParams, this.itemName);
            return;
        }
    }

    /**
     * 日付選択時コールバック
     * @param day 選択済日付
     */
    public onSelectDate(day: Moment): void {
        this.itemParams[this.itemName] = day ? day.format(DateFormat.hyphen) : '';
        this.selectDate.emit(this.itemParams[this.itemName]);
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
