import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { KCommonModule } from '../../vendor/k-common-module';

import { KbaDatePickerComponent } from '../../components/shared/kba-date-picker/kba-date-picker.component';
import { KbaFormTableDatePickerComponent } from '../../components/shared/kba-form-table-date-picker/kba-form-table-date-picker.component';
import { KbaSearchDatePickerComponent } from '../../components/shared/kba-search-date-picker/kba-search-date-picker.component';
import { KbaDatePickerService } from '../../services/shared/kba-date-picker.service';

@NgModule({
  declarations: [
    KbaFormTableDatePickerComponent,
    KbaSearchDatePickerComponent,
    KbaDatePickerComponent,
  ],
  imports: [FormsModule, ReactiveFormsModule, KCommonModule],
  exports: [
    KCommonModule,
    KbaFormTableDatePickerComponent,
    KbaSearchDatePickerComponent,
    KbaDatePickerComponent,
  ],
  providers: [KbaDatePickerService],
})
export class KbaDatePickerModule {}
