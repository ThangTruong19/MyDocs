import { TestBed, inject } from '@angular/core/testing';

import { CustomCarAttributeService } from './custom-car-attribute.service';
import { KbaCommonModule } from '../../../modules/shared/kba-common.module';
import { RouterTestingModule } from '@angular/router/testing';
import { KbaAlertService } from '../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../shared/common-header.service';
import { ApiService } from '../../api/api.service';
import { UserSettingService } from '../../api/user-setting.service';

describe('CustomCarAttributeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CustomCarAttributeService,
        KbaAlertService,
        CommonHeaderService,
        ApiService,
        UserSettingService,
      ],
      imports: [KbaCommonModule, RouterTestingModule],
    });
  });

  it('should be created', inject(
    [CustomCarAttributeService],
    (service: CustomCarAttributeService) => {
      expect(service).toBeTruthy();
    }
  ));
});
