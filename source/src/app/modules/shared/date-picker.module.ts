import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { KCommonModule } from 'app/vendors/k-common-module';

import { AppDatePickerComponent } from 'app/components/shared/date-picker/date-picker.component';
import { FormTableDatePickerComponent } from 'app/components/shared/form-table-date-picker/form-table-date-picker.component';
import { SearchDatePickerComponent } from 'app/components/shared/search-date-picker/search-date-picker.component';
import { DatePickerService } from 'app/services/shared/date-picker.service';
import { SearchDateTimePickerComponent } from 'app/components/shared/search-date-time-picker/search-date-time-picker.component';
import { AppTimePickerComponent } from 'app/components/shared/time-picker/time-picker.component';

@NgModule({
    declarations: [
        FormTableDatePickerComponent,
        SearchDatePickerComponent,
        AppDatePickerComponent,
      //  SearchDateTimePickerComponent,

       // AppTimePickerComponent,
    ],
    imports: [FormsModule, ReactiveFormsModule, KCommonModule],
    exports: [
        KCommonModule,
        FormTableDatePickerComponent,
        SearchDatePickerComponent,
        AppDatePickerComponent,
      //  SearchDateTimePickerComponent,
     //   AppTimePickerComponent,
    ],
    providers: [DatePickerService],
})
export class DatePickerModule { }
