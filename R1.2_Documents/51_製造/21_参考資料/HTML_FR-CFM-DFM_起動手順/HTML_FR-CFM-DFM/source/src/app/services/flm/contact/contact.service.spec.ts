import { TestBed, inject } from '@angular/core/testing';

import { ContactService } from './contact.service';
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

describe('ContactService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterTestingModule],
      providers: [
        ApiService,
        UserSettingService,
        KbaAlertService,
        ResourceService,
        ContactService,
        KbaStorageService,
        CommonHeaderService,
      ],
    });
  });

  it('should be created', inject(
    [ContactService],
    (service: ContactService) => {
      expect(service).toBeTruthy();
    }
  ));
});
