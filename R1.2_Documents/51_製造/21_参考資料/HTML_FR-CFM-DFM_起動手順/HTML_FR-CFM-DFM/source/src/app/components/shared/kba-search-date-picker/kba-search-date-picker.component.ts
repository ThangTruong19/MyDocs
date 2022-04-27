import {
  Component,
  OnInit,
  Input,
  Output,
  ChangeDetectorRef,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';

import { DateTimeFormatKind, DateFormat } from '../../../constants/date-format';

import { KbaDatePickerService } from '../../../services/shared/kba-date-picker.service';
import { KbaDatePickerComponent } from '../kba-date-picker/kba-date-picker.component';

type Moment = moment.Moment;

@Component({
  selector: 'app-kba-search-date-picker',
  templateUrl: './kba-search-date-picker.component.html',
  styleUrls: ['./kba-search-date-picker.component.scss'],
  providers: [KbaDatePickerService],
})
export class KbaSearchDatePickerComponent implements OnInit {
  @ViewChild('datePicker', { static: false })
  datePicker: KbaDatePickerComponent;

  isVisible: boolean;
  @Input() kbaName: string;
  @Input() kbaParams: any;
  @Input() kbaResource: any;
  @Input() kbaLabel: any;
  @Input() display: string;
  @Input() showLabel = true;
  @Input() id: string;
  @Input() dateFormat: string;
  @Input() enableDateRange: string[];
  @Input() futureDateSelectable: boolean;
  @Input() timeZone: string;
  @Input() beginningWday: number;
  @Input() isDisabled = false;
  @Input() required = false;
  @Input() initialBaseDay?: string;
  @Output() selectDate: EventEmitter<string> = new EventEmitter();

  get displayLabel() {
    if (
      this.kbaParams[this.kbaName] == null ||
      this.kbaParams[this.kbaName] === ''
    ) {
      return '';
    }

    const day = moment(this.kbaParams[this.kbaName], DateFormat.hyphen);
    const display = this.datePickerService.getInputText(day, this.dateFormat);

    if (this.display && this.kbaParams[this.display] !== display) {
      this.kbaParams[this.display] = display;
    }

    return display;
  }

  constructor(
    private datePickerService: KbaDatePickerService
  ) { }

  ngOnInit() {
    if (!this._checkVisible()) {
      _.unset(this.kbaParams, this.kbaName);
      return;
    }
  }

  /**
   * 日付選択時コールバック
   * @param day 選択済日付
   */
  onSelectDate(day: Moment) {
    this.kbaParams[this.kbaName] = day ? day.format(DateFormat.hyphen) : '';
    this.selectDate.emit(this.kbaParams[this.kbaName]);
  }

  /**
   * 表示可能判定
   *
   * @return true 表示可能/false 表示不能
   */
  private _checkVisible(): boolean {
    this.isVisible = _.has(this.kbaResource, this.kbaName);
    return this.isVisible;
  }
}
