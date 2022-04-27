import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlagIndexComponent } from './flag-index.component';
import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';
import { FlagService } from '../../../../services/flm/flag/flag.service';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('FlagIndexComponent', () => {
  let component: FlagIndexComponent;
  let fixture: ComponentFixture<FlagIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FlagIndexComponent],
      imports: [KbaCommonModule, RouterTestingModule],
      providers: [
        FlagService,
        CommonHeaderService,
        KbaAlertService,
        ApiService,
        UserSettingService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlagIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
