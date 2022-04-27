import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';
import { KbaSidemenuModule } from '../../../../modules/shared/kba-sidemenu.module';
import { KbaAccordionModule } from '../../../../modules/shared/kba-accordion.module';

import { CustomSystemNotificationFormModalComponent } from '../shared/modal/custom-system-notification-form-modal.component';
import { SystemNotificationIndexComponent } from './system-notification-index.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { ApiService } from '../../../../services/api/api.service';
import { SystemNotificationService } from '../../../../services/opa/system-notification/system-notification.service';
import { KbaStorageService } from '../../../../services/shared/kba-storage.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('SystemNotificationIndexComponent', () => {
  let component: SystemNotificationIndexComponent;
  let fixture: ComponentFixture<SystemNotificationIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SystemNotificationIndexComponent,
        CustomSystemNotificationFormModalComponent,
      ],
      imports: [
        KbaCommonModule,
        KbaSidemenuModule,
        HttpClientModule,
        KbaAccordionModule,
        RouterTestingModule,
      ],
      providers: [
        KbaNavigationService,
        ApiService,
        UserSettingService,
        SystemNotificationService,
        KbaStorageService,
        KbaAlertService,
        CommonHeaderService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemNotificationIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
