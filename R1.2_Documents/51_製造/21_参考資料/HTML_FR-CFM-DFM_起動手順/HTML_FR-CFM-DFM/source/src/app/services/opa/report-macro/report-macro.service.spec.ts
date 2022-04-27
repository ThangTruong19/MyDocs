import { TestBed, inject } from '@angular/core/testing';

import { ReportMacroService } from './report-macro.service';
import { KbaAlertService } from '../../shared/kba-alert.service';
import { KbaCommonModule } from '../../../modules/shared/kba-common.module';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonHeaderService } from '../../shared/common-header.service';
import { ApiService } from '../../api/api.service';
import { UserSettingService } from '../../api/user-setting.service';

describe('ReportMacroService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReportMacroService,
        KbaAlertService,
        CommonHeaderService,
        ApiService,
        UserSettingService,
      ],
      imports: [KbaCommonModule, RouterTestingModule],
    });
  });

  it('should be created', inject(
    [ReportMacroService],
    (service: ReportMacroService) => {
      expect(service).toBeTruthy();
    }
  ));
});
