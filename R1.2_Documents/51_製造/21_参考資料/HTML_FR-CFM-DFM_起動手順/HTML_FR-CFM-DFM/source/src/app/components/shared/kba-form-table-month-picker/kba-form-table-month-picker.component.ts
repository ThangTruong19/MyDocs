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
} from '../../../constants/date-format';

import { KbaAbstractFormTableTextComponent } from '../kba-abstract-component/kba-abstract-form-table-text-component';

import { KbaMonthPickerService } from '../../../services/shared/kba-month-picker.service';

type Moment = moment.Moment;

@Component({
  selector: '[app-kba-form-table-month-picker]',
  templateUrl: './kba-form-table-month-picker.component.html',
  providers: [KbaMonthPickerService],
})
export class KbaFormTableMonthPickerComponent extends KbaAbstractFormTableTextComponent implements DoCheck {
  @Input() id: string;
  @Input() dateFormat: string;
  @Input() enableDateRange: string[];
  @Input() futureDateSelectable: boolean;
  @Input() timeZone: string;
  @Input() isDisabled = false;
  defaultSize = 'small';
  tempValue: string | null = null;

  constructor(
    private monthPickerService: KbaMonthPickerService,
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
   * 月選択時コールバック
   * @param day 選択済日付
   */
  onSelectMonth(day: Moment) {
    this.kbaParams[this.kbaName] = day
      ? day.format(YearMonthFormat.hyphen)
      : '';
    this.kbaParams[this.display] = day
      ? this.monthPickerService.getInputText(day, this.dateFormat)
      : '';
    this.ref.detectChanges();
  }

  protected _setInitExtra() {
    // noop
  }
}
