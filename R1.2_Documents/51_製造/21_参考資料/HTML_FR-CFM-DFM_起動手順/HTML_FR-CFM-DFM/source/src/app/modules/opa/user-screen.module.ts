import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { KbaCommonModule } from '../shared/kba-common.module';

import { FunctionPublishSettingComponent } from '../../components/opa/user-screen/function-publish-setting/function-publish-setting.component';
import { ExternalAppPublishSettingComponent } from '../../components/opa/user-screen/shared/external-app-publish-setting.component';
import { PublishSettingConfirmModalComponent } from '../../components/opa/user-screen/shared/confirm-modal.component';
import { ItemPublishSettingComponent } from '../../components/opa/user-screen/item-publish-setting/item-publish-setting.component';
import { UserScreenService } from '../../services/opa/user-screen/user-screen.service';

@NgModule({
  imports: [
    CommonModule,
    KbaCommonModule,
    RouterModule.forChild([
      {
        path: 'function_publish_setting',
        component: FunctionPublishSettingComponent,
      },
      { path: 'item_publish_setting', component: ItemPublishSettingComponent },
    ]),
    NgbModule,
  ],
  declarations: [
    FunctionPublishSettingComponent,
    ExternalAppPublishSettingComponent,
    PublishSettingConfirmModalComponent,
    ItemPublishSettingComponent,
  ],
  entryComponents: [PublishSettingConfirmModalComponent],
  providers: [UserScreenService],
})
export class UserScreenModule {}
