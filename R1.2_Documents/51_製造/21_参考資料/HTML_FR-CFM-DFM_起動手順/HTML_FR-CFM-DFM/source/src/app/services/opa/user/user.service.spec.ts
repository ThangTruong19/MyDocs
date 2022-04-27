import { TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HttpClientModule } from '@angular/common/http';

import { UserSettingService } from '../../api/user-setting.service';
import { ResourceService } from '../../api/resource.service';
import { KbaAlertService } from '../../shared/kba-alert.service';
import { KbaStorageService } from '../../shared/kba-storage.service';
import { CommonHeaderService } from '../../shared/common-header.service';
import { UserService } from './user.service';
import { ApiService } from '../../api/api.service';

describe('UserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterTestingModule],
      providers: [
        ApiService,
        UserSettingService,
        KbaAlertService,
        ResourceService,
        UserService,
        KbaStorageService,
        CommonHeaderService,
      ],
    });
  });

  it('should be created', inject([UserService], (service: UserService) => {
    expect(service).toBeTruthy();
  }));
});
