import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppCommonModule } from 'app/modules/shared/app-common.module';
import { CsGetRequestModule } from 'app/modules/cs-get-request.module';
import { CarListComponent } from 'app/components/car-list/car-list.component';
import { CarListService } from 'app/services/car-list/car-list.service';
import { CsDetailService } from 'app/services/customize_setting/cs-detail.service';

@NgModule({
    imports: [
        CommonModule,
        AppCommonModule,
        CsGetRequestModule,
        RouterModule.forChild([{ path: '', component: CarListComponent }]),
    ],
    declarations: [
        CarListComponent,
    ],
    providers: [
        CarListService,
        CsDetailService
    ],
})
export class CarListModule { }
