import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CdRequestDetailComponent } from 'app/components/customize_data_request/cd-request-detail/cd-request-detail.component';
import { CdNumberListRequestConfirmComponent } from 'app/components/customize_data_request/number-list-request/cd-number-list-request-confirm/cd-number-list-request-confirm.component';
import { CdNumberListRequestTabComponent } from 'app/components/customize_data_request/number-list-request/cd-number-list-request-tab/cd-number-list-request-tab.component';
import { CdRequestNumberTabComponent } from 'app/components/customize_data_request/request-number/cd-request-number-tab/cd-request-number-tab.component';
import { CdExpectedTrafficConfirmComponent } from 'app/components/customize_data_request/request-number/expected-traffic-comfirm/cd-expected-traffic-confirm/cd-expected-traffic-confirm.component';
import { InputDataAllCancelConfirmComponent } from 'app/components/customize_data_request/request-number/input-data-all-cancel-confirm/input-data-all-cancel-confirm.component';
import { InputDataCancelConfirmComponent } from 'app/components/customize_data_request/request-number/input-data-cancel-confirm/input-data-cancel-confirm.component';
import { CdRequestNumberComfirmComponent } from 'app/components/customize_data_request/request-number/request-number-comfirm/cd-request-number-comfirm/cd-request-number-comfirm.component';
import { CdRequestNumberListComponent } from 'app/components/customize_data_request/request-number/request-number-list/cd-request-number-list.component';
import { CdRequestNumberSelectListComponent } from 'app/components/customize_data_request/request-number/request-number-select-list/cd-request-number-select-list.component';
import { CdRequestPeriodTabComponent } from 'app/components/customize_data_request/request-period/cd-request-period-tab/cd-request-period-tab.component';
import { CdCurrentRequestComfirmComponent } from 'app/components/customize_data_request/request-period/current-request-comfirm/cd-current-request-comfirm/cd-current-request-comfirm.component';
import { CdRequestPeriodComfirmComponent } from 'app/components/customize_data_request/request-period/request-period-comfirm/cd-request-period-comfirm/cd-request-period-comfirm.component';
import { AppCommonModule } from 'app/modules/shared/app-common.module';
import { CdRequestDetailService } from 'app/services/customize_data_request/cd-request-detail/cd-request-detail.service';
import { CdNumberListRequestComfirmService } from 'app/services/customize_data_request/number-list-request/cd-number-list-request-confirm/cd-request-period-comfirm.service';
import { CdNumberListRequestTabService } from 'app/services/customize_data_request/number-list-request/cd-number-list-request-tab/cd-number-list-request-tab.service';
import { CdRequestNumberConfirmService } from 'app/services/customize_data_request/request-number/cd-request-number-tab/cd-request-number-confirm.service';
import { CdRequestNumberListService } from 'app/services/customize_data_request/request-number/cd-request-number-tab/cd-request-number-list.service';
import { CdRequestNumberTabService } from 'app/services/customize_data_request/request-number/cd-request-number-tab/cd-request-number-tab.service';
import { CdRequestPeriodTabService } from 'app/services/customize_data_request/request-period/cd-request-period-tab/cd-request-period-tab.service';
import { CdRequestPeriodComfirmService } from 'app/services/customize_data_request/request-period/request-period-comfirm/cd-request-period-comfirm.service';
import { DatePickerService } from 'app/services/shared/date-picker.service';


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
        CdRequestNumberListComponent,
        CdRequestNumberSelectListComponent,
        InputDataAllCancelConfirmComponent,
        InputDataCancelConfirmComponent,
    ],
    providers: [
        DatePickerService,
        CdRequestDetailService,
        CdRequestPeriodTabService,
        CdRequestPeriodComfirmService,
        CdNumberListRequestTabService,
        CdNumberListRequestComfirmService,
        CdRequestNumberTabService,
        CdRequestNumberListService,
        CdRequestNumberConfirmService
    ],
})
export class CdRequestDetailModule { }
