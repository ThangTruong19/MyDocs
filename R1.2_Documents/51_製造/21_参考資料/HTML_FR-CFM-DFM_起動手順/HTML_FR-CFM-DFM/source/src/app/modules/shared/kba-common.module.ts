import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { KbaAccordionModule } from './kba-accordion.module';
import { KbaAlertModule } from './kba-alert.module';
import { KbaTableModule } from './kba-table.module';
import { KbaSidemenuModule } from './kba-sidemenu.module';
import { KbaGroupSelectModalModule } from './kba-group-select-modal.module';
import { KbaAuthoritySelectModalModule } from './kba-authority-select-modal.module';
import { KbaTextComponent } from '../../components/shared/kba-text/kba-text.component';
import { KbaPaginationComponent } from '../../components/shared/kba-pagination/kba-pagination.component';
import { KbaSelectedComponent } from '../../components/shared/kba-selected/kba-selected.component';
import { KbaFormTableSelectComponent } from '../../components/shared/kba-form-table-select/kba-form-table-select.component';
import { KbaBelongingFormTableSelectComponent } from '../../components/shared/kba-belonging-form-table-select/kba-belonging-form-table-select.component';
import { KbaFormTableTextComponent } from '../../components/shared/kba-form-table-text/kba-form-table-text.component';
import { KbaFormTableTextareaComponent } from '../../components/shared/kba-form-table-textarea/kba-form-table-textarea.component';
import { KbaFormTableCustomComponent } from '../../components/shared/kba-form-table-custom/kba-form-table-custom.component';
import { KbaGroupSelectComponent } from '../../components/shared/kba-group-select/kba-group-select.component';
import { KbaAuthoritySelectComponent } from '../../components/shared/kba-authority-select/kba-authority-select.component';
import { KbaModalComponent } from '../../components/shared/kba-modal/kba-modal.component';
import { KbaModalService } from '../../services/shared/kba-modal.service';
import { KbaAreaMapComponent } from '../../components/shared/kba-area/kba-area-map.component';
import { KbaAreaMenuComponent } from '../../components/shared/kba-area/kba-area-menu.component';
import { KbaInputPointComponent } from '../../components/shared/kba-area/kba-input-point.component';
import { KbaInputDistanceComponent } from '../../components/shared/kba-area/kba-input-distance.component';
import { KbaTandemConfirmComponent } from '../../components/shared/kba-tandem-confirm/kba-tandem-confirm.component';
import { KbaListConfirmComponent } from '../../components/shared/kba-list-confirm/kba-list-confirm.component';
import { KbaSimpleListConfirmComponent } from '../../components/shared/kba-simple-list-confirm/kba-simple-list-confirm.component';
import { KbaCarSearchComponent } from '../../components/shared/kba-car-search/kba-car-search.component';
import { KbaTimeDifferenceComponent } from '../../components/shared/kba-car-search/kba-time-difference.component';
import { KbaDatePickerModule } from './kba-date-picker.module';
import { KbaMonthPickerModule } from './kba-month-picker.module';

import { ResourceService } from '../../services/api/resource.service';
import { KbaNavigationService } from '../../services/shared/kba-navigation.service';
import { KbaStorageService } from '../../services/shared/kba-storage.service';
import { KbaMapWrapperService } from '../../services/shared/kba-map-wrapper.service';
import { AtPipe } from '../../pipes/at.pipe';
import { OrderByPipe } from '../../pipes/order-by.pipe';
import { ValuesPipe } from '../../pipes/values.pipe';
import { IsNotEmptyPipe } from '../../pipes/is-not-empty.pipe';
import { HasErrorPipe } from '../../pipes/has-error.pipe';
import { SanitizeUrlPipe } from '../../pipes/sanitize-url.pipe';
import { KbaModelRevModalComponent } from '../../components/shared/kba-model-rev-modal/kba-model-rev-modal.component';
import { KbaUserSearchModalComponent } from '../../components/shared/kba-user-search-modal/kba-user-search-modal.component';
import { KbaFileUploadModule } from './kba-file-upload.module';
import { KbaSelectTypeComponent } from '../../components/shared/kba-select-type/kba-select-type.component';
import { KbaPopoverComponent } from '../../components/shared/kba-popover/kba-popover.component';
import { KbaModelRevService } from '../../services/shared/kba-model-rev.service';
import { KbaChildTextComponent } from '../../components/opa/shared/kba-child-text/kba-child-text.component';
import { KbaScrollToDirective } from '../../directives/kba-scroll-to/kba-scroll-to.directive';
import { KbaCompanySearchModalComponent } from '../../components/shared/kba-company-search-modal/kba-company-search-modal.component';
import { KbaEntranceComponent } from '../../components/shared/kba-entrance/kba-entrance.component';
import { DummyEntranceComponent } from '../../components/shared/kba-dummy-entrance/kba-dummy-entrance.component';
import { ComponentRefService } from '../../services/shared/component-ref.service';
import { KbaSearchConditionsComponent } from '../../components/shared/kba-car-search/kba-search-conditions.component';
import { KbaMultiselectComponent } from '../../components/shared/kba-multiselect/kba-multiselect.component';
import { KbaAutocompleteComponent } from '../../components/shared/kba-autocomplete/kba-autocomplete.component';
import { KbaFromToDatePickerComponent } from '../../components/shared/kba-from-to-date-picker/kba-from-to-date-picker.component';

