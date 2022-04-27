import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { KbaAccordionModule } from '../shared/kba-accordion.module';
import { KbaCommonModule } from '../shared/kba-common.module';
import { FlagConditionIndexComponent } from '../../components/opa/flag-condition/index/flag-condition-index.component';
import { FlagConditionNewComponent } from '../../components/opa/flag-condition/new/flag-condition-new.component';
import { FlagConditionEditComponent } from '../../components/opa/flag-condition/edit/flag-condition-edit.component';
import { FlagConditionService } from '../../services/opa/flag-condition/flag-condition.service';

@NgModule({
  declarations: [
    FlagConditionIndexComponent,
    FlagConditionNewComponent,
    FlagConditionEditComponent,
  ],
  imports: [
    RouterModule.forChild([
      { path: '', component: FlagConditionIndexComponent },
      { path: 'new', component: FlagConditionNewComponent },
      { path: ':id/edit', component: FlagConditionEditComponent },
    ]),
    KbaAccordionModule,
    KbaCommonModule,
  ],
  providers: [FlagConditionService],
})
export class FlagConditionModule {}
