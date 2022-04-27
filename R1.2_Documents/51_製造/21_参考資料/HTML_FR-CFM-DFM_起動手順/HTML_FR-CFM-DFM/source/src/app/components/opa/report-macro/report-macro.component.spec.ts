import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { ReportMacroComponent } from './report-macro.component';
import { KbaCommonModule } from '../../../modules/shared/kba-common.module';
import { ReportMacroService } from '../../../services/opa/report-macro/report-macro.service';
import { CommonHeaderService } from '../../../services/shared/common-header.service';
import { KbaAlertService } from '../../../services/shared/kba-alert.service';
import { ApiService } from '../../../services/api/api.service';
import { UserSettingService } from '../../../services/api/user-setting.service';

describe('ReportMacroComponent', () => {
  let component: ReportMacroComponent;
  let fixture: ComponentFixture<ReportMacroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReportMacroComponent],
      imports: [KbaCommonModule, RouterTestingModule],
      providers: [
        ReportMacroService,
        CommonHeaderService,
        KbaAlertService,
        ApiService,
        UserSettingService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportMacroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
