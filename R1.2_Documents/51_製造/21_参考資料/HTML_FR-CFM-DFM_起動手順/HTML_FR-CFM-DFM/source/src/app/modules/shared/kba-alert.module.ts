import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { KbaAlertComponent } from '../../components/shared/kba-alert/kba-alert.component';

@NgModule({
  imports: [CommonModule, NgbModule],
  declarations: [KbaAlertComponent],
  exports: [KbaAlertComponent],
})
export class KbaAlertModule {}
