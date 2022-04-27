import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { KbaGroupSelectModalComponent } from '../../components/shared/kba-group-select-modal/kba-group-select-modal.component';
import { KbaGroupSelectCheckboxDirective } from '../../directives/kba-group-select-checkbox/kba-group-select-checkbox.directive';

@NgModule({
  imports: [CommonModule, NgbModule, FormsModule],
  declarations: [KbaGroupSelectModalComponent, KbaGroupSelectCheckboxDirective],
  exports: [KbaGroupSelectModalComponent],
})
export class KbaGroupSelectModalModule {}
