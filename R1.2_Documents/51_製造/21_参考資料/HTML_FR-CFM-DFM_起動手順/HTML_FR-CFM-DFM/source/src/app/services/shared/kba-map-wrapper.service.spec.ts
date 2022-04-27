import { TestBed, inject } from '@angular/core/testing';

import { KbaMapWrapperService } from './kba-map-wrapper.service';
import { UserSettingService } from '../api/user-setting.service';

describe('KbaMapWrapperService', () => {
  let service: KbaMapWrapperService;
  let usService: UserSettingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KbaMapWrapperService, UserSettingService],
    });
  });

  beforeEach(() => {
    usService = TestBed.get(UserSettingService);
    spyOn(usService, 'getMapParams').and.returnValue({
      lat: '30',
      lng: '30',
      zoom: '10',
      mapApplication: '0',
    });
    usService.userSettings = {
      map_latitude: '30',
      map_longitude: '30',
      map_magnification: '8',
      lang_code: 'ja',
      date_format_code: '',
      distance_unit_code: '',
    };
    usService.groupSettings = {
      map_mode: '0',
      time_difference: '',
      first_day_of_week_kind: '0',
    };
    service = TestBed.get(KbaMapWrapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy(KbaMapWrapperService);
  });
});
