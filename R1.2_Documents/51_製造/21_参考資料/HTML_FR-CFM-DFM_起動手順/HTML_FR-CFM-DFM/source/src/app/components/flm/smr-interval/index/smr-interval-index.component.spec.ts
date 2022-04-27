import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';

import { SmrIntervalIndexComponent } from './smr-interval-index.component';

import { SmrIntervalService } from '../../../../services/flm/smr-interval/smr-interval.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('SmrIntervalIndexComponent', () => {
  let component: SmrIntervalIndexComponent;
  let fixture: ComponentFixture<SmrIntervalIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SmrIntervalIndexComponent],
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
    fixture = TestBed.createComponent(SmrIntervalIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
