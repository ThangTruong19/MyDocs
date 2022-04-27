import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { KbaCommonModule } from '../shared/kba-common.module';

import { CarIndexComponent } from '../../components/flm/car/index/car-index.component';
import { CarBatchComponent } from '../../components/flm/car/batch/car-batch.component';
import { CarNewComponent } from '../../components/flm/car/new/car-new.component';
import { CarEditComponent } from '../../components/flm/car/edit/car-edit.component';
import { CarOperatorInitComponent } from '../../components/flm/car/operator-init/operator-init.component';
import { CarTerminalChangeComponent } from '../../components/flm/car/terminal-change/terminal-change.component';
import { CarTerminalStartSettingComponent } from '../../components/flm/car/terminal-start-setting/terminal-start-setting.component';
import { CarTimeDifferenceSettingComponent } from '../../components/flm/car/time-difference-setting/time-difference-setting.component';
import { SettingChangeComponent } from '../../components/flm/car/time-difference-setting/setting-change.component';

import { CarService } from '../../services/flm/car/car.service';
import { OperatorService } from '../../services/flm/operator/operator.service';

@NgModule({
  declarations: [
    CarIndexComponent,
    CarBatchComponent,
    CarOperatorInitComponent,
    CarNewComponent,
    CarEditComponent,
    CarTerminalStartSettingComponent,
    CarTerminalChangeComponent,
    CarTimeDifferenceSettingComponent,
    SettingChangeComponent,
  ],
  imports: [
    RouterModule.forChild([
      { path: '', component: CarIndexComponent },
      { path: 'new', component: CarNewComponent },
      { path: ':id/edit', component: CarEditComponent },
      { path: 'batch', component: CarBatchComponent },
      { path: 'operators/init', component: CarOperatorInitComponent },
      {
        path: 'terminal/start_setting',
        component: CarTerminalStartSettingComponent,
      },
      { path: 'terminal/change', component: CarTerminalChangeComponent },
      {
        path: 'time_difference_setting',
        component: CarTimeDifferenceSettingComponent,
      },
    ]),
    KbaCommonModule,
    NgbModule,
  ],
  entryComponents: [],
  providers: [CarService, OperatorService],
})
export class CarModule {}
