import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  HostBinding,
  ElementRef,
  AfterContentInit
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { FlyoutService } from '../flyout/flyout.service';
import { CommonDatePickerDay, DatePickerLabels, DatePickerTitle, MonthLabels, OnClickDayValues } from '../interfaces';

/**
/* 1 〜 12 の数字を、デフォルトのラベルとして返す
 */
const makeDefaultMonthLabels = (): MonthLabels => {
  return Array(12).fill(true).map((_, idx) => (idx + 1).toString()) as MonthLabels;
};

const isSatisfiedMonths = (monthLabels: MonthLabels): boolean => {
  return Array.isArray(monthLabels) && monthLabels.length === 12;
}

@Component({
  /* tslint:disable component-selector */
  selector: 'common-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class DatePickerComponent implements OnDestroy, AfterContentInit {
  @Input()
  @HostBinding('attr.id')
  id: string;

  @Input() labels: DatePickerLabels;
  @Input() disabledTodayButton: boolean;
  @Input() disabledPrevMonthButton: boolean;
  @Input() disabledNextMonthButton: boolean;
  @Input() weekLabels: string[];
  @Input() days: CommonDatePickerDay[][];
  @Input() isVisibleClearButton: boolean;
  @Input() title: DatePickerTitle;
  @Input() years: number[];
  @Input() monthLabels: MonthLabels;
  @Input() months: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // デフォルトでは全月が対象

  @Output() hasOpened = new EventEmitter<void>();
  @Output() clickDay = new EventEmitter<OnClickDayValues>();
  @Output() clickPrev = new EventEmitter<MouseEvent>();
  @Output() clickNext = new EventEmitter<MouseEvent>();
  @Output() clickClose = new EventEmitter<MouseEvent>();
  @Output() clickToday = new EventEmitter<MouseEvent>();
  @Output() clickClear = new EventEmitter<MouseEvent>();
  @Output() changeYear = new EventEmitter<number>();
  @Output() changeMonth = new EventEmitter<number>();

  private subscriptions = [] as Subscription[];

  constructor(private el: ElementRef, private flyoutService: FlyoutService) {
    //
  }

  ngAfterContentInit() {
    this.subscriptions.push(
      this.flyoutService.getOpened$(this.id).subscribe(_ => this.hasOpened.next()),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onClickDay(ev: MouseEvent, day: CommonDatePickerDay) {
    this.clickDay.emit({ ev, day });
    this.closeFlyout();
  }

  onClickPrev(ev: MouseEvent) {
    this.clickPrev.emit(ev);
  }

  onClickNext(ev: MouseEvent) {
    this.clickNext.emit(ev);
  }

  onClickClose(ev: MouseEvent) {
    this.clickClose.emit(ev);
    this.closeFlyout();
  }

  onClickToday(ev: MouseEvent) {
    this.clickToday.emit(ev);
    this.closeFlyout();
  }

  onClickClear(ev: MouseEvent) {
    this.clickClear.emit(ev);
    this.closeFlyout();
  }

  onChangeYear(value: number) {
    this.changeYear.emit(value);
  }

  onChangeMonth(value: number) {
    // value は 0 始まりで月が渡されるので、 1 始まりにして emit
    this.changeMonth.emit(value + 1);
  }

  getYear(): number {
    return this.title.year;
  }

  getMonth(): number {
    return this.title.month - 1;
  }

  getMonthLabels(): MonthLabels {
    if (!isSatisfiedMonths(this.monthLabels)) {
      return makeDefaultMonthLabels();
    }

    return this.monthLabels;
  }

  monthIsDisabled(value: number): boolean {
    return !this.months.includes(value)
  }

  closeFlyout() {
    this.flyoutService.close(this.id);
  }

}
