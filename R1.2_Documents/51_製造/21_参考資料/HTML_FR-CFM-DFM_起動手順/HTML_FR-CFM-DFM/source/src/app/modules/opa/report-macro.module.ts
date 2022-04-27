import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { KbaCommonModule } from '../shared/kba-common.module';
import { ReportMacroComponent } from '../../components/opa/report-macro/report-macro.component';
import { ReportMacroService } from '../../services/opa/report-macro/report-macro.service';

@NgModule({
  imports: [
    CommonModule,
    KbaCommonModule,
    RouterModule.forChild([{ path: '', component: ReportMacroComponent }]),
  ],
  declarations: [ReportMacroComponent],
  providers: [ReportMacroService],
})
export class ReportMacroModule {}
