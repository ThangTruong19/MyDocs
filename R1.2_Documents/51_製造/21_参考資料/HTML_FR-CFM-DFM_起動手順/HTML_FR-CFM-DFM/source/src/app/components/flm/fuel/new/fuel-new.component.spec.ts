import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';

import { FuelNewComponent } from './fuel-new.component';

import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { FuelService } from '../../../../services/flm/fuel/fuel.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('FuelNewComponent', () => {
  let component: FuelNewComponent;
  let fixture: ComponentFixture<FuelNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FuelNewComponent],
      imports: [HttpClientModule, RouterTestingModule, KbaCommonModule],
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
    fixture = TestBed.createComponent(FuelNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
