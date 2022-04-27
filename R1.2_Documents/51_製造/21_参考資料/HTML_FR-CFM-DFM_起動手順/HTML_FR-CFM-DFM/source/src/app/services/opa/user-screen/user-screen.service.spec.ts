import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import { UserScreenService } from './user-screen.service';
import { ApiService } from '../../api/api.service';
import { UserSettingService } from '../../api/user-setting.service';
import { ResourceService } from '../../api/resource.service';
import { KbaAlertService } from '../../shared/kba-alert.service';
import { KbaStorageService } from '../../shared/kba-storage.service';
import { CommonHeaderService } from '../../shared/common-header.service';

describe('UserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterTestingModule],
      providers: [
        UserScreenService,
        ApiService,
        UserSettingService,
        KbaAlertService,
        ResourceService,
        KbaStorageService,
        CommonHeaderService,
      ],
    });
  });

  it('should be created', inject(
    [UserScreenService],
    (service: UserScreenService) => {
      expect(service).toBeTruthy();
    }
  ));
});
