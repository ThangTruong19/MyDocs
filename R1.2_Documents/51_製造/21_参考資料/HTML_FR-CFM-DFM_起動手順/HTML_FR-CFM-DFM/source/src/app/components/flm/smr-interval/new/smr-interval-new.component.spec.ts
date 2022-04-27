import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';

import { SmrIntervalNewComponent } from './smr-interval-new.component';

import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { SmrIntervalService } from '../../../../services/flm/smr-interval/smr-interval.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('SmrIntervalNewComponent', () => {
  let component: SmrIntervalNewComponent;
  let fixture: ComponentFixture<SmrIntervalNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SmrIntervalNewComponent],
      imports: [HttpClientModule, RouterTestingModule, KbaCommonModule],
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
    fixture = TestBed.createComponent(SmrIntervalNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
