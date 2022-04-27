import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

import { UserExportComponent } from './user-export.component';
import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';
import { KbaSidemenuModule } from '../../../../modules/shared/kba-sidemenu.module';
import { KbaAccordionModule } from '../../../../modules/shared/kba-accordion.module';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserService } from '../../../../services/opa/user/user.service';
import { KbaStorageService } from '../../../../services/shared/kba-storage.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('UserExportComponent', () => {
  let component: UserExportComponent;
  let fixture: ComponentFixture<UserExportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserExportComponent],
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
        UserService,
        KbaStorageService,
        KbaAlertService,
        CommonHeaderService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
