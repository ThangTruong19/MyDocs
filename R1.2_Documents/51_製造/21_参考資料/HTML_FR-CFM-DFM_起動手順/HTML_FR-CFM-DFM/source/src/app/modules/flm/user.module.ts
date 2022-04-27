import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { KbaAccordionModule } from '../shared/kba-accordion.module';
import { KbaCommonModule } from '../shared/kba-common.module';
import { KbaAuthoritySelectModalModule } from '../shared/kba-authority-select-modal.module';

import { UserNewComponent } from '../../components/flm/user/new/user-new.component';
import { UserIndexComponent } from '../../components/flm/user/index/user-index.component';
import { CustomUserFormModalComponent } from '../../components/flm/user/shared/modal/custom-user-form-modal.component';
import { UserEditComponent } from '../../components/flm/user/edit/user-edit.component';

import { UserService } from '../../services/flm/user/user.service';

@NgModule({
  declarations: [
    UserIndexComponent,
    UserNewComponent,
    UserEditComponent,
    CustomUserFormModalComponent,
  ],
  imports: [
    RouterModule.forChild([
      { path: '', component: UserIndexComponent },
      { path: 'new', component: UserNewComponent },
      { path: ':id/edit', component: UserEditComponent },
    ]),
    KbaAccordionModule,
    KbaCommonModule,
  ],
  providers: [UserService],
})
export class UserModule {}
