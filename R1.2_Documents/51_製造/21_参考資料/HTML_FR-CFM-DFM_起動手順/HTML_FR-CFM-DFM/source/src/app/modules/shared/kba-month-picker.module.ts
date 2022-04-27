import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { KCommonModule } from '../../vendor/k-common-module';

import { KbaMonthPickerComponent } from '../../components/shared/kba-month-picker/kba-month-picker.component';
import { KbaFormTableMonthPickerComponent } from '../../components/shared/kba-form-table-month-picker/kba-form-table-month-picker.component';

import { KbaMonthPickerService } from '../../services/shared/kba-month-picker.service';

@NgModule({
  declarations: [KbaFormTableMonthPickerComponent, KbaMonthPickerComponent],
  imports: [FormsModule, ReactiveFormsModule, KCommonModule],
  exports: [
    KCommonModule,
    KbaFormTableMonthPickerComponent,
    KbaMonthPickerComponent,
  ],
  providers: [KbaMonthPickerService],
})
export class KbaMonthPickerModule {}
