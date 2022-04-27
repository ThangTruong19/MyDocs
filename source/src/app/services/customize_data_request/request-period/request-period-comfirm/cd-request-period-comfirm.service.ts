import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { ApiService } from 'app/services/api/api.service';
import { ResourceService } from 'app/services/api/resource.service';
import { Apis } from 'app/constants/apis';



@Injectable()
export class CdRequestPeriodComfirmService {
  constructor(private api: ApiService, private resource: ResourceService) {}

  /**
   * カスタマイズデータ送信要求確認（期間指定）
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
          .post(Apis.postRequestPeriodComfirm, params)
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }



}
