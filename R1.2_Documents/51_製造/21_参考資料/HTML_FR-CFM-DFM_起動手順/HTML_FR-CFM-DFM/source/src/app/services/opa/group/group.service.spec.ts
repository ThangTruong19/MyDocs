import { TestBed, inject } from '@angular/core/testing';

import { GroupService } from './group.service';
import { KbaAlertService } from '../../shared/kba-alert.service';
import { KbaCommonModule } from '../../../modules/shared/kba-common.module';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonHeaderService } from '../../shared/common-header.service';
import { ApiService } from '../../api/api.service';
import { UserSettingService } from '../../api/user-setting.service';

describe('GroupService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GroupService,
        KbaAlertService,
        CommonHeaderService,
        ApiService,
        UserSettingService,
      ],
      imports: [KbaCommonModule, RouterTestingModule],
    });
  });

  it('should be created', inject([GroupService], (service: GroupService) => {
    expect(service).toBeTruthy();
  }));
});
