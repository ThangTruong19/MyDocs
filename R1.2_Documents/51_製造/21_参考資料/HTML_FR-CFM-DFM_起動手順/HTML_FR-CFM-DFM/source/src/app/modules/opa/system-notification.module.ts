import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { KbaAccordionModule } from '../shared/kba-accordion.module';
import { KbaCommonModule } from '../shared/kba-common.module';
import { KbaGroupSelectModalModule } from '../shared/kba-group-select-modal.module';

import { SystemNotificationIndexComponent } from '../../components/opa/system-notification/index/system-notification-index.component';
import { SystemNotificationNewComponent } from '../../components/opa/system-notification/new/system-notification-new.component';
import { SystemNotificationEditComponent } from '../../components/opa/system-notification/edit/system-notification-edit.component';
import { CustomSystemNotificationFormModalComponent } from '../../components/opa/system-notification/shared/modal/custom-system-notification-form-modal.component';
import { SystemNotificationService } from '../../services/opa/system-notification/system-notification.service';

@NgModule({
  declarations: [
    SystemNotificationIndexComponent,
    SystemNotificationNewComponent,
    SystemNotificationEditComponent,
    CustomSystemNotificationFormModalComponent,
  ],
  imports: [
    RouterModule.forChild([
      { path: '', component: SystemNotificationIndexComponent },
      { path: 'new', component: SystemNotificationNewComponent },
      { path: ':id/edit', component: SystemNotificationEditComponent },
    ]),
    KbaAccordionModule,
    KbaGroupSelectModalModule,
    KbaCommonModule,
  ],
  providers: [SystemNotificationService],
})
export class SystemNotificationModule {}
