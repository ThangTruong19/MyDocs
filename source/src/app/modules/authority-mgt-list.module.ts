import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppCommonModule } from 'app/modules/shared/app-common.module';
import { AuthorityMgtListComponent } from 'app/components/authority/authority-mgt-list.component';
import { UserService } from 'app/services/shared/user.service';
import { AuthoritySelectComponent } from 'app/components/authority/authority-select/authority-select.component';
import { AuthoritySelectModalComponent } from 'app/components/authority/authority-select-modal/authority-select-modal.component';

@NgModule({
    imports: [
        CommonModule,
        AppCommonModule,
        RouterModule.forChild([{ path: '', component: AuthorityMgtListComponent }]),
    ],
    declarations: [
        AuthorityMgtListComponent,
        AuthoritySelectComponent,
        AuthoritySelectModalComponent
    ],
    providers: [
        UserService
    ],
})
export class AuthorityMgtListModule { }
