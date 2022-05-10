import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { ApiService } from 'app/services/api/api.service';
import { ResourceService } from 'app/services/api/resource.service';
import { Apis } from 'app/constants/apis';

/**
 * 送信番号一覧要求確認モーダルのサービス
 */

@Injectable()
export class CdNumberListRequestComfirmService {
  constructor(private api: ApiService, private resource: ResourceService) {}

  /**
   * 送信番号一覧送信要求
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
          .post(Apis.postSendNoList, params)
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

}