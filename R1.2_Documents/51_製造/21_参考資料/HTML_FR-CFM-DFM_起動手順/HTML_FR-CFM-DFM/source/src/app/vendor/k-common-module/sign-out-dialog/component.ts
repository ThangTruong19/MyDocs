import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { FlyoutService } from '../flyout/flyout.service';
import { HeaderLabels } from '../interfaces';

@Component({
  /* tslint:disable component-selector */
  selector: 'common-sign-out-dialog',
  templateUrl: './component.html',
  styleUrls: ['./component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class SignOutDialogComponent {
  /* tslint:disable */
  @Input('attr.aria-controls') flyoutId: string;
  /* tslint:disable */
  @Input() labels: HeaderLabels;

  @Output() signOut = new EventEmitter<void>();

  constructor(private flyoutService: FlyoutService) {
    //
  }

  onClickSignOutCancel() {
    this.flyoutService.close(this.flyoutId);
  }

  onClickSignOutOk() {
    this.signOut.emit();
  }
}
