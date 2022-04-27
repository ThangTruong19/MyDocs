import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppCommonModule } from 'app/modules/shared/app-common.module';
import { AuthorityMgtListComponent } from 'app/components/authority/authority-mgt-list.component';
import { UserService } from 'app/services/shared/user.service';

@NgModule({
    imports: [
        CommonModule,
        AppCommonModule,
        RouterModule.forChild([{ path: '', component: AuthorityMgtListComponent }]),
    ],
    declarations: [AuthorityMgtListComponent],
    providers: [
        UserService
    ],
})
export class AuthorityMgtListModule { }
