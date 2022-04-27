import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { FlagNewComponent } from './flag-new.component';
import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { FlagService } from '../../../../services/flm/flag/flag.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('FlagNewComponent', () => {
  let component: FlagNewComponent;
  let fixture: ComponentFixture<FlagNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FlagNewComponent],
      imports: [HttpClientModule, RouterTestingModule, KbaCommonModule],
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
    fixture = TestBed.createComponent(FlagNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
