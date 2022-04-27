import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import {
  KbaAccordionComponent,
  KbaAccordionHeaderComponent,
} from '../../components/shared/kba-accordion/kba-accordion.component';

@NgModule({
  declarations: [KbaAccordionComponent, KbaAccordionHeaderComponent],
  imports: [CommonModule, NgbModule],
  exports: [KbaAccordionComponent, KbaAccordionHeaderComponent],
})
export class KbaAccordionModule {}
