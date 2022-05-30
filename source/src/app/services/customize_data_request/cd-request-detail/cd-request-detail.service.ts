import { Injectable } from "@angular/core";
import { RequestHeaderParams } from "app/types/request";
import { Apis } from "app/constants/apis";
import { ApiService } from "app/services/api/api.service";
import { ResourceService } from "app/services/api/resource.service";
import { ScreenCodeConst } from "app/constants/api/screen-code-const";
import { FunctionCodeConst } from "app/constants/api/function-code-const";

@Injectable()
export class CdRequestDetailService {
  constructor(private api: ApiService, private resource: ResourceService) { }

  /**
   * 車両登録の初期表示に必要な情報を取得
   *
   * @return {Object} 初期パラメータ群
   */
  fetchCarInitData(opt?: any): Promise<any> {
    this.api.currentScreenCode = ScreenCodeConst.CDSM_CUSTOMIZE_DATA_REQUEST_DETAIL;
    return this.api.callApisForInitialize(ScreenCodeConst.CDSM_CUSTOMIZE_DATA_REQUEST_DETAIL, 'fetchCarInitData', {
      fields: () => this.api.fetchFields(FunctionCodeConst.CDSM_CUSTOMIZE_DATA_REQUEST_PERIOD_TAB),
      cdRequestDetailFields: () =>
          this.api.fetchFields(FunctionCodeConst.CDSM_CUSTOMIZE_DATA_REQUEST_NUMBER_TAB, "1"),
      fieldResources: () =>
        this.api.fetchFieldResources(FunctionCodeConst.CDSM_CUSTOMIZE_DATA_REQUEST_PERIOD_TAB),
    });
  }

  /**
   * 車両管理一覧取得APIリクエスト
   * @param params リクエストパラメータ
   * @param requestHeaderParams ヘッダ情報
   */
  fetchCarIndexList(
    params: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchCarIndexList',
        this.api
          .post(Apis.postCustomizeDataRequestDetail, params)
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }
}