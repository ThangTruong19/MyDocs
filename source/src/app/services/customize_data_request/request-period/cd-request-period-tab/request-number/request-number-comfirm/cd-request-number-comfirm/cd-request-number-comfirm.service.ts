import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { ApiService } from 'app/services/api/api.service';
import { ResourceService } from 'app/services/api/resource.service';



@Injectable()
export class CdTransmissionRequestNumberComfirmService {
  constructor(private api: ApiService, private resource: ResourceService) {}

  /**
   * カスタマイズデータ送信要求（送信番号指定）API リクエスト
   * @param params リクエストパラメータ
   * @param requestHeaderParams ヘッダ情報
   */
  ok(
    params: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchCarIndexList',
        this.api
          // .post(Apis.postCarsManagementSearch, params)
          .post('Apis.xxx', params)
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }



}
