import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import {
    AccordionComponent,
    AccordionHeaderComponent,
} from 'app/components/shared/accordion/accordion.component';

@NgModule({
    declarations: [AccordionComponent, AccordionHeaderComponent],
    imports: [CommonModule, NgbModule],
    exports: [AccordionComponent, AccordionHeaderComponent],
})
export class AccordionModule { }
