import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KbaCommonModule } from '../shared/kba-common.module';
import { RouterModule } from '@angular/router';
import { CustomCarAttributeService } from '../../services/opa/custom-car-attribute/custom-car-attribute.service';
import { CustomCarAttributeNewComponent } from '../../components/opa/custom-car-attribute/new/custom-car-attribute-new.component';
import { CustomCarAttributeIndexComponent } from '../../components/opa/custom-car-attribute/index/custom-car-attribute-index.component';
import { CustomCarAttributeDetailModalComponent } from '../../components/opa/custom-car-attribute/shared/modal/custom-car-attribute-detail-modal.component';
import { CustomCarAttributeEditComponent } from '../../components/opa/custom-car-attribute/edit/custom-car-attribute-edit.component';

@NgModule({
  imports: [
    CommonModule,
    KbaCommonModule,
    RouterModule.forChild([
      { path: 'new', component: CustomCarAttributeNewComponent },
      { path: '', component: CustomCarAttributeIndexComponent },
      { path: ':id/edit', component: CustomCarAttributeEditComponent },
    ]),
  ],
  declarations: [
    CustomCarAttributeNewComponent,
    CustomCarAttributeIndexComponent,
    CustomCarAttributeDetailModalComponent,
    CustomCarAttributeEditComponent,
  ],
  providers: [CustomCarAttributeService],
})
export class CustomCarAttributeModule {}
