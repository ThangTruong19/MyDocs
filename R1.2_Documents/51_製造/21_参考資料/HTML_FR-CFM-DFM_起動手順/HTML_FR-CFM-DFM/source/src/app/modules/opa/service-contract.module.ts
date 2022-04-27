import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { KbaCommonModule } from '../shared/kba-common.module';
import { ServiceContractComponent } from '../../components/opa/service-contract/service-contract.component';
import { ServiceContractService } from '../../services/opa/service-contract/service-contract.service';

@NgModule({
  imports: [
    CommonModule,
    KbaCommonModule,
    RouterModule.forChild([{ path: '', component: ServiceContractComponent }]),
  ],
  declarations: [ServiceContractComponent],
  providers: [ServiceContractService],
})
export class ServiceContractModule {}
