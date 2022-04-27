import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { KbaAccordionModule } from '../shared/kba-accordion.module';
import { KbaCommonModule } from '../shared/kba-common.module';

import { CustomerNewComponent } from '../../components/flm/customer/new/customer-new.component';
import { CustomerIndexComponent } from '../../components/flm/customer/index/customer-index.component';
import { CustomerDetailComponent } from '../../components/flm/customer/index/detail/customer-detail.component';
import { CustomerEditComponent } from '../../components/flm/customer/edit/customer-edit.component';
import { CustomerBatchComponent } from '../../components/flm/customer/batch/customer-batch.component';

import { CustomerService } from '../../services/flm/customer/customer.service';

@NgModule({
  declarations: [
    CustomerNewComponent,
    CustomerIndexComponent,
    CustomerDetailComponent,
    CustomerEditComponent,
    CustomerBatchComponent,
  ],
  imports: [
    RouterModule.forChild([
      { path: 'new', component: CustomerNewComponent },
      { path: '', component: CustomerIndexComponent },
      { path: ':id/edit', component: CustomerEditComponent },
      { path: 'batch', component: CustomerBatchComponent },
    ]),
    KbaAccordionModule,
    KbaCommonModule,
  ],
  providers: [CustomerService],
})
export class CustomerModule {}
