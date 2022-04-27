import { TestBed, inject, async } from '@angular/core/testing';
import {
  BaseRequestOptions,
  Response,
  ResponseOptions,
  Http,
  HttpClientModule,
} from '@angular/http';
import { RouterTestingModule } from '@angular/router/testing';

import { ApiService } from '../api/api.service';
import { KbaAlertService } from './kba-alert.service';
import { ResourceService } from '../api/resource.service';
import { KbaFileUploadService } from './kba-file-upload.service';
import { KbaCommonModule } from '../../modules/shared/kba-common.module';
import { CommonHeaderService } from './common-header.service';
import { UserSettingService } from '../api/user-setting.service';

describe('FileUploadService', () => {
  let subject: KbaFileUploadService = null;
  const resultHeader = {
    Code: 0,
    Msg: '成功しました。',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterTestingModule, KbaCommonModule],
      providers: [
        ApiService,
        UserSettingService,
        KbaAlertService,
        ResourceService,
        KbaFileUploadService,
        CommonHeaderService,
      ],
    });
  });

  beforeEach(inject(
    [KbaFileUploadService],
    (kbaFileUploadService: KbaFileUploadService) => {
      subject = kbaFileUploadService;
      spyOn(subject, 'upload').and.returnValue(
        Promise.resolve({ status: 207 })
      );
    }
  ));

  it('サービスが作成されること', () => {
    expect(subject).toBeTruthy();
  });

  it('ファイルがアップロードされること', async(() => {
    const expectedStatus = 207;
    const file = new File(['test'], 'test.txt');

    return subject.upload('dummy/upload', file, '{}').then((res: any) => {
      expect(res.status).toBe(expectedStatus);
    });
  }));
});
