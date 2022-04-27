import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import { KbaCommonModule } from '../../modules/shared/kba-common.module';

import { UserSettingService } from './user-setting.service';
import { ApiService } from './api.service';
import { KbaAlertService } from '../shared/kba-alert.service';
import { CommonHeaderService } from '../shared/common-header.service';

describe('UserSettingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [UserSettingService],
    });
  });

  it('should be created', inject(
    [UserSettingService],
    (service: UserSettingService) => {
      expect(service).toBeTruthy();
    }
  ));
});
