import { TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { KbaCommonModule } from '../../../modules/shared/kba-common.module';

import { BusinessTypeService } from './business-type.service';
import { KbaAlertService } from '../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../shared/common-header.service';
import { ApiService } from '../../api/api.service';
import { UserSettingService } from '../../api/user-setting.service';

describe('BusinessTypeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BusinessTypeService,
        KbaAlertService,
        CommonHeaderService,
        ApiService,
        UserSettingService,
      ],
      imports: [KbaCommonModule, RouterTestingModule],
    });
  });

  it('should be created', inject(
    [BusinessTypeService],
    (service: BusinessTypeService) => {
      expect(service).toBeTruthy();
    }
  ));
});
