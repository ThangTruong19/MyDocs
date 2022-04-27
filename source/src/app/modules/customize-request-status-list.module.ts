import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppCommonModule } from 'app/modules/shared/app-common.module';
import { CustomizeRequestStatusListComponent } from 'app/components/customize_request_status/customize-request-status-list.component';
import { CustomizeRequestStatusListService } from 'app/services/customize_request_status/customize-request-status-list.service';

@NgModule({
    imports: [
        CommonModule,
        AppCommonModule,
        RouterModule.forChild([{ path: '', component: CustomizeRequestStatusListComponent }]),
    ],
    declarations: [CustomizeRequestStatusListComponent],
    providers: [
        CustomizeRequestStatusListService,
    ],
})
export class CustomizeRequestStatusListModule { }
