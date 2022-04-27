import { Directive, ElementRef, HostBinding, HostListener, Input } from '@angular/core';
import { take } from 'rxjs/operators';

import { FlyoutService } from './flyout.service';

@Directive({
  /* tslint:disable directive-selector */
  selector: '[commonFlyoutTrigger]',
})
export class FlyoutTriggerDirective {
  /* tslint:disable */
  @Input('attr.aria-controls')
  @HostBinding('attr.aria-controls')
  flyoutId: string;
  /* tslint:enable */

  constructor(private el: ElementRef, private flyoutService: FlyoutService) {}

  @HostListener('click', ['$event'])
  onClick(ev: MouseEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    this.flyoutService
      .getIsOpened$(this.flyoutId)
      .pipe(take(1))
      .subscribe(isOpened => {
        isOpened
          ? this.flyoutService.close(this.flyoutId)
          : this.flyoutService.open(this.flyoutId, this.el.nativeElement.getBoundingClientRect());
      });
  }
}
