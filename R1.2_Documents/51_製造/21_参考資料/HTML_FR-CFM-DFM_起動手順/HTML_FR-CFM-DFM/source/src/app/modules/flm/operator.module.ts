/* tslint:disable:max-line-length */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { KbaAccordionModule } from '../shared/kba-accordion.module';
import { KbaCommonModule } from '../shared/kba-common.module';
import { KbaFileUploadModule } from '../shared/kba-file-upload.module';

import { OperatorIndexComponent } from '../../components/flm/operator/index/operator-index.component';
import { OperatorRegisterComponent } from '../../components/flm/operator/index/operator-register.component';
import { OperatorIdBatchComponent } from '../../components/flm/operator/batch/batch.component';
import { KeyCarIndexComponent } from '../../components/flm/operator/key-car-index/key-car-index.component';
import { OperatorInputCarIndexComponent } from '../../components/flm/operator/input-car-index/operator-input-car-index.component';
import { OperatorInputCarDetailComponent } from '../../components/flm/operator/input-car-index/operator-input-car-detail.component';
import { OperatorInputCarBatchDeleteComponent } from '../../components/flm/operator/input-car-index/operator-input-car-batch-delete.component';
import { OperatorInputCarBatchSettingComponent } from '../../components/flm/operator/input-car-index/operator-input-car-batch-setting.component';
import { OperatorIdKeyIndexComponent } from '../../components/flm/operator/id-key-index/id-key-index.component';

import { OperatorService } from '../../services/flm/operator/operator.service';
/* tslint:enable:max-line-length */

@NgModule({
  declarations: [
    OperatorIndexComponent,
    OperatorRegisterComponent,
    OperatorIdBatchComponent,
    KeyCarIndexComponent,
    OperatorInputCarIndexComponent,
    OperatorInputCarDetailComponent,
    OperatorInputCarBatchDeleteComponent,
    OperatorInputCarBatchSettingComponent,
    OperatorIdKeyIndexComponent,
  ],
  imports: [
    RouterModule.forChild([
      { path: '', component: OperatorIndexComponent },
      { path: 'batch', component: OperatorIdBatchComponent },
      { path: 'cars/id_key', component: KeyCarIndexComponent },
      { path: 'cars/id_input', component: OperatorInputCarIndexComponent },
      { path: 'id_keys', component: OperatorIdKeyIndexComponent },
    ]),
    KbaAccordionModule,
    KbaCommonModule,
    KbaFileUploadModule,
  ],
  providers: [OperatorService],
})
export class OperatorModule {}
