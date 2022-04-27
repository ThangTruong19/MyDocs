import { TestBed, inject } from '@angular/core/testing';

import { SystemNotificationService } from './system-notification.service';
import {
  BaseRequestOptions,
  Response,
  ResponseOptions,
  Http,
  HttpClientModule,
} from '@angular/http';
import { ApiService } from '../../api/api.service';
import { UserSettingService } from '../../api/user-setting.service';
import { ResourceService } from '../../api/resource.service';
import { RouterTestingModule } from '@angular/router/testing';
import { KbaAlertService } from '../../shared/kba-alert.service';
import { KbaStorageService } from '../../shared/kba-storage.service';
import { CommonHeaderService } from '../../shared/common-header.service';

describe('SystemNotificationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterTestingModule],
      providers: [
        ApiService,
        UserSettingService,
        KbaAlertService,
        ResourceService,
        SystemNotificationService,
        KbaStorageService,
        CommonHeaderService,
      ],
    });
  });

  it('should be created', inject(
    [SystemNotificationService],
    (service: SystemNotificationService) => {
      expect(service).toBeTruthy();
    }
  ));
});
