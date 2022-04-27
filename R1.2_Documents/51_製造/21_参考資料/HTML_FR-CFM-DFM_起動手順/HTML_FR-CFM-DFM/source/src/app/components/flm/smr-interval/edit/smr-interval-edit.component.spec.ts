import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';

import { SmrIntervalEditComponent } from './smr-interval-edit.component';

import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { SmrIntervalService } from '../../../../services/flm/smr-interval/smr-interval.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('SmrIntervalEditComponent', () => {
  let component: SmrIntervalEditComponent;
  let fixture: ComponentFixture<SmrIntervalEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SmrIntervalEditComponent],
      imports: [KbaCommonModule, RouterTestingModule],
      providers: [
        KbaAlertService,
        SmrIntervalService,
        CommonHeaderService,
        ApiService,
        UserSettingService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmrIntervalEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
