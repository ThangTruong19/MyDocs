import {
    Component,
    Input,
    ChangeDetectorRef,
    DoCheck,
} from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import {
    YearMonthFormat,
} from 'app/constants/date-format';
import { AbstractFormTableTextComponent } from '../abstract-component/abstract-form-table-text.component';
import { MonthPickerService } from 'app/services/shared/month-picker.service';

type Moment = moment.Moment;

@Component({
    selector: '[app-form-table-month-picker]',
    templateUrl: './form-table-month-picker.component.html',
    providers: [MonthPickerService],
})
export class FormTableMonthPickerComponent extends AbstractFormTableTextComponent implements DoCheck {

    @Input() public id: string;
    @Input() public dateFormat: string;
    @Input() public enableDateRange: string[];
    @Input() public futureDateSelectable: boolean;
    @Input() public timeZone: string;
    @Input() public isDisabled = false;

    protected defaultSize = 'small';
    private tempValue: string | null = null;

    constructor(
        private monthPickerService: MonthPickerService,
        private ref: ChangeDetectorRef
    ) {
        super();
    }

    ngDoCheck(): void {
        if (!_.isEmpty(this.itemParams[this.itemName]) && this.tempValue !== this.itemParams[this.itemName]) {
            this.applyValue();
        }

        this.tempValue = this.itemParams[this.itemName];
    }

    public override handleChange(value: string): void {
        this.tempValue = value;
        super.handleChange(value);
    }

    /**
     * 月選択時コールバック
     * @param day 選択済日付
     */
    public onSelectMonth(day: Moment): void {

        this.itemParams[this.itemName] = day
            ? day.format(YearMonthFormat.hyphen)
            : '';
        this.itemParams[this.display] = day
            ? this.monthPickerService.getInputText(day, this.dateFormat)
            : '';
        this.ref.detectChanges();
    }

    protected _setInitExtra(): void {
        // noop
    }

}
