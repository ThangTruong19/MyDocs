import { TestBed, inject } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';

import { KbaCommonModule } from '../../modules/shared/kba-common.module';

import { CommonHeaderService } from './common-header.service';
import { KbaAlertService } from './kba-alert.service';
import { UserSettingService } from '../api/user-setting.service';
import { ApiService } from '../api/api.service';

describe('CommonHeaderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CommonHeaderService,
        KbaAlertService,
        ApiService,
        UserSettingService,
      ],
      imports: [RouterTestingModule, KbaCommonModule],
    });
  });

  it('should be created', inject(
    [CommonHeaderService],
    (service: CommonHeaderService) => {
      expect(service).toBeTruthy();
    }
  ));
});
