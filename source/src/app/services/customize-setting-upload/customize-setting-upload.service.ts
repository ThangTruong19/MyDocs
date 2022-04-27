import * as _ from 'lodash';
import { Injectable } from '@angular/core';

import {
  CarTemplateCreateParams,
} from 'app/types/car';

import { ApiService } from 'app/services/api/api.service';
import { ResourceService } from 'app/services/api/resource.service';

import { Apis } from 'app/constants/apis';
import { FunctionCode } from 'app/constants/car-management';
import { Fields } from 'app/types/common';

@Injectable()
export class CustomizeSettingUploadService {
  constructor(private api: ApiService, private resource: ResourceService) {}

  /**
   * 車両一括登録テンプレートファイル作成APIリクエスト
   * @param params リクエストパラメータ
   */
  templateCreate(params: CarTemplateCreateParams, xFields: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'templateCreate',
        this.api
          .get(Apis.getCarsManagementTemplateCreate, params, {
            request_header: { 'X-Fields': xFields },
          })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

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

}
