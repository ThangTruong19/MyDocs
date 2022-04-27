import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { KbaCommonModule } from '../shared/kba-common.module';

import { LandmarkNewComponent } from '../../components/flm/landmark/new/landmark-new.component';
import { LandmarkConfirmModalComponent } from '../../components/flm/landmark/shared/form/confirm-modal.component';
import { LandmarkIndexComponent } from '../../components/flm/landmark/index/landmark-index.component';
import { LandmarkEditComponent } from '../../components/flm/landmark/edit/landmark-edit.component';

import { LandmarkService } from '../../services/flm/landmark/landmark.service';

@NgModule({
  declarations: [
    LandmarkNewComponent,
    LandmarkConfirmModalComponent,
    LandmarkIndexComponent,
    LandmarkEditComponent,
  ],
  imports: [
    RouterModule.forChild([
      { path: 'new', component: LandmarkNewComponent },
      { path: '', component: LandmarkIndexComponent },
      { path: ':id/edit', component: LandmarkEditComponent },
    ]),
    KbaCommonModule,
    NgbModule,
  ],
  entryComponents: [LandmarkConfirmModalComponent],
  providers: [LandmarkService],
})
export class LandmarkModule {}
