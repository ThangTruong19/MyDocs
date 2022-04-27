import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { DndModule } from 'ngx-dnd';
import { AccordionModule } from 'app/modules/shared/accordion.module';

import {
    SidemenuComponent,
    SideMenuItemComponent,
} from 'app/components/shared/sidemenu/sidemenu.component';
import { RouterModule } from '@angular/router';

@NgModule({
    declarations: [SidemenuComponent, SideMenuItemComponent],
    imports: [
        CommonModule,
        //  DndModule.forRoot(),
        AccordionModule,
        RouterModule,
    ],
    exports: [SidemenuComponent, SideMenuItemComponent],
})
export class SidemenuModule { }
