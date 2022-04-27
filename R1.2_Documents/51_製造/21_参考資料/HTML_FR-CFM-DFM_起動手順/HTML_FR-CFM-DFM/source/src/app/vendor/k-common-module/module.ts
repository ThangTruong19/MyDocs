import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FlyoutDirective } from './flyout/flyout.directive';
import { FlyoutTriggerDirective } from './flyout/flyout-trigger.directive';
import { FlyoutService } from './flyout/flyout.service';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { MonthPickerComponent } from './month-picker/month-picker.component';
import { ConfigDialogComponent } from './config-dialog/config-dialog.component';
import { CommonHeaderComponent } from './common-header/common-header.component';
import { SignOutDialogComponent } from './sign-out-dialog/component';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [
    ConfigDialogComponent,
    FlyoutDirective,
    FlyoutTriggerDirective,
    DatePickerComponent,
    MonthPickerComponent,
    CommonHeaderComponent,
    SignOutDialogComponent,
  ],
  exports: [
    CommonModule,
    FlyoutDirective,
    FlyoutTriggerDirective,
    DatePickerComponent,
    MonthPickerComponent,
    CommonHeaderComponent,
  ],
  providers: [FlyoutService],
})
export class KCommonModule {}
