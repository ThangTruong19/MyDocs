import { Injectable } from '@angular/core';

import {
  BusinessTypeParams,
  BusinessTypeIndexParams,
  BusinessTypeFileCreateParams,
} from '../../../types/opa/business-type';
import { RequestHeaderParams } from '../../../types/request';

import { ScreenCode } from '../../../constants/opa/screen-codes/business-type-management';
import { FunctionCode } from '../../../constants/opa/function-codes/business-type-management';
import { Apis } from '../../../constants/apis';

import { Api, Resources, Fields } from '../../../types/common';

import { ApiService } from '../../../services/api/api.service';
import { ResourceService } from '../../../services/api/resource.service';

@Injectable()
export class BusinessTypeService {
  constructor(private api: ApiService, private resource: ResourceService) {}

  /**
   * 登録画面の初期化に必要な API コール
   */
  fetchInitNew() {
    this.api.currentScreenCode = ScreenCode.regist;
    return this.api.callApisForInitialize(ScreenCode.regist, 'fetchInitNew');
  }

  /**
   * 業種登録 API を実行
   * @param params パラメータ
   */
  createBusinessType(params: BusinessTypeParams) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createBusinessType',
        this.api
          .post(Apis.postBusinessTypes, params)
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 一覧の初期表示に必要な情報を取得
   */
  fetchIndexInitData() {
    this.api.currentScreenCode = ScreenCode.list;
    return this.api.callApisForInitialize(
      ScreenCode.list,
      'fetchIndexInitData',
      {
        updatable: Apis.putBusinessTypes_businessTypeId_,
        deletable: Apis.deleteBusinessTypes_businessTypeId_,
        fields: () => this.api.fetchFields(FunctionCode.listFunction),
      }
    );
  }

  /**
   * 一覧画面のリスト取得APIを呼ぶ
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ情報
   */
  fetchIndexList(
    params: BusinessTypeIndexParams,
    requestHeaderParams: RequestHeaderParams
  ): Promise<Api> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchIndexList',
        this.api
          .get(Apis.getBusinessTypes, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * ファイル作成APIを呼ぶ
   * @param params パラメータ
   * @param headerParams ヘッダ情報
   */
  createFile(
    params: BusinessTypeFileCreateParams,
    requestHeaderParams: RequestHeaderParams
  ): Promise<Api> {
    requestHeaderParams['X-Count'] = null;
    requestHeaderParams['X-From'] = null;

    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createFile',
        this.api
          .get(Apis.getBusinessTypesFileCreate, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 業種詳細取得 API を呼ぶ
   * @param id 業種ID
   * @param requestHeaderParams ヘッダ情報
   */
  fetchBusinessTypeDetail(
    id: string,
    requestHeaderParams: RequestHeaderParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchBusinessTypeDetail',
        this.api
          .get(
            {
              apiId: Apis.getBusinessTypes_businessTypeId_,
              params: [id],
            },
            {},
            { cache: false, request_header: requestHeaderParams }
          )
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 業種削除 API を呼ぶ
   * @param id 業種ID
   * @param update_datetime 更新日時
   */
  deleteBusinessType(id: string, update_datetime: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'deleteBusinessType',
        this.api
          .delete(
            {
              apiId: Apis.deleteBusinessTypes_businessTypeId_,
              params: [id],
            },
            { update_datetime }
          )
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 業種変更画面の初期化APIを呼ぶ
   * @param id 業種ID
   */
  fetchEditInitData(id: string): Promise<any> {
    this.api.currentScreenCode = ScreenCode.edit;
    return this.api.callApisForInitialize(
      ScreenCode.edit,
      'fetchEditInitData',
      {
        data: () =>
          this.api.get({
            apiId: Apis.getBusinessTypes_businessTypeId_,
            params: [id],
          }),
      }
    );
  }

  /**
   * 業種更新 API を呼ぶ
   * @param id ID
   * @param params パラメータ
   */
  updateBusinessType(id: string, params): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateBusinessType',
        this.api
          .put(
            {
              apiId: Apis.putBusinessTypes_businessTypeId_,
              params: [id],
            },
            params
          )
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * 業種一括登録テンプレート作成 API を呼ぶ
   * @param params パラメータ
   */
  requestBusinessTypeTemplateDownload(
    params: BusinessTypeFileCreateParams
  ): Promise<Api> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'requestBusinessTypeTemplateDownload',
        this.api
          .get(Apis.getBusinessTypesTemplateCreate, params)
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * 登録画面でブロックの値に依存するリソースを取得する
   * @param block ブロック
   */
  fetchBlockBelongingResource(block: string, screenCode: string) {
    const search_parameters = [
      {
        resource_path: 'business_type.item_names',
        condition_sets: [
          { condition: 'business_type.block_id', values: [block] },
        ],
      },
    ];

    const items = {
      screen_code: screenCode,
      search_parameters,
    };
    return new Promise<Resources>((resolve, reject) => {
      this.api.requestHandler(
        'fetchBlockBelongingResource',
        this.api
          .post(Apis.postApplicationsViewsResourcesSearch, items)
          .subscribe(res => resolve(this.resource.parse(res.result_data)))
      );
    });
  }

  /**
   * 一覧/削除モーダル用指定項目取得
   */
  fetchIndexDeleteFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchIndexDeleteFields',
        this.api
          .fetchFields(FunctionCode.listDeleteFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 一覧/ダウンロード用指定項目
   */
  fetchIndexDownloadFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchIndexDownloadFields',
        this.api
          .fetchFields(FunctionCode.listDownloadFunction)
          .subscribe(res => resolve(res))
      );
    });
  }
}
