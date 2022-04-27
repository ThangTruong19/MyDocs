import { Injectable } from '@angular/core';

import { RequestHeaderParams } from '../../../types/request';
import { Api, Resources, Fields } from '../../../types/common';
import { CustomerParams } from '../../../types/flm/customer';

import { ScreenCode } from '../../../constants/flm/screen-codes/customer-management';
import { FunctionCode } from '../../../constants/flm/function-codes/customer-management';
import { Apis } from '../../../constants/apis';

import { ResourceService } from '../../../services/api/resource.service';
import { ApiService } from '../../api/api.service';

@Injectable()
export class CustomerService {
  constructor(private api: ApiService, private resource: ResourceService) {}

  /**
   * 顧客登録の初期表示に必要な情報を取得
   *
   * @return {Object} 初期パラメータ群
   */
  fetchInitNew(opt?: any): Promise<any> {
    this.api.currentScreenCode = ScreenCode.regist;
    return this.api.callApisForInitialize(ScreenCode.regist, 'fetchInitNew');
  }

  /**
   * 顧客登録 API をコール
   * @param params パラメータ
   */
  createCustomer(params: CustomerParams): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createCustomer',
        this.api
          .post(Apis.postCustomers, params)
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * 顧客一覧の初期表示に必要な情報を取得
   */
  fetchIndexInitData() {
    this.api.currentScreenCode = ScreenCode.list;
    return this.api.callApisForInitialize(
      ScreenCode.list,
      'fetchIndexInitData',
      {
        updatable: Apis.putCustomers_customerId_,
        deletable: Apis.deleteCustomers_customerId_,
        fields: () => this.api.fetchFields(FunctionCode.listFunction),
      }
    );
  }

  /**
   * 一覧画面のリスト取得APIを呼ぶ
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ
   */
  fetchIndexList(
    params,
    requestHeaderParams: RequestHeaderParams
  ): Promise<Api> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchIndexList',
        this.api
          .get(Apis.getCustomers, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 顧客詳細取得 API をコール
   * @param id 顧客ID
   * @param requestHeaderParams ヘッダ情報
   */
  fetchCustomerDetail(
    id: string,
    requestHeaderParams: RequestHeaderParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchCustomerDetail',
        this.api
          .get(
            {
              apiId: Apis.getCustomers_customerId_Detail,
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
   * 車両管理一覧取得APIリクエスト
   * @param params リクエストパラメータ
   * @param requestHeaderParams ヘッダ情報
   */
  fetchCarListData(params, requestHeaderParams): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchCarListData',
        this.api
          .post(Apis.postCarsManagementSearch, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 顧客削除 API をコール
   * @param id ID
   * @param update_datetime 更新日時
   */
  deleteCustomer(id: string, update_datetime: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'deleteCustomer',
        this.api
          .delete(
            {
              apiId: Apis.deleteCustomers_customerId_,
              params: [id],
            },
            { update_datetime }
          )
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 顧客変更画面の初期化APIを呼ぶ
   * @param id 顧客 ID
   */
  fetchEditInitData(id: string): Promise<any> {
    this.api.currentScreenCode = ScreenCode.edit;
    return this.api.callApisForInitialize(
      ScreenCode.edit,
      'fetchEditInitData',
      {
        item: () =>
          this.api.get({
            apiId: Apis.getCustomers_customerId_Detail,
            params: [id],
          }),
      }
    );
  }

  /**
   * 顧客更新 API をコール
   * @param id ID
   * @param params パラメータ
   */
  updateCustomer(id: string, params: CustomerParams): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateCustomer',
        this.api
          .put(
            {
              apiId: Apis.putCustomers_customerId_,
              params: [id],
            },
            params
          )
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * 顧客一括テンプレートダウンロード API を呼ぶ
   * @param params パラメータ
   * @param requestHeaderParams ヘッダー情報
   */
  requestCustomerTemplateDownload(params): Promise<Api> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'requestCustomerTemplateDownload',
        this.api
          .get(Apis.getCustomersTemplateCreate, params)
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * 業種のリソースを取得する
   * @param screenCode 画面コード
   * @param supportDistributorId 担当DB
   */
  fetchBusinessTypeResource(screenCode: string, supportDistributorId: string) {
    const condition_sets = [
      {
        condition: 'customer.support_distributor_id',
        values: [supportDistributorId],
      },
    ];
    const resourcePaths = [
      'customer.attribute.business_type_id',
      'customer.administrator_role.authorities.id',
      'customer.general_role.authorities.id',
      'customer.administrator_role.authorities.default_kind',
      'customer.general_role.authorities.default_kind',
    ];

    if (screenCode === ScreenCode.regist) {
      resourcePaths.push(
        'customer.administrator_role.authorities.checked_items',
        'customer.general_role.authorities.checked_items'
      );
    }
    return new Promise<Resources>(resolve => {
      this.api.requestHandler(
        'fetchBusinessTypeResouce',
        this.api
          .fetchResource(
            screenCode,
            resourcePaths.map(resource_path => ({
              resource_path,
              condition_sets,
            }))
          )
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * ファイル作成APIを呼ぶ
   * @param params パラメータ
   * @param headerParams ヘッダ
   */
  createFile(params, headerParams: RequestHeaderParams): Promise<any> {
    headerParams['X-Count'] = null;
    headerParams['X-From'] = null;

    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createFile',
        this.api
          .get(Apis.getCustomersFileCreate, params, {
            cache: false,
            request_header: headerParams,
          })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 一覧/詳細画面の指定項目取得
   */
  fetchIndexDetailFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler('fetchIndexDetailFields',
        this.api
          .fetchFields(FunctionCode.listDetailFunction)
          .subscribe((res) => resolve(res))
      );
    });
  }

  /**
   * 一覧/削除モーダルの指定項目取得
   */
  fetchIndexDeleteFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler('fetchIndexDeleteFields',
        this.api
          .fetchFields(FunctionCode.listDeleteFunction)
          .subscribe((res) => resolve(res))
      );
    });
  }

  /**
   * 車両一覧の指定項目取得
   */
  fetchCarListFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler('fetchCarListFields',
        this.api
          .fetchFields(FunctionCode.listDetailCarFunction)
          .subscribe((res) => resolve(res))
      );
    });
  }

  /**
   * 一覧/ダウンロード指定項目取得
   */
  fetchIndexDownloadFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler('fetchIndexDownloadFields',
        this.api
          .fetchFields(FunctionCode.listDownloadFunction)
          .subscribe((res) => resolve(res))
      );
    });
  }

  /**
   * 一覧/指定項目リソース取得
   */
  fetchIndexFieldResources() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler('fetchCarListFieldResources',
        this.api
          .fetchFieldResources(FunctionCode.listFunction)
          .subscribe((res) => resolve(res))
      );
    });
  }
}
