import { TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {
  BaseRequestOptions,
  Response,
  ResponseOptions,
  Http,
  HttpClientModule,
} from '@angular/http';

import { GroupAreaService } from './group-area.service';
import { LandmarkService } from '../landmark/landmark.service';
import { ApiService } from '../../api/api.service';
import { UserSettingService } from '../../api/user-setting.service';
import { ResourceService } from '../../api/resource.service';
import { KbaAlertService } from '../../shared/kba-alert.service';
import { KbaStorageService } from '../../shared/kba-storage.service';
import { CommonHeaderService } from '../../shared/common-header.service';

describe('GroupAreaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterTestingModule],
      providers: [
        ApiService,
        UserSettingService,
        LandmarkService,
        KbaAlertService,
        ResourceService,
        GroupAreaService,
        KbaStorageService,
        CommonHeaderService,
      ],
    });
  });

  it('should be created', inject(
    [GroupAreaService],
    (service: GroupAreaService) => {
      expect(service).toBeTruthy();
    }
  ));
});
