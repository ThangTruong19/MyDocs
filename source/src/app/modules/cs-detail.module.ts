import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CsDetailComponent } from "app/components/customize_setting/cs-detail.component";
import { CsEditComponent } from "app/components/customize_setting/edit/cs-edit.component";
import { CsGetRequestComponent } from "app/components/customize_setting/get-request/cs-get-request.component";
import { CsNewComponent } from "app/components/customize_setting/new/cs-new.component";
import { CustomizeSettingService } from "app/services/customize_setting/customize-setting.service";
import { CsDetailService } from 'app/services/customize_setting/cs-detail.service';
import { AppCommonModule } from "./shared/app-common.module";

@NgModule({
    imports: [
        CommonModule,
        AppCommonModule,
        RouterModule.forChild([{ path: '', component: CsDetailComponent }]),
    ],
    declarations: [
        CsDetailComponent,
        CsNewComponent,
        CsEditComponent,
        CsGetRequestComponent
    ],
    providers: [
        CustomizeSettingService,
        CsDetailService
    ],
})
export class CsDetailModule { }