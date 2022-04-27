import {
  Component,
  Input,
  TemplateRef,
  ChangeDetectorRef,
  DoCheck,
} from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';

import { DateFormat } from '../../../constants/date-format';

import { KbaAbstractFormTableTextComponent } from '../kba-abstract-component/kba-abstract-form-table-text-component';

import { KbaDatePickerService } from '../../../services/shared/kba-date-picker.service';

type Moment = moment.Moment;

@Component({
  selector: '[app-kba-form-table-date-picker]',
  templateUrl: './kba-form-table-date-picker.component.html',
  styleUrls: ['./kba-form-table-date-picker.component.scss'],
  providers: [KbaDatePickerService],
})
export class KbaFormTableDatePickerComponent extends KbaAbstractFormTableTextComponent implements DoCheck {
  @Input() id: string;
  @Input() dateFormat: string;
  @Input() enableDateRange: string[];
  @Input() futureDateSelectable: boolean;
  @Input() timeZone: string;
  @Input() beginningWday: number;
  @Input() isDisabled = false;
  @Input() continuous = false;
  @Input() customContent: TemplateRef<any>;
  defaultSize = 'small';
  tempValue: string | null = null;

  constructor(
    private datePickerService: KbaDatePickerService,
    private ref: ChangeDetectorRef
  ) {
    super();
  }

  handleChange(value: string) {
    this.tempValue = value;
    super.handleChange(value);
  }

  ngDoCheck() {
    if (!_.isEmpty(this.kbaParams[this.kbaName]) && this.tempValue !== this.kbaParams[this.kbaName]) {
      this.applyValue();
    }

    this.tempValue = this.kbaParams[this.kbaName];
  }

  /**
   * 日付選択時コールバック
   * @param day 選択済日付
   */
  onSelectDate(day: Moment) {
    this.kbaParams[this.kbaName] = day ? day.format(DateFormat.hyphen) : '';
    this.kbaParams[this.display] = day
      ? this.datePickerService.getInputText(day, this.dateFormat)
      : '';
    this.formGroup.get(this.name).setValue(this.kbaParams[this.kbaName]);
    this.ref.detectChanges();
  }

  hasError(path: string): boolean {
    return (
      !!this.errorData && this.errorData.some(data => data.keys.includes(path))
    );
  }

  protected _setInitExtra() {
    // noop
  }
}
