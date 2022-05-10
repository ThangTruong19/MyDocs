import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppCommonModule } from 'app/modules/shared/app-common.module';
import { CarListComponent } from 'app/components/car-list/car-list.component';
import { CarListService } from 'app/services/car-list/car-list.service';

import { AuthorityMgtListComponent } from 'app/components/authority/authority-mgt-list.component';
import { UserService } from 'app/services/shared/user.service';
import { AuthoritySelectComponent } from 'app/components/authority/authority-select/authority-select.component';
import { AuthoritySelectModalComponent } from 'app/components/authority/authority-select-modal/authority-select-modal.component';
import { CsGetRequestComponent } from 'app/components/customize_setting/get-request/cs-get-request.component';

@NgModule({
    imports: [
        CommonModule,
        AppCommonModule,
        RouterModule.forChild([{ path: '', component: CarListComponent }]),
    ],
    declarations: [CarListComponent,
        // CsGetRequestComponent
    ],
    providers: [
        CarListService
    ],
})
export class CarListModule { }
