import { Injectable } from "@angular/core";

import { Api } from 'app/types/common';
import { Apis } from "app/constants/apis";
import { RequestHeaderParams } from "app/types/request";
import { ScreenCodeConst } from "app/constants/api/screen-code-const";
import { FunctionCodeConst } from "app/constants/api/function-code-const";
import { ApiService } from "../api/api.service";
import { ResourceService } from "../api/resource.service";

@Injectable()
export class CsDetailService {
  constructor(private api: ApiService, private resource: ResourceService) { }

  /**
   * 一覧画面のリスト取得APIを呼ぶ
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ情報
   */
  fetchIndexList(carId: string,
    requestHeaderParams: RequestHeaderParams
  ): Promise<Api> {
    return new Promise((resolve) => {
      this.api.requestHandler(
        'fetchIndexList',
        this.api
          .get(
            {
              apiId: Apis.getCars_carId_CustomizeUsageDefinitionDetails,
              params: [carId],
            },
            null,
            { cache: false, request_header: requestHeaderParams }
          )
          .subscribe((res) => resolve(res))
      );
    });
  }

  /**
   * カスタマイズ設定詳細の初期表示に必要な情報を取得
   */
  fetchIndexInitData() {
    this.api.currentScreenCode = ScreenCodeConst.CAR_MGT_DETAIL;
    return this.api.callApisForInitialize(
      ScreenCodeConst.CAR_MGT_DETAIL,
      'fetchIndexInitData',
      {
        fields: () =>
          this.api.fetchFields(FunctionCodeConst.CAR_MGT_DETAIL_FUNCTION)
      }
    );
  }

  /**
  * 車両カスタマイズ用途定義一括取得要求API呼び出し
 * @param params パラメータ
 * @param headerParams ヘッダ情報
  */
  postCarsRequestSetsCustomizeUsageDefinitionsM2s(
    params: any,
    requestHeaderParams: any
  ) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'postCarsRequestSetsCustomizeUsageDefinitionsM2s',
        this.api.post(Apis.postCarsRequestSetsCustomizeUsageDefinitionsM2s, params, {
          cache: false,
          request_header: requestHeaderParams,
        })
          .subscribe(
            (res) => resolve(res),
            (error) => reject(error)
          )
      );
    })
  }

  /**
   * 車両カスタマイズ用途定義更新要求API呼び出し
   * @param params パラメータ
   * @param headerParams ヘッダ情報
   */
  postCarsRequestsCustomizeUsageDefinitionsS2m(
    params: any,
    requestHeaderParams: any
  ) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'postCarsRequestsCustomizeUsageDefinitionsS2m',
        this.api
          .post(Apis.postCarsRequestsCustomizeUsageDefinitionsS2m, params, {
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

  /**
  * 車両カスタマイズ設定要求再送API呼び出し
   * @param params パラメータ
   * @param headerParams ヘッダ情報
  */
  postCarsRequestsCustomizeSettingsRetryS2m(
    params: any,
    requestHeaderParams: any
  ) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'postCarsRequestsCustomizeSettingsRetryS2m',
        this.api.post(Apis.postCarsRequestsCustomizeSettingsRetryS2m, params, {
          cache: false,
          request_header: requestHeaderParams,
        })
          .subscribe(
            (res) => resolve(res),
            (error) => reject(error)
          )
      );
    })
  }
}