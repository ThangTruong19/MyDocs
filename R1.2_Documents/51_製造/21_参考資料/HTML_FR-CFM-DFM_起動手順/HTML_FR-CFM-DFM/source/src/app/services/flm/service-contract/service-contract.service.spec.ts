import { TestBed, inject } from '@angular/core/testing';

import { ServiceContractService } from './service-contract.service';
import { KbaAlertService } from '../../../services/shared/kba-alert.service';
import { KbaCommonModule } from '../../../modules/shared/kba-common.module';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonHeaderService } from '../../shared/common-header.service';
import { ApiService } from '../../api/api.service';
import { UserSettingService } from '../../api/user-setting.service';

describe('ServiceContractService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        UserSettingService,
        ServiceContractService,
        KbaAlertService,
        CommonHeaderService,
      ],
      imports: [KbaCommonModule, RouterTestingModule],
    });
  });

  it('should be created', inject(
    [ServiceContractService],
    (service: ServiceContractService) => {
      expect(service).toBeTruthy();
    }
  ));
});
