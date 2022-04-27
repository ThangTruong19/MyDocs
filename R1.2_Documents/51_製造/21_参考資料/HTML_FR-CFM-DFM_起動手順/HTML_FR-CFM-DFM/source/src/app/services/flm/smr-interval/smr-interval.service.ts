import { Injectable } from '@angular/core';
import * as _ from 'lodash';

import { RequestHeaderParams } from '../../../types/request';
import {
  SmrIntervalParams,
  ModelTypesSmrIntervalParams,
  SmrIntervalCarEditParams,
} from '../../../types/flm/smr-interval';
import { Fields } from '../../../types/common';

import { ScreenCode } from '../../../constants/flm/screen-codes/smr-interval-item-management';
import { FunctionCode } from '../../../constants/flm/function-codes/smr-interval-item-management';
import { Apis } from '../../../constants/apis';

import { ApiService } from '../../api/api.service';
import { ResourceService } from '../../api/resource.service';

@Injectable()
export class SmrIntervalService {
  constructor(private api: ApiService, private resource: ResourceService) {}

  fetchInitNew(opt?: any): Promise<any> {
    this.api.currentScreenCode = ScreenCode.regist;
    return this.api.callApisForInitialize(ScreenCode.regist, 'fetchInitNew', {
      refFields: () => this.api.fetchFields(FunctionCode.settingFunction),
    });
  }

  /**
   * SMRインターバル管理変更画面の初期化APIを呼ぶ
   * @param params クエリーパラメータ
   */
  fetchEditInitData(params): Promise<any> {
    this.api.currentScreenCode = ScreenCode.edit;
    return this.api.callApisForInitialize(ScreenCode.edit, 'fetchInitEdit', {
      target: () =>
        this.api.get(Apis.getSmrIntervalItems, params, { cache: false }),
      refFields: () => this.api.fetchFields(FunctionCode.settingFunction),
    });
  }