@NgModule({
  declarations: [
    KbaTextComponent,
    KbaPaginationComponent,
    KbaSelectedComponent,
    KbaFormTableSelectComponent,
    KbaBelongingFormTableSelectComponent,
    KbaFormTableTextComponent,
    KbaFormTableTextareaComponent,
    KbaFormTableCustomComponent,
    KbaModalComponent,
    KbaAreaMapComponent,
    KbaAreaMenuComponent,
    KbaInputPointComponent,
    KbaInputDistanceComponent,
    KbaTandemConfirmComponent,
    KbaListConfirmComponent,
    KbaSimpleListConfirmComponent,
    KbaModelRevModalComponent,
    KbaUserSearchModalComponent,
    KbaCompanySearchModalComponent,
    KbaSelectTypeComponent,
    KbaPopoverComponent,
    KbaChildTextComponent,
    KbaGroupSelectComponent,
    KbaCarSearchComponent,
    KbaSearchConditionsComponent,
    KbaTimeDifferenceComponent,
    KbaAuthoritySelectComponent,
    KbaEntranceComponent,
    DummyEntranceComponent,
    KbaMultiselectComponent,
    KbaAutocompleteComponent,
    KbaFromToDatePickerComponent,
    OrderByPipe,
    ValuesPipe,
    AtPipe,
    HasErrorPipe,
    IsNotEmptyPipe,
    SanitizeUrlPipe,
    KbaScrollToDirective,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    KbaAccordionModule,
    KbaAlertModule,
    KbaSidemenuModule,
    KbaFileUploadModule,
    KbaGroupSelectModalModule,
    NgbModule,
    KbaAuthoritySelectModalModule,
    KbaDatePickerModule,
    KbaMonthPickerModule,
  ],
  exports: [
    KbaTextComponent,
    KbaPaginationComponent,
    KbaSelectedComponent,
    KbaFormTableSelectComponent,
    KbaBelongingFormTableSelectComponent,
    KbaFormTableTextComponent,
    KbaFormTableTextareaComponent,
    KbaFormTableCustomComponent,
    KbaAreaMapComponent,
    KbaAreaMenuComponent,
    KbaInputPointComponent,
    KbaInputDistanceComponent,
    KbaTandemConfirmComponent,
    KbaListConfirmComponent,
    KbaSimpleListConfirmComponent,
    KbaModelRevModalComponent,
    KbaUserSearchModalComponent,
    KbaCompanySearchModalComponent,
    KbaSelectTypeComponent,
    KbaPopoverComponent,
    KbaChildTextComponent,
    KbaGroupSelectComponent,
    KbaCarSearchComponent,
    KbaSearchConditionsComponent,
    KbaTimeDifferenceComponent,
    KbaAuthoritySelectComponent,
    KbaEntranceComponent,
    DummyEntranceComponent,
    KbaMultiselectComponent,
    KbaAutocompleteComponent,
    KbaFromToDatePickerComponent,
    KbaDatePickerModule,
    KbaMonthPickerModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    KbaAccordionModule,
    KbaAlertModule,
    KbaTableModule,
    KbaSidemenuModule,
    OrderByPipe,
    ValuesPipe,
    AtPipe,
    HasErrorPipe,
    IsNotEmptyPipe,
    SanitizeUrlPipe,
    KbaFileUploadModule,
    KbaGroupSelectModalModule,
    KbaAuthoritySelectModalModule,
    KbaScrollToDirective,
  ],
  providers: [
    KbaModalService,
    ResourceService,
    KbaNavigationService,
    KbaStorageService,
    KbaMapWrapperService,
    KbaModelRevService,
    ComponentRefService,
  ],
  entryComponents: [
    KbaModalComponent,
    KbaUserSearchModalComponent,
    KbaCompanySearchModalComponent,
  ],
})
export class KbaCommonModule {}
