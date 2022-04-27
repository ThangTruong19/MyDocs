import { TestBed, inject } from '@angular/core/testing';
import {
  BaseRequestOptions,
  Response,
  ResponseOptions,
  Http,
  HttpClientModule,
} from '@angular/http';
import { RouterTestingModule } from '@angular/router/testing';

import { ApiService } from './api.service';
import { UserSettingService } from './user-setting.service';
import { KbaAlertService } from '../shared/kba-alert.service';

import { ResourceService } from './resource.service';
import { KbaStorageService } from '../shared/kba-storage.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { CommonHeaderService } from '../shared/common-header.service';

describe('ApiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterTestingModule],
      providers: [
        ApiService,
        UserSettingService,
        KbaAlertService,
        ResourceService,
        KbaStorageService,
        CommonHeaderService,
      ],
    });
  });

  it('should be created', inject([ApiService], (service: ApiService) => {
    expect(service).toBeTruthy();
  }));

  it('リクエストヘッダの値に応じたレスポンスヘッダが返却されること', inject(
    [ApiService],
    (service: ApiService) => {
      const params = {
        contact_kind: '1',
      };
      const opt = {
        request_header: {
          'X-From': 1,
          'X-Count': 1,
          'X-Sort': '-dummy',
        },
      };
      spyOn(service, 'get').and.returnValue(
        Observable.of({
          result_header: {
            'X-From': '1',
            'X-TotalCount': '100',
            'X-Count': '1',
            'X-Sort': '-dummy',
          },
        })
      );
      service.get('contacts', params, opt).subscribe(res => {
        expect(res.result_header).toEqual({
          'X-From': '1',
          'X-TotalCount': '100',
          'X-Count': '1',
          'X-Sort': '-dummy',
        });
      });
    }
  ));

  it('値がnull or 空文字の場合はキーごと削除されたパラメタが返却されること', inject(
    [ApiService],
    (service: ApiService) => {
      const params = {
        customer_id: '1',
        id_keys: [
          {
            id: '',
            current_operator: {
              ids: ['0', '1', '', null, '3'],
              code: '',
              label: '',
            },
            update_datetime: null,
          },
          {
            id: '1',
            current_operator: {
              ids: ['0', '1', '', null, '3'],
              code: '',
              label: 'aaa',
            },
            update_datetime: null,
          },
        ],
      };
      const exclusionKey = [
        'id_keys.id',
        'id_keys.current_operator.code',
        'id_keys.update_datetime',
      ];
      expect(service['_pickAvailableParams'](params, exclusionKey)).toEqual({
        customer_id: '1',
        id_keys: [
          {
            id: '',
            current_operator: {
              ids: ['0', '1', '3'],
              code: '',
            },
            update_datetime: null,
          },
          {
            id: '1',
            current_operator: {
              ids: ['0', '1', '3'],
              code: '',
              label: 'aaa',
            },
            update_datetime: null,
          },
        ],
      });
    }
  ));
});
