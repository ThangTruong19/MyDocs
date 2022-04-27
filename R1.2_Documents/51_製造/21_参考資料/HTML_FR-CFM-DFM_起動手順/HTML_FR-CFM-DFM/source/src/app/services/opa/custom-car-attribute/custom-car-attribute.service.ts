import { Injectable } from '@angular/core';

import { RequestHeaderParams } from '../../../types/request';
import { CustomCarAttributeParams } from '../../../types/opa/custom-car-attribute';

import { ScreenCode } from '../../../constants/opa/screen-codes/custom-car-attribute-management';
import { FunctionCode } from '../../../constants/opa/function-codes/custom-car-attribute-management';
import { Apis } from '../../../constants/apis';

import { ApiService } from '../../../services/api/api.service';
import { ResourceService } from '../../../services/api/resource.service';
import { Resources, Fields } from '../../../types/common';

@Injectable()
export class CustomCarAttributeService {
  constructor(private api: ApiService, private resource: ResourceService) {}

  /**
   * カスタム車両登録の初期化に必要な API コール
   */
  fetchNewInitData() {
    this.api.currentScreenCode = ScreenCode.regist;
    return this.api.callApisForInitialize(
      ScreenCode.regist,
      'fetchNewInitData'
    );
  }

  /**
   * 担当DBの選択値が変更された場合、それに対応した顧客を取得してくる
   * @param screen_code 画面ID
   * @param opt ブロック
   */
  fetchFieldNoByBlockId(screen_code, opt) {
    const search_parameters = [
      'custom_car_attribute.field_no',
      'custom_car_attribute.names',
      'custom_car_attribute.details',
    ].map(path => ({
      resource_path: path,
      condition_sets: [
        { condition: 'custom_car_attribute.block_id', values: [opt.block_id] },
      ],
    }));
    const items = { screen_code, search_parameters };
    return new Promise<Resources>((resolve, reject) => {
      this.api.requestHandler(
        'fetchFieldNoByBlockId',
        this.api
          .post(Apis.postApplicationsViewsResourcesSearch, items)
          .subscribe(res => resolve(this.resource.parse(res.result_data)))
      );
    });
  }

  /**
   * カスタム車両属性登録 API を実行
   * @param params パラメータ
   */
  createCustomCarAttributeService(params: CustomCarAttributeParams) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createCustomCarAttributeService',
        this.api
          .post(Apis.postCustomCarAttributes, params)
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * カスタム車両属性一覧の初期化 API を呼ぶ
   */
  fetchIndexInitData() {
    this.api.currentScreenCode = ScreenCode.list;
    return this.api.callApisForInitialize(
      ScreenCode.list,
      'fetchIndexInitData',
      {
        updatable: Apis.putCustomCarAttributes_customCarAttributeId_,
        deletable: Apis.deleteCustomCarAttributes_customCarAttributeId_,
        fields: () => this.api.fetchFields(FunctionCode.listFunction),
      }
    );
  }

  /**
   * カスタム車両属性一覧取得 API を実行
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ
   * @param opt オプション
   */
  fetchIndexList(
    params,
    requestHeaderParams: RequestHeaderParams,
    opt?: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchIndexList',
        this.api
          .get(Apis.getCustomCarAttributes, params, {
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
   * カスタム車両属性詳細取得 API を実行
   * @param id: カスタム車両属性ID
   */
  fetchCustomCarAttributeDetail(id, header: RequestHeaderParams): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchCustomCarAttributeDetail',
        this.api
          .get(
            {
              apiId: Apis.getCustomCarAttributes_customCarAttributeId_,
              params: [id],
            },
            {},
            { request_header: header }
          )
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * カスタム車両属性削除 API を実行
   * @param custom_car_attribute_id カスタム車両属性 ID
   * @param update_datetime 更新日時
   */
  deleteCustomCarAttribute(
    custom_car_attribute_id: string,
    update_datetime: string
  ) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'deleteCustomCarAttribute',
        this.api
          .delete(
            {
              apiId: Apis.deleteCustomCarAttributes_customCarAttributeId_,
              params: [custom_car_attribute_id],
            },
            { update_datetime }
          )
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * カスタム車両属性変更画面の初期化に必要な API を呼び出す
   * @param id カスタム車両属性ID
   */
  fetchEditInitData(id: string): any {
    this.api.currentScreenCode = ScreenCode.edit;
    return this.api.callApisForInitialize(
      ScreenCode.edit,
      'fetchEditInitData',
      {
        item: () =>
          this.api.get({
            apiId: Apis.getCustomCarAttributes_customCarAttributeId_,
            params: [id],
          }),
      }
    );
  }

  /**
   * カスタム車両属性を更新する
   * @param id ID
   * @param params パラメータ
   */
  updateCustomCarAttributeService(id: string, params) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateCustomCarAttributeService',
        this.api
          .put(
            {
              apiId: Apis.putCustomCarAttributes_customCarAttributeId_,
              params: [id],
            },
            params
          )
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 登録画面のリソースを再取得する
   */
  fetchRegistResource() {
    return new Promise((resolve, reject) => {
      this.api
        .fetchResource(ScreenCode.regist)
        .subscribe(res => resolve(res), error => reject(error));
    });
  }

  /**
   * カスタム属性一覧/削除モーダル用指定項目取得
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
   * カスタム属性一覧/削除モーダル用指定項目取得
   */
  fetchIndexDetailFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchIndexDetailFields',
        this.api
          .fetchFields(FunctionCode.listDetailFunction)
          .subscribe(res => resolve(res))
      );
    });
  }
}
