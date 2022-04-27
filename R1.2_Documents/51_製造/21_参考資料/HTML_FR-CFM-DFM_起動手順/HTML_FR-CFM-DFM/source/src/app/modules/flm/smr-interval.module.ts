import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { KbaCommonModule } from '../shared/kba-common.module';

import { SmrIntervalNewComponent } from '../../components/flm/smr-interval/new/smr-interval-new.component';
import { SmrIntervalIndexComponent } from '../../components/flm/smr-interval/index/smr-interval-index.component';
import { SmrIntervalEditComponent } from '../../components/flm/smr-interval/edit/smr-interval-edit.component';
import { SmrIntervalCarIndexComponent } from '../../components/flm/smr-interval/car-index/smr-interval-car-index.component';
import { SmrIntervalCarEditComponent } from '../../components/flm/smr-interval/car-edit/smr-interval-car-edit.component';

import { SmrIntervalService } from '../../services/flm/smr-interval/smr-interval.service';

@NgModule({
  declarations: [
    SmrIntervalNewComponent,
    SmrIntervalIndexComponent,
    SmrIntervalEditComponent,
    SmrIntervalCarIndexComponent,
    SmrIntervalCarEditComponent,
  ],
  imports: [
    RouterModule.forChild([
      { path: 'new', component: SmrIntervalNewComponent },
      { path: '', component: SmrIntervalIndexComponent },
      { path: ':id/edit', component: SmrIntervalEditComponent },
      { path: 'cars', component: SmrIntervalCarIndexComponent },
      { path: 'cars/:id/edit', component: SmrIntervalCarEditComponent },
    ]),
    KbaCommonModule,
    NgbModule,
  ],
  providers: [SmrIntervalService],
})
export class SmrIntervalModule {}
