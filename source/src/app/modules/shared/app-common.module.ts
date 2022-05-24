import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { AccordionModule } from 'app/modules/shared/accordion.module';
import { AlertModule } from 'app/modules/shared/alert.module';
import { AppCommonButtonComponent } from 'app/components/shared/common-button/common-button.component';
import { AppCommonTextComponent } from 'app/components/shared/common-text/common-text.component';
import { AppFileUploadModule } from 'app/modules/shared/app-file-upload.module';
import { AtPipe } from 'app/pipes/at.pipe';
import { AuthoritySelectCheckboxDirective } from 'app/directives/authority-select-checkbox/authority-select-checkbox.directive';
import { AutocompleteComponent } from 'app/components/shared/autocomplete/autocomplete.component';
import { DatePickerModule } from 'app/modules/shared/date-picker.module';
import { DummyEntranceComponent } from 'app/components/shared/dummy-entrance/dummy-entrance.component';
import { EntranceComponent } from 'app/components/shared/entrance/entrance.component';
import { FormTableCustomComponent } from 'app/components/shared/form-table-custom/form-table-custom.component';
import { FormTableSelectComponent } from 'app/components/shared/form-table-select/form-table-select.component';
import { FormTableTextComponent } from 'app/components/shared/form-table-text/form-table-text.component';
import { FormTableTextareaComponent } from 'app/components/shared/form-table-textarea/form-table-textarea.component';
import { FromToDatePickerComponent } from 'app/components/shared/from-to-date-picker/from-to-date-picker.component';
import { FromToDateTimePickerComponent } from 'app/components/shared/from-to-date-time-picker/from-to-date-time-picker.component';
import { HasErrorPipe } from 'app/pipes/has-error.pipe';
import { IsNotEmptyPipe } from 'app/pipes/is-not-empty.pipe';
import {
    MenuItemComponent, MenuListComponent
} from 'app/components/menu/menu-list/menu-list.component';
import { ModalComponent } from 'app/components/shared/modal/modal.component';
import { ModelRevModalComponent } from 'app/components/shared/model-rev-modal/model-rev-modal.component';
import { ModelRevService } from 'app/services/shared/model-rev.service';
import { ModalService } from 'app/services/shared/modal.service';
import { MonthPickerModule } from 'app/modules/shared/month-picker.module';
import { MultiselectComponent } from 'app/components/shared/multiselect/multiselect.component';
import { OrderByPipe } from 'app/pipes/order-by.pipe';
import { PaginationComponent } from 'app/components/shared/pagination/pagination.component';
import { PopoverComponent } from 'app/components/shared/popover/popover.component';
import { SanitizeUrlPipe } from 'app/pipes/sanitize-url.pipe';
import { ScrollToDirective } from 'app/directives/scroll-to/scroll-to.directive';
import { SearchConditionsComponent } from 'app/components/shared/car-search/search-conditions.component';
import { SelectTypeComponent } from 'app/components/shared/select-type/select-type.component';
import { SelectedComponent } from 'app/components/shared/selected/selected.component';
import { SidemenuModule } from 'app/modules/shared/sidemenu.module';
import { SimpleListConfirmComponent } from 'app/components/shared/simple-list-confirm/simple-list-confirm.component';
import { TableModule } from 'app/modules/shared/table.module';
import { TandemConfirmComponent } from 'app/components/shared/tandem-confirm/tandem-confirm.component';
import { TimeDifferenceComponent } from 'app/components/shared/car-search/time-difference.component';
import { TimePickerModule } from 'app/modules/shared/time-picker.module';
import { ValuesPipe } from 'app/pipes/values.pipe';

@NgModule({
    declarations: [
        AppCommonButtonComponent,
        AppCommonTextComponent,
        AtPipe,
        AuthoritySelectCheckboxDirective,
        AutocompleteComponent,
        DummyEntranceComponent,
        EntranceComponent,
        FormTableCustomComponent,
        FormTableSelectComponent,
        FormTableTextComponent,
        FormTableTextareaComponent,
        FromToDatePickerComponent,
        FromToDateTimePickerComponent,
        HasErrorPipe,
        IsNotEmptyPipe,
        MenuItemComponent,
        MenuListComponent,
        ModalComponent,
        ModelRevModalComponent,
        MultiselectComponent,
        OrderByPipe,
        PaginationComponent,
        PopoverComponent,
        SanitizeUrlPipe,
        ScrollToDirective,
        SearchConditionsComponent,
        SelectTypeComponent,
        SelectedComponent,
        SimpleListConfirmComponent,
        TandemConfirmComponent,
        TimeDifferenceComponent,
        ValuesPipe,
    ],
    imports: [
        AccordionModule,
        AlertModule,
        AppFileUploadModule,
        CommonModule,
        DatePickerModule,
        TimePickerModule,
        FormsModule,
        MonthPickerModule,
        NgSelectModule,
        NgbModule,
        ReactiveFormsModule,
        SidemenuModule,
    ],
    exports: [
        AccordionModule,
        AlertModule,
        AppCommonButtonComponent,
        AppCommonTextComponent,
        AppFileUploadModule,
        AtPipe,
        AuthoritySelectCheckboxDirective,
        AutocompleteComponent,
        CommonModule,
        DatePickerModule,
        TimePickerModule,
        DummyEntranceComponent,
        EntranceComponent,
        FormTableCustomComponent,
        FormTableSelectComponent,
        FormTableTextComponent,
        FormTableTextareaComponent,
        FormsModule,
        FromToDatePickerComponent,
        FromToDateTimePickerComponent,
        HasErrorPipe,
        IsNotEmptyPipe,
        MenuItemComponent,
        MenuListComponent,
        ModelRevModalComponent,
        MonthPickerModule,
        MultiselectComponent,
        NgSelectModule,
        OrderByPipe,
        PaginationComponent,
        PopoverComponent,
        ReactiveFormsModule,
        SanitizeUrlPipe,
        ScrollToDirective,
        SearchConditionsComponent,
        SelectTypeComponent,
        SelectedComponent,
        SidemenuModule,
        SimpleListConfirmComponent,
        TableModule,
        TandemConfirmComponent,
        TimeDifferenceComponent,
        ValuesPipe,
    ],
    providers: [
        ModalService,
        ModelRevService,
    ],
    entryComponents: [
        ModalComponent,
    ],
})
export class AppCommonModule { }
