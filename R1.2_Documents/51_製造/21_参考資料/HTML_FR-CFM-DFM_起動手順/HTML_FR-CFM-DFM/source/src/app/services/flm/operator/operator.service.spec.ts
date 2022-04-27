import { TestBed, inject } from '@angular/core/testing';
import {
  BaseRequestOptions,
  Response,
  ResponseOptions,
  Http,
  HttpClientModule,
} from '@angular/http';

import { ApiService } from '../../api/api.service';
import { UserSettingService } from '../../api/user-setting.service';
import { KbaAlertService } from '../../shared/kba-alert.service';
import { ResourceService } from '../../api/resource.service';
import { OperatorService } from './operator.service';
import { RouterTestingModule } from '@angular/router/testing';
import { KbaStorageService } from '../../shared/kba-storage.service';
import { CommonHeaderService } from '../../shared/common-header.service';

describe('OperatorService', () => {
  const subject: OperatorService = null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterTestingModule],
      providers: [
        OperatorService,
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
    [OperatorService],
    (service: OperatorService) => {
      expect(service).toBeTruthy();
    }
  ));
});
