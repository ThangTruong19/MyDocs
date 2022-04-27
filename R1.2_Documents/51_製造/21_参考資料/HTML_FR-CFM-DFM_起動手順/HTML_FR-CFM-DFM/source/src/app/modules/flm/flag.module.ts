import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlagNewComponent } from '../../components/flm/flag/new/flag-new.component';
import { FlagService } from '../../services/flm/flag/flag.service';
import { KbaCommonModule } from '../shared/kba-common.module';
import { FlagIndexComponent } from '../../components/flm/flag/index/flag-index.component';
import { FlagEditComponent } from '../../components/flm/flag/edit/flag-edit.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: FlagIndexComponent },
      { path: 'new', component: FlagNewComponent },
      { path: ':id/edit', component: FlagEditComponent },
    ]),
    KbaCommonModule,
  ],
  declarations: [FlagIndexComponent, FlagNewComponent, FlagEditComponent],
  providers: [FlagService],
})
export class FlagModule {}
