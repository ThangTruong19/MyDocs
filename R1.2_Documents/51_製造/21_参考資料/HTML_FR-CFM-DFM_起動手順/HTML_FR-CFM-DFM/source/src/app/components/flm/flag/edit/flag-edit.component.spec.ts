import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlagEditComponent } from './flag-edit.component';
import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';
import { RouterTestingModule } from '@angular/router/testing';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { FlagService } from '../../../../services/flm/flag/flag.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('FlagEditComponent', () => {
  let component: FlagEditComponent;
  let fixture: ComponentFixture<FlagEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FlagEditComponent],
      imports: [KbaCommonModule, RouterTestingModule],
      providers: [
        KbaAlertService,
        FlagService,
        CommonHeaderService,
        ApiService,
        UserSettingService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlagEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
