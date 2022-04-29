import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppCommonModule } from 'app/modules/shared/app-common.module';
import { AuthorityMgtListComponent } from 'app/components/authority/authority-mgt-list.component';
import { UserService } from 'app/services/shared/user.service';
import { AuthoritySelectComponent } from 'app/components/authority/authority-select/authority-select.component';

@NgModule({
    imports: [
        CommonModule,
        AppCommonModule,
        RouterModule.forChild([{ path: '', component: AuthorityMgtListComponent }]),
    ],
    declarations: [
        AuthorityMgtListComponent,
        AuthoritySelectComponent
    ],
    providers: [
        UserService
    ],
})
export class AuthorityMgtListModule { }
