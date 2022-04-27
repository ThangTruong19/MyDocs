import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DndModule } from 'ngx-dnd';
import { KbaAccordionModule } from '../../modules/shared/kba-accordion.module';

import {
  KbaSidemenuComponent,
  KbaSideMenuItemComponent,
} from '../../components/shared/kba-sidemenu/kba-sidemenu.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [KbaSidemenuComponent, KbaSideMenuItemComponent],
  imports: [
    CommonModule,
    DndModule.forRoot(),
    KbaAccordionModule,
    RouterModule,
  ],
  exports: [KbaSidemenuComponent, KbaSideMenuItemComponent],
})
export class KbaSidemenuModule {}
