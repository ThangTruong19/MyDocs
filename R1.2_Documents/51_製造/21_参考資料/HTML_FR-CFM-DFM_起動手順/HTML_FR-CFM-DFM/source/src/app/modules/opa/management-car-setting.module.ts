import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { KbaAccordionModule } from '../shared/kba-accordion.module';
import { KbaCommonModule } from '../shared/kba-common.module';

import { ModelSettingComponent } from '../../components/opa/management-car-setting-management/model-setting/model-setting.component';
import { ModelSelectModalComponent } from '../../components/opa/management-car-setting-management/shared/select-modal/model-select-modal.component';
import { MakerDivisionsComponent } from '../../components/opa/management-car-setting-management/shared/maker-divisions/maker-divisions.component';
import { ModelTypeSettingComponent } from '../../components/opa/management-car-setting-management/model-type-setting/model-type-setting.component';
import { ModelsComponent } from '../../components/opa/management-car-setting-management/shared/models/models.component';
import { ModelTypeSelectModalComponent } from '../../components/opa/management-car-setting-management/shared/select-modal/model-type-select-modal.component';
import { MakerSettingComponent } from '../../components/opa/management-car-setting-management/maker-setting/maker-setting.component';
import { CheckListComponent } from '../../components/opa/management-car-setting-management/shared/check-list/check-list.component';
import { DivisionSettingComponent } from '../../components/opa/management-car-setting-management/division-setting/division-setting.component';
import { CustomDivisionNewComponent } from '../../components/opa/management-car-setting-management/custom-division/new/custom-division-new.component';
import { CustomDivisionEditComponent } from '../../components/opa/management-car-setting-management/custom-division/edit/custom-division-edit.component';
import { CustomDivisionIndexComponent } from '../../components/opa/management-car-setting-management/custom-division/index/custom-division-index.component';

import { ManagementCarSettingService } from '../../services/opa/management-car-setting/management-car-setting.service';

@NgModule({
  declarations: [
    ModelSettingComponent,
    ModelSelectModalComponent,
    MakerDivisionsComponent,
    ModelTypeSettingComponent,
    ModelTypeSelectModalComponent,
    ModelsComponent,
    MakerSettingComponent,
    CheckListComponent,
    DivisionSettingComponent,
    CustomDivisionNewComponent,
    CustomDivisionEditComponent,
    CustomDivisionIndexComponent,
  ],
  imports: [
    RouterModule.forChild([
      { path: 'model_setting', component: ModelSettingComponent },
      { path: 'model_type_setting', component: ModelTypeSettingComponent },
      { path: 'maker_setting', component: MakerSettingComponent },
      { path: 'division_setting', component: DivisionSettingComponent },
      { path: 'custom_divisions/new', component: CustomDivisionNewComponent },
      {
        path: 'custom_divisions/:id/edit',
        component: CustomDivisionEditComponent,
      },
      { path: 'custom_divisions', component: CustomDivisionIndexComponent },
    ]),
    KbaCommonModule,
  ],
  providers: [ManagementCarSettingService],
})
export class ManagementCarSettingModule {}
