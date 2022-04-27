import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { KCommonModule } from 'app/vendors/k-common-module';

import { AppMonthPickerComponent } from 'app/components/shared/month-picker/month-picker.component';
import { FormTableMonthPickerComponent } from 'app/components/shared/form-table-month-picker/form-table-month-picker.component';

import { MonthPickerService } from 'app/services/shared/month-picker.service';

@NgModule({
    declarations: [FormTableMonthPickerComponent, AppMonthPickerComponent],
    imports: [FormsModule, ReactiveFormsModule, KCommonModule],
    exports: [
        KCommonModule,
        FormTableMonthPickerComponent,
        AppMonthPickerComponent,
    ],
    providers: [MonthPickerService],
})
export class MonthPickerModule { }
