import { Injectable } from '@angular/core';

import { RequestHeaderParams } from '../../../types/request';

import { ScreenCode } from '../../../constants/opa/screen-codes/service-contract-management';
import { FunctionCode } from '../../../constants/opa/function-codes/service-contract-management';
import { Apis } from '../../../constants/apis';

import { ApiService } from '../../api/api.service';
import { ResourceService } from '../../api/resource.service';
import { Api } from '../../../types/common';
import { map } from 'rxjs/operators';

@Injectable()
export class ServiceContractService {
  constructor(private api: ApiService, private resource: ResourceService) {}

  /**
   * サービス委託管理一覧画面の初期化 API を呼び出す
   */
  fetchIndexInitData() {
    this.api.currentScreenCode = ScreenCode.list;
    return this.api.callApisForInitialize(
      ScreenCode.list,
      'fetchIndexInitData',
      {
        fields: () => this.api.fetchFields(FunctionCode.listFunction),
        fieldResources: () =>
          this.api.fetchFieldResources(FunctionCode.listFunction),
        editFields: () => this.api.fetchFields(FunctionCode.listEditFunction),
        editConfirmFields: () =>
          this.api.fetchFieldsWithWordBreak(FunctionCode.listEditConfirmFunction),
        downloadFields: () =>
          this.api.fetchFields(FunctionCode.listDownloadFunction),
      }
    );
  }

  /**
   * サービス委託管理一覧画面の一覧取得 API を呼び出す
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ
   */
  fetchIndexList(params, requestHeaderParams: RequestHeaderParams) {
    return new Promise<Api>((resolve, reject) => {
      this.api.requestHandler(
        'fetchIndexList',
        this.api
          .post(Apis.postCarsServiceContractSearch, params, {
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
   * サービス委託一括更新 API を実行
   * @param params パラメータ
   */
  updateServiceDB(params) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateServiceDB',
        this.api
          .put(Apis.putCarsServiceContract, params, {
            screenCode: FunctionCode.listEditConfirmFunction,
          })
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * ファイル作成APIを実行
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ
   */
  createFile(params, requestHeaderParams: RequestHeaderParams) {
    requestHeaderParams['X-Count'] = null;
    requestHeaderParams['X-From'] = null;

    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createFile',
        this.api
          .post(Apis.postCarsServiceContractSearchFileCreate, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * ブロックに依存するリソースを取得
   * @param blockId ブロックID
   */
  fetchBlockBelongingResource(blockId: string) {
    const params = {
      screen_code: ScreenCode.list,
      search_parameters: [
        {
          resource_path: 'common.support_distributor.ids',
          condition_sets: [{ condition: 'block_id', values: [blockId] }],
        },
        {
          resource_path: 'common.service_distributor.ids',
          condition_sets: [{ condition: 'block_id', values: [blockId] }],
        },
      ],
    };

    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchBlockBelongingResource',
        this.api
          .post(Apis.postApplicationsViewsResourcesSearch, params)
          .subscribe(res => {
            resolve(this.resource.parse(res.result_data));
          })
      );
    });
  }

  /**
   * 担当DBに依存するリソースを取得
   * @param supportDBId 担当DBID
   */
  fetchSupportDistributorBelongingResource(supportDBId: string) {
    const params = {
      screen_code: ScreenCode.list,
      search_parameters: [
        {
          resource_path: 'common.customer.ids',
          condition_sets: [
            {
              condition: 'common.support_distributor.ids',
              values: [supportDBId],
            },
          ],
        },
      ],
    };

    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchSupportDistributorBelongingResource',
        this.api
          .post(Apis.postApplicationsViewsResourcesSearch, params)
          .subscribe(res => resolve(this.resource.parse(res.result_data)))
      );
    });
  }
}
