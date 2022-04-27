import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { KbaCommonModule } from '../shared/kba-common.module';

import { GroupAreaIndexComponent } from '../../components/flm/group-area/index/group-area-index.component';
import { GroupAreaNewComponent } from '../../components/flm/group-area/new/group-area-new.component';
import { GroupAreaCarIndexComponent } from '../../components/flm/group-area/car-index/car-index.component';
import { GroupAreaCarEditComponent } from '../../components/flm/group-area/car-edit/car-edit.component';
import { GroupAreaEditComponent } from '../../components/flm/group-area/edit/group-area-edit.component';
import { GroupAreaConfirmModalComponent } from '../../components/flm/group-area/shared/form/confirm-modal.component';
import { GroupAreaCarConfirmModalComponent } from '../../components/flm/group-area/car-edit/confirm-modal.component';
import { GroupAreaService } from '../../services/flm/group-area/group-area.service';
import { LandmarkService } from '../../services/flm/landmark/landmark.service';
import { CarService } from '../../services/flm/car/car.service';

@NgModule({
  declarations: [
    GroupAreaIndexComponent,
    GroupAreaNewComponent,
    GroupAreaCarIndexComponent,
    GroupAreaEditComponent,
    GroupAreaCarEditComponent,
    GroupAreaConfirmModalComponent,
    GroupAreaCarConfirmModalComponent,
  ],
  imports: [
    RouterModule.forChild([
      { path: '', component: GroupAreaIndexComponent },
      { path: 'new', component: GroupAreaNewComponent },
      { path: 'cars', component: GroupAreaCarIndexComponent },
      { path: ':id/edit', component: GroupAreaEditComponent },
      { path: 'cars/:id/edit', component: GroupAreaCarEditComponent },
    ]),
    KbaCommonModule,
  ],
  entryComponents: [
    GroupAreaConfirmModalComponent,
    GroupAreaCarConfirmModalComponent,
  ],
  providers: [GroupAreaService, LandmarkService, CarService],
})
export class GroupAreaModule {}
