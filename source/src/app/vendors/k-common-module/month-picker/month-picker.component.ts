import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  HostBinding,
  ElementRef,
  AfterContentInit,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { FlyoutService } from '../flyout/flyout.service';
import { CommonMonthPickerMonth, MonthPickerLabels, OnClickMonthValues } from '../interfaces';

@Component({
  /* tslint:disable component-selector */
  selector: 'common-month-picker',
  templateUrl: './month-picker.component.html',
  styleUrls: ['./month-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class MonthPickerComponent implements OnDestroy, AfterContentInit {
  @Input()
  @HostBinding('attr.id')
  id: string;

  @Input() labels: MonthPickerLabels;
  @Input() disabledPrevYearButton: boolean;
  @Input() disabledNextYearButton: boolean;
  @Input() monthList: CommonMonthPickerMonth[];
  @Input() isVisibleClearButton: boolean;

  @Output() hasOpened = new EventEmitter<void>();
  @Output() clickMonth = new EventEmitter<OnClickMonthValues>();
  @Output() clickPrev = new EventEmitter<MouseEvent>();
  @Output() clickNext = new EventEmitter<MouseEvent>();
  @Output() clickClose = new EventEmitter<MouseEvent>();
  @Output() clickClear = new EventEmitter<MouseEvent>();

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

  getLabel(monthObj: CommonMonthPickerMonth): string {
    const months = this.labels.months;
    if (!Array.isArray(months)) {
      return `${monthObj.month}`;
    }
    if (months.length !== 12) {
      return `${monthObj.month}`;
    }

    return months[monthObj.month - 1];
  }

  onClickMonth(ev: MouseEvent, monthObj: CommonMonthPickerMonth) {
    this.clickMonth.emit({ ev, monthObj });
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

  onClickClear(ev: MouseEvent) {
    this.clickClear.emit(ev);
    this.closeFlyout();
  }

  closeFlyout() {
    this.flyoutService.close(this.id);
  }
}
