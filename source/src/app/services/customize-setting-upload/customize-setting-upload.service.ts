import * as _ from 'lodash';
import { Injectable } from '@angular/core';

import { CustomizeSettingUploadFileCreateParams } from 'app/types/car';

import { ApiService } from 'app/services/api/api.service';
import { ResourceService } from 'app/services/api/resource.service';

import { Apis } from 'app/constants/apis';
import { FunctionCode } from 'app/constants/car-management';
import { Fields } from 'app/types/common';

import { RequestHeaderParams } from 'app/types/request';

@Injectable()
export class CustomizeSettingUploadService {
  constructor(private api: ApiService, private resource: ResourceService) {}

  /**
   * 車両一括登録のダウンロード用指定項目を取得
   */
  fetchCarBatchDownloadFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler('fetchCarBatchDownloadFields',
        this.api
          .fetchFields(FunctionCode.templateRegistDownloadFunction)
          .subscribe((res) => resolve(res))
      );
    });
  }

  /**
   * ファイル作成APIを呼ぶ
   * @param params パラメータ
   * @param headerParams ヘッダ情報
   */
   createFile(
    params: CustomizeSettingUploadFileCreateParams,
    requestHeaderParams: RequestHeaderParams
  ) {
    requestHeaderParams['X-Count'] = null;
    requestHeaderParams['X-From'] = null;

    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createFile',
        this.api
          .post(Apis.postCarsCustomizesUsageDefinitionRegistrationTemplateCreate, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(
            (res) => resolve(res),
            (error) => reject(error)
          )
      );
    });
  }

}
