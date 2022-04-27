import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { KbaCommonModule } from '../shared/kba-common.module';

import { HistoryComponent } from '../../components/flm/history/history.component';

import { HistoryService } from '../../services/flm/history/history.service';

@NgModule({
  imports: [
    CommonModule,
    KbaCommonModule,
    RouterModule.forChild([{ path: '', component: HistoryComponent }]),
  ],
  declarations: [HistoryComponent],
  providers: [HistoryService],
})
export class HistoryModule {}
