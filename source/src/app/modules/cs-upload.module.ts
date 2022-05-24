import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppCommonModule } from 'app/modules/shared/app-common.module';
import { CsUploadComponent } from 'app/components/customize-setting-upload/cs-upload.component';
import { CsUploadService } from 'app/services/cs-upload/cs-upload.service';
import { DatePickerService } from 'app/services/shared//date-picker.service';
import { CustomizeSettingUploadService } from 'app/services/customize-setting-upload/customize-setting-upload.service';

@NgModule({
    imports: [
        CommonModule,
        AppCommonModule,
        RouterModule.forChild([{ path: '', component: CsUploadComponent }]),
    ],
    declarations: [CsUploadComponent],
    providers: [
        CsUploadService,
        CustomizeSettingUploadService,
        // TODO:
        DatePickerService
    ],
})
export class CsUploadModule { }
