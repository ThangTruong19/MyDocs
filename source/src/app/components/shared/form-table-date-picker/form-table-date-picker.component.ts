import {
    Component,
    Input,
    TemplateRef,
    ChangeDetectorRef,
    DoCheck,
} from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import { DateFormat } from 'app/constants/date-format';
import {
    AbstractFormTableTextComponent
} from 'app/components/shared/abstract-component/abstract-form-table-text.component';
import { DatePickerService } from 'app/services/shared/date-picker.service';

type Moment = moment.Moment;

@Component({
    selector: '[app-form-table-date-picker]',
    templateUrl: './form-table-date-picker.component.html',
    styleUrls: ['./form-table-date-picker.component.scss'],
    providers: [DatePickerService],
})
export class FormTableDatePickerComponent extends AbstractFormTableTextComponent implements DoCheck {

    @Input() public id: string;
    @Input() public dateFormat: string;
    @Input() public enableDateRange: string[];
    @Input() public futureDateSelectable: boolean;
    @Input() public timeZone: string;
    @Input() public beginningWday: number;
    @Input() public isDisabled = false;
    @Input() public continuous = false;
    @Input() public customContent: TemplateRef<any>;

    protected defaultSize = 'small';

    private tempValue: string | null = null;

    constructor(
        private datePickerService: DatePickerService,
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
     * 日付選択時コールバック
     * @param day 選択済日付
     */
    public onSelectDate(day: Moment): void {
        this.itemParams[this.itemName] = day ? day.format(DateFormat.hyphen) : '';
        this.itemParams[this.display] = day
            ? this.datePickerService.getInputText(day, this.dateFormat)
            : '';
        this.formGroup.get(this.name).setValue(this.itemParams[this.itemName]);
        this.ref.detectChanges();
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
