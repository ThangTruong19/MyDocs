import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { KbaCommonModule } from '../shared/kba-common.module';

import { RentalCarEditComponent } from '../../components/flm/rental-car/edit/rental-car-edit.component';
import { RentalCarIndexComponent } from '../../components/flm/rental-car/index/rental-car-index.component';

import { RentalCarService } from '../../services/flm/rental-car/rental-car.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: RentalCarIndexComponent },
      { path: ':id/edit', component: RentalCarEditComponent },
    ]),
    KbaCommonModule,
  ],
  declarations: [RentalCarIndexComponent, RentalCarEditComponent],
  providers: [RentalCarService],
})
export class RentalCarModule {}
