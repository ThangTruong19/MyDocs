import { NgModule } from '@angular/core';
import { SupportDistributorChangeConsigneeComponent } from '../../components/flm/support-distributor-change/consignee/support-distributor-change-consignee.component';
import { CarSupportDistributorChangeConsignorComponent } from '../../components/flm/support-distributor-change/consignor/support-distributor-change-consignor.component';
import { KbaCommonModule } from '../shared/kba-common.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { ChangeConsignorComponent } from '../../components/flm/support-distributor-change/consignor/change-consignor.component';
import { SupportDistributorChangeService } from '../../services/flm/support-distributor-change/support-distributor-change.service';
import { CarService } from '../../services/flm/car/car.service';

@NgModule({
  imports: [
    KbaCommonModule,
    NgbModule,
    RouterModule.forChild([
      {
        path: 'consignee',
        component: SupportDistributorChangeConsigneeComponent,
      },
      {
        path: 'consignor',
        component: CarSupportDistributorChangeConsignorComponent,
      },
    ]),
  ],
  declarations: [
    SupportDistributorChangeConsigneeComponent,
    CarSupportDistributorChangeConsignorComponent,
    ChangeConsignorComponent,
  ],
  providers: [SupportDistributorChangeService, CarService],
})
export class SupportDistributorChangeModule {}
