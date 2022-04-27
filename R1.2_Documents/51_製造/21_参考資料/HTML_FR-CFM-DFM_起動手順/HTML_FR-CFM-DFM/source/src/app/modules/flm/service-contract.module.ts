import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

import { KbaCommonModule } from '../shared/kba-common.module';

import { ServiceContractApplyIndexComponent } from '../../components/flm/service-contract/apply-index/service-contract-apply-index.component';
import { ChangeServiceDistributorComponent } from '../../components/flm/service-contract/apply-index/change-service-distributor.component';
import { ServiceContractApproveRejectComponent } from '../../components/flm/service-contract/approve-reject/service-contract-approve-reject.component';

import { ServiceContractService } from '../../services/flm/service-contract/service-contract.service';

@NgModule({
  declarations: [
    ServiceContractApplyIndexComponent,
    ChangeServiceDistributorComponent,
    ServiceContractApproveRejectComponent,
  ],
  imports: [
    RouterModule.forChild([
      { path: 'consignors', component: ServiceContractApplyIndexComponent },
      { path: 'consignees', component: ServiceContractApproveRejectComponent },
    ]),
    CommonModule,
    KbaCommonModule,
    NgbModule,
  ],
  entryComponents: [],
  providers: [ServiceContractService],
})
export class ServiceContractModule {}
