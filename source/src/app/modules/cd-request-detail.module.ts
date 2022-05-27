import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppCommonModule } from 'app/modules/shared/app-common.module';
import { CdRequestDetailComponent } from 'app/components/customize_data_request/cd-request-detail/cd-request-detail.component';
import { DatePickerService } from 'app/services/shared/date-picker.service';
import { CdRequestPeriodTabComponent } from 'app/components/customize_data_request/request-period/cd-request-period-tab/cd-request-period-tab.component';
import { CdExpectedTrafficConfirmComponent } from 'app/components/customize_data_request/request-number/expected-traffic-comfirm/cd-expected-traffic-confirm/cd-expected-traffic-confirm.component';
import { CdRequestNumberComfirmComponent } from 'app/components/customize_data_request/request-number/request-number-comfirm/cd-request-number-comfirm/cd-request-number-comfirm.component';
import { CdRequestPeriodComfirmComponent } from 'app/components/customize_data_request/request-period/request-period-comfirm/cd-request-period-comfirm/cd-request-period-comfirm.component';
import { CdRequestPeriodTabService } from 'app/services/customize_data_request/request-period/cd-request-period-tab/cd-request-period-tab.service';
import { CdRequestPeriodComfirmService } from 'app/services/customize_data_request/request-period/request-period-comfirm/cd-request-period-comfirm.service';
import { CdCurrentRequestComfirmComponent } from 'app/components/customize_data_request/request-period/current-request-comfirm/cd-current-request-comfirm/cd-current-request-comfirm.component';
import { CdRequestDetailService } from 'app/services/customize_data_request/cd-request-detail/cd-request-detail.service';
import { CdNumberListRequestTabComponent } from 'app/components/customize_data_request/number-list-request/cd-number-list-request-tab/cd-number-list-request-tab.component';
import { CdNumberListRequestConfirmComponent } from 'app/components/customize_data_request/number-list-request/cd-number-list-request-confirm/cd-number-list-request-confirm.component';
import { CdNumberListRequestTabService } from 'app/services/customize_data_request/number-list-request/cd-number-list-request-tab/cd-number-list-request-tab.service';
import { CdNumberListRequestComfirmService } from 'app/services/customize_data_request/number-list-request/cd-number-list-request-confirm/cd-request-period-comfirm.service';
import { CdRequestNumberTabComponent } from 'app/components/customize_data_request/request-number/cd-request-number-tab/cd-request-number-tab.component';
import { CdRequestNumberTabService } from 'app/services/customize_data_request/request-number/cd-request-number-tab/cd-request-number-tab.service';
import { CdRequestNumberListComponent } from 'app/components/customize_data_request/request-number/request-number-list/cd-request-number-list.component';
import { CdRequestNumberListService } from 'app/services/customize_data_request/request-number/cd-request-number-tab/cd-request-number-list.service';

@NgModule({
    imports: [
        CommonModule,
        AppCommonModule,
        RouterModule.forChild([{ path: '', component: CdRequestDetailComponent }]),
    ],
    declarations: [
        CdRequestDetailComponent,
        CdRequestPeriodTabComponent,
        CdExpectedTrafficConfirmComponent,
        CdRequestNumberComfirmComponent,
        CdRequestPeriodComfirmComponent,
        CdCurrentRequestComfirmComponent,
        CdNumberListRequestTabComponent,
        CdNumberListRequestConfirmComponent,
        CdRequestNumberTabComponent,
        CdRequestNumberListComponent
    ],
    providers: [
        DatePickerService,
        CdRequestDetailService,
        CdRequestPeriodTabService,
        CdRequestPeriodComfirmService,
        CdNumberListRequestTabService,
        CdNumberListRequestComfirmService,
        CdRequestNumberTabService,
        CdRequestNumberListService
    ],
})
export class CdRequestDetailModule { }
