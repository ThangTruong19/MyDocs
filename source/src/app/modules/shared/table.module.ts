import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppCommonTableComponent } from 'app/components/shared/common-table/common-table.component';
import { ScrollLoadDirective } from 'app/directives/scroll-load/scroll-load.directive';
import { ChangeTableHeightDirective } from 'app/directives/change-table-height/change-table-height.directive';
import { TableCheckboxDirective } from 'app/directives/table-checkbox/table-checkbox.directive';
import { SortingLabelDirective } from 'app/directives/sorting-label/sorting-label.directive';
import { CommonTableService } from 'app/services/shared/common-table.service';

@NgModule({
    declarations: [
        AppCommonTableComponent,
        ScrollLoadDirective,
        ChangeTableHeightDirective,
        TableCheckboxDirective,
        SortingLabelDirective,
    ],
    imports: [CommonModule, NgbModule],
    exports: [AppCommonTableComponent, SortingLabelDirective],
    providers: [
        CommonTableService,
    ],
})
export class TableModule { }