  /**
   * SMRインターバル管理項目登録 API をコール
   * @param params パラメータ
   */
  createSmrIntervalItems(params: SmrIntervalParams): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createSmrIntervalItems',
        this.api
          .post(Apis.postSmrIntervalItems, params)
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * SMRインターバル管理項目更新 API をコール
   * @param params パラメータ
   * @param smr_interval_item_id 編集したSMRインターバル項目ID
   * @param update_datetime 更新日時
   */
  updateSmrIntervalItems(
    params: SmrIntervalParams,
    smr_interval_item_id: string,
    update_datetime: string
  ): Promise<any> {
    _.set(params.smr_interval_item, 'update_datetime', update_datetime);
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateSmrIntervalItems',
        this.api
          .put(
            {
              apiId: Apis.putSmrIntervalItems_smrIntervalItemId_,
              params: [smr_interval_item_id],
            },
            params
          )
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * 条件リスト取得 API をコール
   * @param params パラメータ
   */
  fetchModelTypesSmrIntervalList(
    params: ModelTypesSmrIntervalParams,
    requestHeaderParams: RequestHeaderParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchModelTypesSmrIntervalList',
        this.api
          .get(Apis.getModelTypesSmrIntervalItems, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * SMRインターバル管理項目一覧の初期化APIを呼ぶ
   */
  fetchIndexInitData() {
    this.api.currentScreenCode = ScreenCode.list;
    return this.api.callApisForInitialize(
      ScreenCode.list,
      'fetchIndexInitData',
      {
        updatable: Apis.putSmrIntervalItems_smrIntervalItemId_,
        deletable: Apis.deleteSmrIntervalItems_smrIntervalItemId_,
        fields: () => this.api.fetchFields(FunctionCode.listFunction),
      }
    );
  }

  /**
   * SMRインターバル管理項目一覧取得 API を実行
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
          .get(Apis.getSmrIntervalItems, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * 車両毎SMRインターバル管理項目一覧取得 API を実行する
   * @param params パラメータ
   */
  fetchCarsSmrIntervalItems(
    params: any,
    requestHeaderParams: RequestHeaderParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchCarsSmrIntervalItems',
        this.api
          .post(Apis.postCarsSmrIntervalItemsSearch, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * SMRインターバル管理項目管理 設定一覧画面の初期表示に必要な情報を取得する。
   */
  fetchSmrIntervalCarIndexInitData(): Promise<any> {
    this.api.currentScreenCode = ScreenCode.carList;
    return this.api.callApisForInitialize(
      ScreenCode.carList,
      'fetchSmrIntervalCarIndexInitData',
      {
        updatable: Apis.putCars_carId_SmrIntervalItems,
        fields: () => this.api.fetchFields(FunctionCode.carListFunction),
        fieldResources: () =>
          this.api.fetchFieldResources(FunctionCode.carListFunction),
        searchCondition: () =>
          this.api.fetchSearchCondition(ScreenCode.carList),
        downloadFields: () =>
          this.api.fetchFields(FunctionCode.carListDownloadFunction),
        downloadFieldResources: () =>
          this.api.fetchFieldResources(FunctionCode.carListDownloadFunction),
      }
    );
  }

  /**
   * SMRインターバル管理項目削除 API を実行
   * @param smr_interval_id SMRインターバル管理項目ID
   * @param update_datetime 更新日時
   */
  deleteSmrInterval(
    smr_interval_id: string,
    update_datetime: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'deleteSmrInterval',
        this.api
          .delete(
            {
              apiId: Apis.deleteSmrIntervalItems_smrIntervalItemId_,
              params: [smr_interval_id],
            },
            { update_datetime }
          )
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * SMRインターバル管理項目 車両設定変更画面の初期化APIを呼ぶ
   * @param params クエリーパラメータ
   */
  fetchCarEditInitData(carId: string): Promise<any> {
    this.api.currentScreenCode = ScreenCode.carEdit;
    return this.api.callApisForInitialize(
      ScreenCode.carEdit,
      'fetchInitCarEdit',
      {
        items: () =>
          this.api.post(Apis.postCarsSmrIntervalItemsSearch, {
            common: {
              car_identification: {
                car_ids: [carId],
              },
            },
          }),
        latestCarCondition: () =>
          this.api.get(
            {
              apiId: Apis.getCars_carId_Latest,
              params: [carId],
            },
            {},
            {
              request_header: {
                'X-TimeUnit': '2',
              },
            }
          ),
      }
    );
  }

  /**
   * 車両毎SMRインターバル管理項目更新 API を実行
   * @param car_id 車両 ID
   * @param param パラメータ
   */
  updateCarsSmrIntervalItems(
    carId: string,
    params: SmrIntervalCarEditParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateCarsSmrIntervalItems',
        this.api
          .put(
            {
              apiId: Apis.putCars_carId_SmrIntervalItems,
              params: [carId],
            },
            params
          )
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * 担当DBに対応する車両所属リソースの取得API
   * @param supportDistributorIds 担当DBのID
   * @param belongResourcePaths 担当DBに依存するリソースのパス
   */
  getSupportDbBelong(
    supportDistributorIds: string[],
    belongResourcePaths: string[]
  ): Promise<any> {
    const condition = 'common.support_distributor.ids';
    return this.getBelongResource(
      supportDistributorIds,
      condition,
      belongResourcePaths
    );
  }

  /**
   * 担当DB組織コードに対応する車両所属リソースの取得API
   * @param supportDbOrgCodes 担当DB組織コードのID
   * @param belongResourcePaths 担当DBに依存するリソースのパス
   */
  getSupportDbOrgCodeBelong(
    supportDbOrgCodes: string[],
    belongResourcePaths
  ): Promise<any> {
    const condition = 'common.support_distributor.organization_codes';
    return this.getBelongResource(
      supportDbOrgCodes,
      condition,
      belongResourcePaths
    );
  }

  /**
   * 担当DB及び担当DB組織コードに対応する車両所属リソースを取得する
   * @param values 指定した担当DB or 担当DB組織コードのID
   * @param condition 指定した担当DB or 担当DB組織コードのパス
   * @param belongResourcePaths 担当DBに依存するリソースのパス
   */
  getBelongResource(values, condition, belongResourcePaths): Promise<any> {
    const params = _.map(belongResourcePaths, path => {
      return {
        resource_path: path,
        condition_sets: [
          {
            values,
            condition,
          },
        ],
      };
    });

    return this._fetchResource('getBelongResource', params);
  }

  /**
   * 検索条件の更新
   * @param params APIパラメータ
   */
  updateCarSearchCondition(params) {
    return this.api.updateSearchCondition(ScreenCode.carList, params);
  }

  /**
   * 検索条件をリセット
   */
  initCarSearchCondition() {
    return this.api.initSearchCondition(ScreenCode.carList);
  }

  /**
   * サービスDBに対応するサービスDB組織コードリソースの取得API
   * @param serviceDbId サービスDBのID
   */
  getServiceDbOrgCode(serviceDbId: string): Promise<any> {
    const params = [
      {
        resource_path: 'common.service_distributor.organization_codes',
        condition_sets: [
          {
            values: [serviceDbId],
            condition: 'common.service_distributor.ids',
          },
        ],
      },
    ];

    return this._fetchResource('getServiceDbOrgCode', params);
  }

  /**
   * サービスDB組織コードに対応するサービスDBリソースの取得API
   * @param serviceDbId サービスDB組織コード
   */
  getServiceDb(serviceDbOrgCode: string): Promise<any> {
    const params = [
      {
        resource_path: 'common.service_distributor.ids',
        condition_sets: [
          {
            values: [serviceDbOrgCode],
            condition: 'common.service_distributor.organization_codes',
          },
        ],
      },
    ];

    return this._fetchResource('getServiceDb', params);
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
          .get(Apis.getSmrIntervalItemsFileCreate, params, {
            cache: false,
            request_header: headerParams,
          })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * ファイル作成APIを呼ぶ
   * @param params パラメータ
   * @param headerParams ヘッダ
   */
  createCarFile(params, headerParams: RequestHeaderParams): Promise<any> {
    headerParams['X-Count'] = null;
    headerParams['X-From'] = null;

    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createCarFile',
        this.api
          .post(Apis.postCarsSmrIntervalItemsSearchFileCreate, params, {
            cache: false,
            request_header: headerParams,
          })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 車種のリソースを取得
   * @param screenCode 画面ID
   */
  fetchDivisionResource(screenCode, supportDistributor?: string) {
    return new Promise<any>((resolve, reject) => {
      const searchParams = [
        {
          resource_path: 'division_code',
          kinds: ['D'],
          condition_sets: [
            {
              condition: 'smr_interval_item.support_distributor_id',
              values: [supportDistributor],
            },
          ],
        },
      ];

      if (supportDistributor == null) {
        delete searchParams[0].condition_sets;
      }

      this.api
        .fetchResource(screenCode, searchParams)
        .subscribe(res => resolve(res), error => reject(error));
    });
  }

  /**
   * 一覧/指定項目リソース取得
   */
  fetchIndexFieldResources() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchIndexFieldResources',
        this.api
          .fetchFieldResources(FunctionCode.listFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 一覧/ダウンロード用指定項目リソース取得
   */
  fetchIndexDownloadFieldResources() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchIndexDownloadFieldResources',
        this.api
          .fetchFieldResources(FunctionCode.listDownloadFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 一覧/詳細モーダル用指定項目取得
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
   * 一覧/削除モーダルの車両台数用指定項目取得
   */
  fetchIndexCountCarFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchIndexCountCarFields',
        this.api
          .fetchFields(FunctionCode.listCountCarFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 一覧/ダウンロード用指定項目取得
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

  /**
   * リソース取得APIリクエスト
   * @param requestName リクエスト名
   * @param searchParameters 検索パラメータ
   */
  private _fetchResource(requestName: string, searchParameters): Promise<any> {
    const params = {
      screen_code: ScreenCode.carList,
      search_parameters: searchParameters,
    };
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        requestName,
        this.api
          .post(Apis.postApplicationsViewsResourcesSearch, params)
          .subscribe(
            res => resolve(this.resource.parse(res.result_data)),
            err => reject(err)
          )
      );
    });
  }
}
