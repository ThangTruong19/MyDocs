import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { KbaTableComponent } from '../../components/shared/kba-table/kba-table.component';
import { KbaScrollLoadDirective } from '../../directives/kba-scroll-load/kba-scroll-load.directive';
import { KbaChangeTableHeightDirective } from '../../directives/kba-change-table-height/kba-change-table-height.directive';
import { KbaTableCheckboxDirective } from '../../directives/kba-table-checkbox/kba-table-checkbox.directive';
import { KbaSortingLabelDirective } from '../../directives/kba-sorting-label/kba-sorting-label.directive';

@NgModule({
  declarations: [
    KbaTableComponent,
    KbaScrollLoadDirective,
    KbaChangeTableHeightDirective,
    KbaTableCheckboxDirective,
    KbaSortingLabelDirective,
  ],
  imports: [CommonModule, NgbModule],
  exports: [KbaTableComponent, KbaSortingLabelDirective],
})
export class KbaTableModule {}
