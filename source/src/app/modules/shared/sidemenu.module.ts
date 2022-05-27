import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'app/modules/shared/accordion.module';
import {
    SidemenuComponent,
    SideMenuItemComponent,
} from 'app/components/shared/sidemenu/sidemenu.component';
import { RouterModule } from '@angular/router';
import { DragulaModule } from 'ng2-dragula';
// import { DndModule } from 'ngx-dnd';

@NgModule({
    declarations: [SidemenuComponent, SideMenuItemComponent],
    imports: [
        AccordionModule,
        CommonModule,
        //  DndModule.forRoot(),
        RouterModule,
        DragulaModule.forRoot(),
    ],
    exports: [SidemenuComponent, SideMenuItemComponent],
})
export class SidemenuModule { }
