import { Injectable } from "@angular/core";
import { Apis } from "app/constants/apis";
import { RequestHeaderParams } from "app/types/request";
import { ApiService } from "../api/api.service";
import { ResourceService } from "../api/resource.service";

@Injectable()
export class CustomizeSettingService {
  constructor(private api: ApiService, private resource: ResourceService) { }

  /**
 * 車両登録の初期表示に必要な情報を取得
 *
 * @return {Object} 初期パラメータ群
 */
  fetchCustomizeInitData(opt?: any): Promise<any> {
    this.api.currentScreenCode = 'cdsm_car_mgt_detail';
    return this.api.callApisForInitialize('cdsm_car_mgt_detail', 'fetchIndexInitData', {
      fields: () => this.api.fetchFields('cdsm_car_mgt_detail_function'),
      fieldResources: () =>
        this.api.fetchFieldResources('cdsm_car_mgt_detail_function'),
    });
  }

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
   * 車両カスタマイズ用途定義詳細取得API
   * @param params リクエストパラメータ
   * @param requestHeaderParams ヘッダ情報
   */
  fetchCustomizeDefinitionDetails(
    params: any,
    requestHeaderParams: RequestHeaderParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchDefinitionDetails',
        this.api
          .get(Apis.getCars_carId_CustomizeUsageDefinitionDetails, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => {
            resolve(res);
          })
      )
    })
  }

  /**
   * 車両カスタマイズ用途定義一括取得要求
   * @param params リクエストパラメータ
   */
  postCarsRequestSetsCustomizeUsageDefinitionsM2s(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'postCarsRequestSetsCustomizeUsageDefinitionsM2s',
        this.api.post(Apis.postCarsRequestSetsCustomizeUsageDefinitionsM2s, params)
          .subscribe(res => {
            resolve(res);
          })
      );
    })
  }

  /**
   * 車両カスタマイズ用途定義更新要求
   * @param params リクエストパラメータ
   */
  postCustomUsageDefinitionUpdateRequest(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'postCustomDefinitionUpdateRequest',
        this.api.post(Apis.postCustomizeUsageDefinitionUpdateRequest, params)
          .subscribe(res => {
            resolve(res);
          })
      );
    })
  }

  /**
   * 車両カスタマイズ設定要求再送
   * @param params リクエストパラメータ
   */
  postCutomSettingRequestResend(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'postCutomSettingRequestResend',
        this.api.post(Apis.postCustomizeSettingRequestResend, params)
          .subscribe(res => {
            resolve(res);
          })
      );
    })
  }
}