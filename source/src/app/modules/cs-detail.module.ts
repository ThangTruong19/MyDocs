import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppCommonModule } from 'app/modules/shared/app-common.module';
import { CsGetRequestModule } from 'app/modules/cs-get-request.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomizeSettingService } from 'app/services/customize_setting/customize-setting.service';
import { CsDetailService } from 'app/services/customize_setting/cs-detail.service';
import { CsDetailComponent } from 'app/components/customize_setting/cs-detail.component';
import { CsEditComponent } from 'app/components/customize_setting/edit/cs-edit.component';
import { CsNewComponent } from 'app/components/customize_setting/new/cs-new.component';
import { CsUpdateRequestConfirmComponent } from 'app/components/customize_setting/update-request-confirm/cs-update-request-confirm.component';
import { CsImmediateUpdateRequestConfirmComponent } from 'app/components/customize_setting/immediate-update-request-confirm/cs-immediate-update-request-confirm.component';
import { CsRequestResendConfirmComponent } from 'app/components/customize_setting/request-resend-confirm/cs-request-resend-confirm.component';
import { CsInputDataCancelConfirmComponent } from 'app/components/customize_setting/input-data-cancel-confirm/cs-input-data-cancel-confirm.component';
import { CsExpectedTrafficConfirmComponent } from 'app/components/customize_setting/expected-traffic-confirm/cs-expected-traffic-confirm.component';

@NgModule({
    imports: [
        CommonModule,
        AppCommonModule,
        CsGetRequestModule,
        RouterModule.forChild([{ path: '', component: CsDetailComponent }]),
        NgbModule
    ],
    declarations: [
        CsDetailComponent,
        CsNewComponent,
        CsEditComponent,
        CsUpdateRequestConfirmComponent,
        CsImmediateUpdateRequestConfirmComponent,
        CsRequestResendConfirmComponent,
        CsInputDataCancelConfirmComponent,
        CsExpectedTrafficConfirmComponent
    ],
    providers: [
        CustomizeSettingService,
        CsDetailService
    ],
})
export class CsDetailModule { }