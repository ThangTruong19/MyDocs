import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppCommonModule } from 'app/modules/shared/app-common.module';
import { HistoryMgtListComponent } from 'app/components/history/history-mgt-list.component';
import { HistoryMgtListService } from 'app/services/history/history-mgt-list.service';
import { DatePickerService } from 'app/services/shared/date-picker.service';

@NgModule({
    imports: [
        CommonModule,
        AppCommonModule,
        RouterModule.forChild([{ path: '', component: HistoryMgtListComponent }]),
    ],
    declarations: [HistoryMgtListComponent],
    providers: [
        HistoryMgtListService
    ],
})
export class HistoryMgtListModule { }
