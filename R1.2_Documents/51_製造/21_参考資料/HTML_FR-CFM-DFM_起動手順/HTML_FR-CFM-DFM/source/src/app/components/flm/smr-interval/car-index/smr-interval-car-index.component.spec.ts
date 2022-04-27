import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';

import { SmrIntervalCarIndexComponent } from './smr-interval-car-index.component';

import { SmrIntervalService } from '../../../../services/flm/smr-interval/smr-interval.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('SmrIntervalCarIndexComponent', () => {
  let component: SmrIntervalCarIndexComponent;
  let fixture: ComponentFixture<SmrIntervalCarIndexComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SmrIntervalCarIndexComponent],
      imports: [NgbModule, RouterTestingModule, KbaCommonModule],
      providers: [
        SmrIntervalService,
        KbaAlertService,
        CommonHeaderService,
        ApiService,
        UserSettingService,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmrIntervalCarIndexComponent);
    component = fixture.componentInstance;
    component.activeTab = 'targetCar';
    component.modelCarTypeCheck = false;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
