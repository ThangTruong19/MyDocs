import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';

import { FuelEditComponent } from './fuel-edit.component';

import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { FuelService } from '../../../../services/flm/fuel/fuel.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('FuelEditComponent', () => {
  let component: FuelEditComponent;
  let fixture: ComponentFixture<FuelEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FuelEditComponent],
      imports: [KbaCommonModule, RouterTestingModule],
      providers: [
        KbaAlertService,
        FuelService,
        CommonHeaderService,
        ApiService,
        UserSettingService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FuelEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
