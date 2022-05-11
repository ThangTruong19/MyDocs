import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import {
    MenuItemComponent, MenuListComponent
} from 'app/components/menu/menu-list/menu-list.component';
import { AutocompleteComponent } from 'app/components/shared/autocomplete/autocomplete.component';
// import { CarSearchComponent } from 'app/components/shared/car-search/car-search.component';
import { SearchConditionsComponent } from 'app/components/shared/car-search/search-conditions.component';
import { TimeDifferenceComponent } from 'app/components/shared/car-search/time-difference.component';
import { AppCommonTextComponent } from 'app/components/shared/common-text/common-text.component';
import { AppCommonButtonComponent } from 'app/components/shared/common-button/common-button.component';
import { DummyEntranceComponent } from 'app/components/shared/dummy-entrance/dummy-entrance.component';
import { EntranceComponent } from 'app/components/shared/entrance/entrance.component';
import { FormTableCustomComponent } from 'app/components/shared/form-table-custom/form-table-custom.component';
import { FormTableSelectComponent } from 'app/components/shared/form-table-select/form-table-select.component';
import { FormTableTextComponent } from 'app/components/shared/form-table-text/form-table-text.component';
import { FormTableTextareaComponent } from 'app/components/shared/form-table-textarea/form-table-textarea.component';
import { FromToDatePickerComponent } from 'app/components/shared/from-to-date-picker/from-to-date-picker.component';
import { FromToDateTimePickerComponent } from 'app/components/shared/from-to-date-time-picker/from-to-date-time-picker.component';
import { ModalComponent } from 'app/components/shared/modal/modal.component';
import { ModelRevModalComponent } from 'app/components/shared/model-rev-modal/model-rev-modal.component';
import { MultiselectComponent } from 'app/components/shared/multiselect/multiselect.component';
import { PaginationComponent } from 'app/components/shared/pagination/pagination.component';
import { PopoverComponent } from 'app/components/shared/popover/popover.component';
import { SelectTypeComponent } from 'app/components/shared/select-type/select-type.component';
import { SelectedComponent } from 'app/components/shared/selected/selected.component';
import { SimpleListConfirmComponent } from 'app/components/shared/simple-list-confirm/simple-list-confirm.component';
import { TandemConfirmComponent } from 'app/components/shared/tandem-confirm/tandem-confirm.component';
import { ScrollToDirective } from 'app/directives/scroll-to/scroll-to.directive';
import { AccordionModule } from 'app/modules/shared/accordion.module';
import { AlertModule } from 'app/modules/shared/alert.module';
import { AppFileUploadModule } from 'app/modules/shared/app-file-upload.module';
import { DatePickerModule } from 'app/modules/shared/date-picker.module';
import { MonthPickerModule } from 'app/modules/shared/month-picker.module';
import { SidemenuModule } from 'app/modules/shared/sidemenu.module';
import { TableModule } from 'app/modules/shared/table.module';
import { TimePickerModule } from 'app/modules/shared/time-picker.module';
import { AtPipe } from 'app/pipes/at.pipe';
import { HasErrorPipe } from 'app/pipes/has-error.pipe';
import { IsNotEmptyPipe } from 'app/pipes/is-not-empty.pipe';
import { OrderByPipe } from 'app/pipes/order-by.pipe';
import { SanitizeUrlPipe } from 'app/pipes/sanitize-url.pipe';
import { ValuesPipe } from 'app/pipes/values.pipe';
import { ResourceService } from 'app/services/api/resource.service';
import { ComponentRefService } from 'app/services/shared/component-ref.service';
import { ModalService } from 'app/services/shared/modal.service';
import { ModelRevService } from 'app/services/shared/model-rev.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { StorageService } from 'app/services/shared/storage.service';

@NgModule({
    declarations: [
        AppCommonButtonComponent,
        AppCommonTextComponent,
        AtPipe,
        AutocompleteComponent,
        // CarSearchComponent,
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
        AutocompleteComponent,
        // CarSearchComponent,
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
        ComponentRefService,
        ModalService,
        ModelRevService,
        NavigationService,
        ResourceService,
        StorageService,
    ],
    entryComponents: [
        ModalComponent,
    ],
})
export class AppCommonModule { }
