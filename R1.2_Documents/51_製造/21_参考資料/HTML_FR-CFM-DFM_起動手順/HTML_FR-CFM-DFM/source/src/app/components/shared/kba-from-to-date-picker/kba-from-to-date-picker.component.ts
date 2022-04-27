import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import * as moment from 'moment';
import { KbaDatePickerService } from '../../../services/shared/kba-date-picker.service';
import { DateFormat } from '../../../constants/date-format';
import { KbaSearchDatePickerComponent } from '../kba-search-date-picker/kba-search-date-picker.component';

@Component({
  selector: 'app-kba-from-to-date-picker',
  templateUrl: './kba-from-to-date-picker.component.html',
  styleUrls: ['./kba-from-to-date-picker.component.scss'],
})
export class KbaFromToDatePickerComponent implements OnInit {
  @ViewChild('dateFrom', { static: false })
  dateFrom: KbaSearchDatePickerComponent;
  @ViewChild('dateTo', { static: false }) dateTo: KbaSearchDatePickerComponent;

  @Input() params;
  @Input() resource;
  @Input() labels;
  @Input() from: string;
  @Input() to: string;
  @Input() enableDateRange: string[];
  @Input() dateFormat;
  @Input() beginningWday;
  @Input() timeZone;
  @Input() futureDateSelectable = false;
  @Input() fromId = 'date_from';
  @Input() toId = 'date_to';
  @Input() fromDisplay?: string;
  @Input() toDisplay?: string;
  @Input() required?: boolean;
  @Output() selectFrom: EventEmitter<string> = new EventEmitter();
  @Output() selectTo: EventEmitter<string> = new EventEmitter();

  displayable: boolean;
  fromDateRange: string[] = [];
  toDateRange: string[] = [];
  fromBaseDay: string;
  toBaseDay: string;
  fromTodayButtonDisabled = false;
  toTodayButtonDisabled = false;

  constructor(private datepickerService: KbaDatePickerService) {}

  ngOnInit() {
    this.displayable =
      this.resource[this.from] != null && this.resource[this.to] != null;
    this.enableDateRange = this.datepickerService.parseDateRange(
      this.enableDateRange
    );

    const fromDateRange = this._getFromDateRange(
      this.enableDateRange,
      this.params[this.to]
    );
    this.fromDateRange[0] = fromDateRange[0];
    this.fromDateRange[1] = fromDateRange[1];

    const toDateRange = this._getToDateRange(
      this.enableDateRange,
      this.params[this.from]
    );
    this.toDateRange[0] = toDateRange[0];
    this.toDateRange[1] = toDateRange[1];

    this.fromBaseDay = this.params[this.from];
    this.toBaseDay = this.params[this.to];
  }

  handleSelectFromDate(date: string) {
    this.fromBaseDay = date;
    this.toBaseDay = this.params[this.to];
    const toDateRange = this._getToDateRange(this.enableDateRange, date);
    this.toDateRange[0] = toDateRange[0];
    this.toDateRange[1] = toDateRange[1];
    this.dateTo.datePicker.updateYearsListTo(
      moment(this.toDateRange[0], DateFormat.params)
    );

    if (this.toBaseDay == null || this.toBaseDay.length === 0) {
      const compareValues = [this.datepickerService.toMoment()];

      if (this.fromBaseDay != null && this.fromBaseDay.length > 0) {
        compareValues.push(moment(this.fromBaseDay, DateFormat.hyphen));
      }

      this.toBaseDay = moment.max(...compareValues).format(DateFormat.hyphen);
    }

    this.selectFrom.emit(date);
  }

  handleSelectToDate(date: string) {
    this.toBaseDay = date;
    this.fromBaseDay = this.params[this.from];
    const fromDateRange = this._getFromDateRange(this.enableDateRange, date);
    this.fromDateRange[0] = fromDateRange[0];
    this.fromDateRange[1] = fromDateRange[1];
    this.dateFrom.datePicker.updateYearsListFrom(
      moment(this.fromDateRange[1], DateFormat.params)
    );

    if (this.fromBaseDay == null || this.fromBaseDay.length === 0) {
      const compareValues = [this.datepickerService.toMoment()];

      if (this.toBaseDay != null && this.toBaseDay.length > 0) {
        compareValues.push(moment(this.toBaseDay, DateFormat.hyphen));
      }

      this.fromBaseDay = moment.min(...compareValues).format(DateFormat.hyphen);
    }

    this.selectTo.emit(date);
  }

  private _getFromDateRange(dateRange: string[], dateTo: string) {
    const newRange = [...dateRange];

    if (dateTo != null && dateTo.length > 0) {
      newRange[1] = this.datepickerService
        .toMoment(dateTo, true)
        .format('YYYYMMDD');
    }

    return newRange;
  }

  private _getToDateRange(dateRange: string[], dateFrom: string) {
    const newRange = [...dateRange];

    if (dateFrom != null && dateFrom.length > 0) {
      newRange[0] = this.datepickerService
        .toMoment(dateFrom, true)
        .format('YYYYMMDD');
    }

    return newRange;
  }
}
