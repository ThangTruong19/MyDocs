import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { KbaCommonModule } from '../shared/kba-common.module';

import { FuelNewComponent } from '../../components/flm/fuel/new/fuel-new.component';
import { FuelEditComponent } from '../../components/flm/fuel/edit/fuel-edit.component';
import { FuelIndexComponent } from '../../components/flm/fuel/index/fuel-index.component';
import { FuelCarIndexComponent } from '../../components/flm/fuel/car-index/fuel-car-index.component';
import { FuelCarEditComponent } from '../../components/flm/fuel/car-edit/fuel-car-edit.component';

import { FuelService } from '../../services/flm/fuel/fuel.service';

@NgModule({
  declarations: [
    FuelNewComponent,
    FuelIndexComponent,
    FuelEditComponent,
    FuelCarIndexComponent,
    FuelCarEditComponent,
  ],
  imports: [
    RouterModule.forChild([
      { path: 'new', component: FuelNewComponent },
      { path: ':id/edit', component: FuelEditComponent },
      { path: '', component: FuelIndexComponent },
      { path: 'cars', component: FuelCarIndexComponent },
      { path: 'cars/:id/edit', component: FuelCarEditComponent },
    ]),
    KbaCommonModule,
    NgbModule,
  ],
  providers: [FuelService],
})
export class FuelModule {}
