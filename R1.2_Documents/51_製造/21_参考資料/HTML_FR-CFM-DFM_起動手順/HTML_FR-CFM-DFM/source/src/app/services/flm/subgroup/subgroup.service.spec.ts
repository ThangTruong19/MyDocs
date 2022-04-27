import { TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { KbaCommonModule } from '../../../modules/shared/kba-common.module';

import { KbaAlertService } from '../../shared/kba-alert.service';
import { CommonHeaderService } from '../../shared/common-header.service';
import { ApiService } from '../../api/api.service';
import { UserSettingService } from '../../api/user-setting.service';
import { SubgroupService } from './subgroup.service';

describe('CustomerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        UserSettingService,
        SubgroupService,
        KbaAlertService,
        CommonHeaderService,
      ],
      imports: [KbaCommonModule, RouterTestingModule],
    });
  });

  it('should be created', inject(
    [SubgroupService],
    (service: SubgroupService) => {
      expect(service).toBeTruthy();
    }
  ));
});
