import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KCommonModule } from 'app/vendors/k-common-module';
import { FormTableDateTimePickerComponent } from 'app/components/shared/form-table-date-time-picker/form-table-date-time-picker.component';
import { SearchDateTimePickerComponent } from 'app/components/shared/search-date-time-picker/search-date-time-picker.component';
import { CommonTimePickerComponent } from 'app/components/shared/time-picker/common-time-picker.component';
import { AppTimePickerComponent } from 'app/components/shared/time-picker/time-picker.component';
import { DatePickerModule } from 'app/modules/shared/date-picker.module';
import { DatePickerService } from 'app/services/shared/date-picker.service';

@NgModule({
    declarations: [
        FormTableDateTimePickerComponent,
        SearchDateTimePickerComponent,
        CommonTimePickerComponent,
        AppTimePickerComponent,
    ],
    imports: [FormsModule, ReactiveFormsModule, KCommonModule, DatePickerModule],
    exports: [
        KCommonModule,
        FormTableDateTimePickerComponent,
        SearchDateTimePickerComponent,
        CommonTimePickerComponent,
        AppTimePickerComponent,
    ],
    providers: [DatePickerService],
})
export class TimePickerModule { }
