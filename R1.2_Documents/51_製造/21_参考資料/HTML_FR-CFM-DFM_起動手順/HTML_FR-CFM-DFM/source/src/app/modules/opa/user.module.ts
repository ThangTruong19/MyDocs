import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { KbaAccordionModule } from '../shared/kba-accordion.module';
import { KbaCommonModule } from '../shared/kba-common.module';

import { UserIndexComponent } from '../../components/opa/user/index/user-index.component';
import { UserNewComponent } from '../../components/opa/user/new/user-new.component';
import { UserEditComponent } from '../../components/opa/user/edit/user-edit.component';
import { UserExportComponent } from '../../components/opa/user/export/user-export.component';
import { CustomUserFormModalComponent } from '../../components/opa/user/shared/modal/custom-user-form-modal.component';

import { UserService } from '../../services/opa/user/user.service';

@NgModule({
  declarations: [
    UserIndexComponent,
    UserNewComponent,
    UserEditComponent,
    UserExportComponent,
    CustomUserFormModalComponent,
  ],
  imports: [
    RouterModule.forChild([
      { path: '', component: UserIndexComponent },
      { path: 'new', component: UserNewComponent },
      { path: ':id/edit', component: UserEditComponent },
      { path: 'export', component: UserExportComponent },
    ]),
    KbaAccordionModule,
    KbaCommonModule,
  ],
  providers: [UserService],
})
export class UserModule {}
