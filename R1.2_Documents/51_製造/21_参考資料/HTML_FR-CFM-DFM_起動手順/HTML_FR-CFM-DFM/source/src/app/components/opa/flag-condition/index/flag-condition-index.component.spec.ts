import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

import { FlagConditionIndexComponent } from './flag-condition-index.component';
import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';
import { KbaSidemenuModule } from '../../../../modules/shared/kba-sidemenu.module';
import { KbaAccordionModule } from '../../../../modules/shared/kba-accordion.module';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { ApiService } from '../../../../services/api/api.service';
import { FlagConditionService } from '../../../../services/opa/flag-condition/flag-condition.service';
import { KbaStorageService } from '../../../../services/shared/kba-storage.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('KeyCarIndexComponent', () => {
  let component: FlagConditionIndexComponent;
  let fixture: ComponentFixture<FlagConditionIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FlagConditionIndexComponent],
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
        FlagConditionService,
        KbaStorageService,
        KbaAlertService,
        CommonHeaderService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlagConditionIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
