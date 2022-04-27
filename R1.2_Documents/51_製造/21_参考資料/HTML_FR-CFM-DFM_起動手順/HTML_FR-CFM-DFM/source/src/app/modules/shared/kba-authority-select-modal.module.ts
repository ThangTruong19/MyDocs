import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { KbaAuthoritySelectModalComponent } from '../../components/shared/kba-authority-select-modal/kba-authority-select-modal.component';
import { KbaAuthoritySelectCheckboxDirective } from '../../directives/kba-authority-select-checkbox/kba-authority-select-checkbox.directive';

@NgModule({
  imports: [CommonModule, NgbModule, FormsModule],
  declarations: [
    KbaAuthoritySelectModalComponent,
    KbaAuthoritySelectCheckboxDirective,
  ],
  exports: [KbaAuthoritySelectModalComponent],
})
export class KbaAuthoritySelectModalModule {}
