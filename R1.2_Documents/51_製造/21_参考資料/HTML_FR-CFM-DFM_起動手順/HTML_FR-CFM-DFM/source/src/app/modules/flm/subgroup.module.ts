import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { KbaAccordionModule } from '../shared/kba-accordion.module';
import { KbaCommonModule } from '../shared/kba-common.module';

import { SubgroupNewComponent } from '../../components/flm/subgroup/new/subgroup-new.component';
import { SubgroupIndexComponent } from '../../components/flm/subgroup/index/subgroup-index.component';
import { SubgroupDetailComponent } from '../../components/flm/subgroup/index/detail/subgroup-detail.component';
import { SubgroupEditComponent } from '../../components/flm/subgroup/edit/subgroup-edit.component';

import { SubgroupService } from '../../services/flm/subgroup/subgroup.service';

@NgModule({
  declarations: [
    SubgroupNewComponent,
    SubgroupIndexComponent,
    SubgroupDetailComponent,
    SubgroupEditComponent,
  ],
  imports: [
    RouterModule.forChild([
      { path: 'new', component: SubgroupNewComponent },
      { path: '', component: SubgroupIndexComponent },
      { path: ':id/edit', component: SubgroupEditComponent },
    ]),
    KbaAccordionModule,
    KbaCommonModule,
  ],
  providers: [SubgroupService],
})
export class SubgroupModule {}
