import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppCommonModule } from 'app/modules/shared/app-common.module';
import { MenuComponent } from 'app/components/menu/menu.component';

@NgModule({
    imports: [
        CommonModule,
        AppCommonModule,
        RouterModule.forChild([{ path: '', component: MenuComponent }]),
    ],
    declarations: [
        MenuComponent,
    ],
})
export class MenuModule { }
