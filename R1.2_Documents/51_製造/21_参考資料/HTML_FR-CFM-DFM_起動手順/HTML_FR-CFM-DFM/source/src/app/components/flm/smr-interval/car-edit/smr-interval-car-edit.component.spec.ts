import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';

import { SmrIntervalCarEditComponent } from './smr-interval-car-edit.component';

import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { SmrIntervalService } from '../../../../services/flm/smr-interval/smr-interval.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from '../../../../services/api/api.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('SmrIntervalCarEditComponent', () => {
  let component: SmrIntervalCarEditComponent;
  let fixture: ComponentFixture<SmrIntervalCarEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SmrIntervalCarEditComponent],
      imports: [KbaCommonModule, RouterTestingModule],
      providers: [
        SmrIntervalService,
        CommonHeaderService,
        KbaAlertService,
        ApiService,
        UserSettingService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmrIntervalCarEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
