import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppCommonModule } from 'app/modules/shared/app-common.module';
import { CarListComponent } from 'app/components/car-list/car-list.component';
import { CarListService } from 'app/services/car-list/car-list.service';

@NgModule({
    imports: [
        CommonModule,
        AppCommonModule,
        RouterModule.forChild([{ path: '', component: CarListComponent }]),
    ],
    declarations: [CarListComponent],
    providers: [
        CarListService
    ],
})
export class CarListModule { }
