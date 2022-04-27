import { TestBed, inject } from '@angular/core/testing';
import {
  BaseRequestOptions,
  Response,
  ResponseOptions,
  Http,
  HttpClientModule,
} from '@angular/http';
import { RouterTestingModule } from '@angular/router/testing';

import { KbaCommonModule } from '../../../modules/shared/kba-common.module';

import { ClassService } from './class.service';
import { ApiService } from '../../api/api.service';
import { ResourceService } from '../../api/resource.service';
import { KbaAlertService } from '../../shared/kba-alert.service';
import { KbaStorageService } from '../../shared/kba-storage.service';
import { CommonHeaderService } from '../../shared/common-header.service';
import { UserSettingService } from '../../api/user-setting.service';

describe('ClassService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterTestingModule, KbaCommonModule],
      providers: [
        ApiService,
        UserSettingService,
        KbaAlertService,
        ResourceService,
        ClassService,
        KbaStorageService,
        CommonHeaderService,
      ],
    });
  });

  it('should be created', inject([ClassService], (service: ClassService) => {
    expect(service).toBeTruthy();
  }));
});
