import { TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { KbaCommonModule } from '../../../modules/shared/kba-common.module';

import { HistoryService } from './history.service';
import { KbaAlertService } from '../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../shared/common-header.service';
import { ApiService } from '../../api/api.service';
import { UserSettingService } from '../../api/user-setting.service';

describe('HistoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        UserSettingService,
        HistoryService,
        KbaAlertService,
        CommonHeaderService,
      ],
      imports: [KbaCommonModule, RouterTestingModule],
    });
  });

  it('should be created', inject(
    [HistoryService],
    (service: HistoryService) => {
      expect(service).toBeTruthy();
    }
  ));
});
