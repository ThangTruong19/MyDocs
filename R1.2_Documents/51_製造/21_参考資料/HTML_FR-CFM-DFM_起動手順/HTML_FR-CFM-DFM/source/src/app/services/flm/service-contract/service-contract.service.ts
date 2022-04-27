import { Injectable } from '@angular/core';

import { RequestHeaderParams } from '../../../types/request';
import { ApproveRejectParams } from '../../../types/flm/service-contract';

import { ScreenCode } from '../../../constants/flm/screen-codes/service-contract-management';
import { ScreenCode as CommonScreenCode } from '../../../constants/flm/screen-codes/common';
import { FunctionCode } from '../../../constants/flm/function-codes/service-contract-management';
import { Apis } from '../../../constants/apis';

import { ApiService } from '../../api/api.service';
import { ResourceService } from '../../api/resource.service';
import { Fields } from '../../../types/common';

@Injectable()
export class ServiceContractService {
  constructor(private api: ApiService, private resource: ResourceService) {}

  /**
   * サービス委託管理一覧画面の初期化 API を呼び出す
   */
  fetchApplyIndexInitData() {
    this.api.currentScreenCode = ScreenCode.consignorList;
    return this.api.callApisForInitialize(
      ScreenCode.consignorList,
      'fetchApplyIndexInitData',
      {
        fields: () => this.api.fetchFields(FunctionCode.consignorListFunction),
      }
    );
  }

  /**
   * サービス委託管理一覧画面の一覧取得 API を呼び出す
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ
   */
  fetchApplyIndexList(
    params,
    requestHeaderParams: RequestHeaderParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchApplyIndex',
        this.api
          .post(Apis.postCarsServiceContractConsignorSearch, params, {
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
   * 担当DBに対応する顧客リソースの取得API
   * @param supportDbId 担当DBID
   */
  getCustomerResource(supportDbId): Promise<any> {
    const params = [
      {
        resource_path: 'common.customer.ids',
        condition_sets: [
          {
            values: [supportDbId],
            condition: 'common.support_distributor.ids',
          },
        ],
      },
    ];

    return this._fetchResource(
      'getCustomerResource',
      params,
      ScreenCode.consignorList
    );
  }

  /**
   * サービス委託解除APIリクエスト
   * @param params リクエストパラメータ
   */
  unlinkConsignors(params): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'unlinkConsignors',
        this.api
          .delete(Apis.deleteCarsServiceContract, params)
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * サービス委託申請登録API
   * @param params リクエストパラメータ
   */
  applyConsignor(params): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'applyConsignor',
        this.api
          .post(Apis.postCarsServiceContractConsignor, params)
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * サービス委託承認却下一覧の初期化 API を呼ぶ
   */
  fetchApproveRejectInitData() {
    this.api.currentScreenCode = ScreenCode.consigneeList;
    return this.api.callApisForInitialize(
      ScreenCode.consigneeList,
      'fetchApproveRejectIndexInitData',
      {
        fields: () => this.api.fetchFields(FunctionCode.consigneeListFunction),
      }
    );
  }

  /**
   * サービス委託管理一覧画面の一覧取得 API を呼び出す
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ
   */
  fetchApproveRejectList(
    params: ApproveRejectParams,
    requestHeaderParams: RequestHeaderParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchApproveRejectList',
        this.api
          .get(Apis.getCarsServiceContractConsignee, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * サービス委託承認却下 API を呼び出す
   * @param params パラメータ
   */
  updateConsignee(params) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateConsignee',
        this.api
          .put(Apis.putCarsServiceContractConsignee, params)
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * 申請一覧/指定項目リソース取得
   */
  fetchApplyIndexFieldResources() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchApplyIndexFieldResources',
        this.api
          .fetchFieldResources(FunctionCode.consignorListFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 申請一覧/解除モーダル用指定項目取得
   */
  fetchApplyIndexCancelFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchApplyIndexCancelFields',
        this.api
          .fetchFields(FunctionCode.consignorListCancelFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 申請一覧/申請画面用指定項目取得
   */
  fetchApplyIndexApplyFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchApplyIndexApplyFields',
        this.api
          .fetchFields(FunctionCode.consignorListApplyFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 申請一覧/確認モーダル用指定項目取得
   */
  fetchApplyIndexConfirmFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchApplyIndexConfirmFields',
        this.api
          .fetchFields(FunctionCode.consignorListApplyConfirmFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 承認・却下一覧/承認モーダル用指定項目取得
   */
  fetchApproveFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchApproveFields',
        this.api
          .fetchFields(FunctionCode.consigneeListApproveFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 承認・却下一覧/承認モーダル用指定項目取得
   */
  fetchRejectFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchRejectFields',
        this.api
          .fetchFields(FunctionCode.consigneeListRejectFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * リソース取得APIリクエスト
   * @param requestName リクエスト名
   * @param searchParameters 検索パラメータ
   */
  private _fetchResource(
    requestName: string,
    searchParameters,
    screenCode
  ): Promise<any> {
    const params = {
      screen_code: screenCode,
      search_parameters: searchParameters,
    };

    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        requestName,
        this.api
          .post(Apis.postApplicationsViewsResourcesSearch, params)
          .subscribe(res => {
            resolve(this.resource.parse(res.result_data));
          })
      );
    });
  }
}
