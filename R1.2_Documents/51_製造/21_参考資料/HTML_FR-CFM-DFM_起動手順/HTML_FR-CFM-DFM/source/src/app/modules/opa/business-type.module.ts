import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { KbaCommonModule } from '../shared/kba-common.module';

import { BusinessTypeNewComponent } from '../../components/opa/business-type/new/business-type-new.component';
import { BusinessTypeIndexComponent } from '../../components/opa/business-type/index/business-type-index.component';
import { BusinessTypeEditComponent } from '../../components/opa/business-type/edit/business-type-edit.component';
import { BusinessTypeBatchComponent } from '../../components/opa/business-type/batch/business-type-batch.component';

import { BusinessTypeService } from '../../services/opa/business-type/business-type.service';

@NgModule({
  imports: [
    CommonModule,
    KbaCommonModule,
    RouterModule.forChild([
      { path: 'new', component: BusinessTypeNewComponent },
      { path: '', component: BusinessTypeIndexComponent },
      { path: ':id/edit', component: BusinessTypeEditComponent },
      { path: 'batch', component: BusinessTypeBatchComponent },
    ]),
  ],
  declarations: [
    BusinessTypeNewComponent,
    BusinessTypeIndexComponent,
    BusinessTypeEditComponent,
    BusinessTypeBatchComponent,
  ],
  providers: [BusinessTypeService],
})
export class BusinessTypeModule {}
