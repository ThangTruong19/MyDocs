import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KbaCommonModule } from '../shared/kba-common.module';
import { RouterModule } from '@angular/router';
import { GroupNewComponent } from '../../components/opa/group/new/group-new.component';
import { GroupService } from '../../services/opa/group/group.service';
import { GroupIndexComponent } from '../../components/opa/group/index/group-index.component';
import { GroupDetailModalComponent } from '../../components/opa/group/shared/detail-modal/detail-modal.component';
import { GroupEditComponent } from '../../components/opa/group/edit/group-edit.component';
import { GroupPublishComponent } from '../../components/opa/group/publish/group-publish.component';
import { ScopeSearchModalComponent } from '../../components/opa/group/shared/scope-search-modal/scope-search-modal.component';
import { GroupCustomerPublishComponent } from '../../components/opa/group/customer-publish/group-customer-publish.component';
import { GroupIntegrationComponent } from '../../components/opa/group/integration/group-integration.component';

@NgModule({
  imports: [
    CommonModule,
    KbaCommonModule,
    RouterModule.forChild([
      { path: 'new', component: GroupNewComponent },
      { path: '', component: GroupIndexComponent },
      { path: ':id/edit', component: GroupEditComponent },
      { path: 'publish', component: GroupPublishComponent },
      { path: 'customer_publish', component: GroupCustomerPublishComponent },
      { path: 'integration', component: GroupIntegrationComponent },
    ]),
  ],
  declarations: [
    GroupNewComponent,
    GroupIndexComponent,
    GroupEditComponent,
    GroupPublishComponent,
    GroupDetailModalComponent,
    ScopeSearchModalComponent,
    GroupCustomerPublishComponent,
    GroupIntegrationComponent,
  ],
  providers: [GroupService],
})
export class GroupModule {}
