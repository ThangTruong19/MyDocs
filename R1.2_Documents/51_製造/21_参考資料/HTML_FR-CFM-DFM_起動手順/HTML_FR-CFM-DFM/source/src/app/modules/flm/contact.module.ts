import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { KbaCommonModule } from '../shared/kba-common.module';

import { ContactIndexComponent } from '../../components/flm/contact/index/contact-index.component';
import { ContactNewComponent } from '../../components/flm/contact/new/contact-new.component';
import { PhotoModalComponent } from '../../components/flm/contact/shared/form/photo-modal.component';
import { ContactCustomerIndexComponent } from '../../components/flm/contact/customer-index/customer-index.component';
import { ContactService } from '../../services/flm/contact/contact.service';
import { ContactEditComponent } from '../../components/flm/contact/edit/contact-edit.component';
import { ContactCustomerEditComponent } from '../../components/flm/contact/customer-edit/customer-edit.component';

@NgModule({
  declarations: [
    ContactIndexComponent,
    ContactNewComponent,
    PhotoModalComponent,
    ContactCustomerIndexComponent,
    ContactEditComponent,
    ContactCustomerEditComponent,
  ],
  imports: [
    RouterModule.forChild([
      { path: '', component: ContactIndexComponent },
      { path: 'new', component: ContactNewComponent },
      { path: ':id/edit', component: ContactEditComponent },
      { path: 'customers', component: ContactCustomerIndexComponent },
      { path: 'customers/:id/edit', component: ContactCustomerEditComponent },
    ]),
    KbaCommonModule,
  ],
  entryComponents: [PhotoModalComponent],
  providers: [ContactService],
})
export class ContactModule {}
