import { TestBed, inject } from '@angular/core/testing';

import { CustomerService } from './customer.service';
import { KbaAlertService } from '../../shared/kba-alert.service';
import { KbaCommonModule } from '../../../modules/shared/kba-common.module';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonHeaderService } from '../../shared/common-header.service';
import { ApiService } from '../../api/api.service';
import { UserSettingService } from '../../api/user-setting.service';

describe('CustomerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        UserSettingService,
        CustomerService,
        KbaAlertService,
        CommonHeaderService,
      ],
      imports: [KbaCommonModule, RouterTestingModule],
    });
  });

  it('should be created', inject(
    [CustomerService],
    (service: CustomerService) => {
      expect(service).toBeTruthy();
    }
  ));
});
