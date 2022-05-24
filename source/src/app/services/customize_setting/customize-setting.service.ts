import { Injectable } from "@angular/core";
import { Apis } from "app/constants/apis";
import { RequestHeaderParams } from "app/types/request";
import { ApiService } from "../api/api.service";

@Injectable()
export class CustomizeSettingService {
  constructor(private api: ApiService) { }
  /**
   * 車両管理一覧取得APIリクエスト
   * @param params リクエストパラメータ
   * @param requestHeaderParams ヘッダ情報
   */
  fetchCustomizeSettingList(
    params: any,
    requestHeaderParams: RequestHeaderParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchCarIndexList',
        this.api
          .get(Apis.postCarCustomizesDefinitionSearch, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * 車両管理一覧取得APIリクエスト
   * @param params リクエストパラメータ
   * @param requestHeaderParams ヘッダ情報
   */
   postCarsCustomizeUsageDefinitions(
    params: any,
    requestHeaderParams: RequestHeaderParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'postCarsCustomizeUsageDefinitions',
        this.api
          .post(Apis.postCustomizeDataRequestDetail, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }
}
