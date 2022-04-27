import { Injectable } from '@angular/core';
import * as _ from 'lodash';

import { RequestHeaderParams } from '../../../types/request';
import { FuelParams } from '../../../types/flm/fuel';

import { ScreenCode } from '../../../constants/flm/screen-codes/fuel-management';
import { FunctionCode } from '../../../constants/flm/function-codes/fuel-management';
import { Apis } from '../../../constants/apis';

import { ApiService } from '../../api/api.service';
import { UserSettingService } from '../../api/user-setting.service';
import { ResourceService } from '../../api/resource.service';
import { Fields } from '../../../types/common';

@Injectable()
export class FuelService {
  constructor(
    private api: ApiService,
    private resource: ResourceService,
    private userSetting: UserSettingService
  ) {}

  /**
   * 登録画面の初期化に必要な API をコール
   */
  fetchInitNew(opt?: any): Promise<any> {
    this.api.currentScreenCode = ScreenCode.regist;
    return this.api.callApisForInitialize(ScreenCode.regist, 'fetchInitNew', {
      refFields: () => this.api.fetchFields(FunctionCode.settingFunction),
    });
  }

  /**
   * 累積燃料消費量インターバル管理項目登録 API をコール
   * @param params パラメータ
   */
  createFuel(params: FuelParams): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createFuel',
        this.api
          .post(Apis.postAccumulateFuelIntervalItems, params)
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * 累積燃料消費量インターバル管理変更画面の初期化 API をコール
   * @param params クエリーパラメータ
   */
  fetchEditInitData(params): Promise<any> {
    this.api.currentScreenCode = ScreenCode.edit;
    return this.api.callApisForInitialize(ScreenCode.edit, 'fetchInitEdit', {
      target: () =>
        this.api.get(Apis.getAccumulateFuelIntervalItems, params, {
          cache: false,
        }),
      refFields: () => this.api.fetchFields(FunctionCode.settingFunction),
    });
  }

  /**
   * 累積燃料消費量インターバル管理項目更新 API をコール
   * @param params パラメータ
   * @param id 累積燃料消費量インターバル項目ID
   * @param updateDatetime 更新日時
   */
  updateFuel(
    params: FuelParams,
    id: string,
    updateDatetime: string
  ): Promise<any> {
    _.set(
      params.accumulate_fuel_interval_item,
      'update_datetime',
      updateDatetime
    );
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateFuel',
        this.api
          .put(
            {
              apiId:
                Apis.putAccumulateFuelIntervalItems_accumulateFuelIntervalItemId_,
              params: [id],
            },
            params
          )
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * 機種型式別累積燃料消費量インターバル管理項目一覧取得 API をコール
   * @param params パラメータ
   */
  fetchModelTypesFuelList(
    params,
    requestHeaderParams: RequestHeaderParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchModelTypesFuelList',
        this.api
          .get(Apis.getModelTypesAccumulateFuelIntervalItems, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * 累積燃料消費量インターバル管理項目一覧の初期化APIを呼ぶ
   */
  fetchIndexInitData() {
    this.api.currentScreenCode = ScreenCode.list;
    return this.api.callApisForInitialize(
      ScreenCode.list,
      'fetchIndexInitData',
      {
        updatable:
          Apis.putAccumulateFuelIntervalItems_accumulateFuelIntervalItemId_,
        deletable:
          Apis.deleteAccumulateFuelIntervalItems_accumulateFuelIntervalItemId_,
        fields: () => this.api.fetchFields(FunctionCode.listFunction),
        fieldResources: () =>
          this.api.fetchFieldResources(FunctionCode.listFunction),
        detailFields: () =>
          this.api.fetchFields(FunctionCode.listDetailFunction),
        deleteFields: () =>
          this.api.fetchFields(FunctionCode.listDeleteFunction),
        downloadFields: () =>
          this.api.fetchFields(FunctionCode.listDownloadFunction),
        downloadFieldResources: () =>
          this.api.fetchFieldResources(FunctionCode.listDownloadFunction),
        countCarFields: () =>
          this.api.fetchFields(FunctionCode.listCountCarFunction),
      }
    );
  }

  /**
   * 累積燃料消費量インターバル管理項目一覧取得 API を実行
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
          .get(Apis.getAccumulateFuelIntervalItems, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res), err => reject(err))
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
          .get(Apis.getAccumulateFuelIntervalItemsFileCreate, params, {
            cache: false,
            request_header: headerParams,
          })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 累積燃料消費量インターバル管理項目削除 API を実行
   * @param id 累積燃料消費量インターバル管理項目ID
   * @param update_datetime 更新日時
   */
  deleteFuel(id: string, updateDatetime: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'deleteFuel',
        this.api
          .delete(
            {
              apiId:
                Apis.deleteAccumulateFuelIntervalItems_accumulateFuelIntervalItemId_,
              params: [id],
            },
            { update_datetime: updateDatetime }
          )
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * 車両毎累積燃料消費量インターバル管理項目一覧取得 API を実行する
   * @param params パラメータ
   */
  fetchCarsFuelList(
    params: any,
    requestHeaderParams: RequestHeaderParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchCarsFuelList',
        this.api
          .post(Apis.postCarsAccumulateFuelIntervalItemsSearch, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * 車両毎累積燃料消費量インターバル管理項目管理 設定一覧画面の初期表示に必要な情報を取得する。
   */
  fetchFuelCarIndexInitData(): Promise<any> {
    this.api.currentScreenCode = ScreenCode.carList;
    return this.api.callApisForInitialize(
      ScreenCode.carList,
      'fetchFuelCarIndexInitData',
      {
        updatable: Apis.putCars_carId_AccumulateFuelIntervalItems,
        fields: () => this.api.fetchFields(FunctionCode.carListFunction),
        searchCondition: () =>
          this.api.fetchSearchCondition(ScreenCode.carList),
      }
    );
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
  createCarFile(params, headerParams: RequestHeaderParams): Promise<any> {
    headerParams['X-Count'] = null;
    headerParams['X-From'] = null;

    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createCarFile',
        this.api
          .post(
            Apis.postCarsAccumulateFuelIntervalItemsSearchFileCreate,
            params,
            { cache: false, request_header: headerParams }
          )
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 車両設定変更画面の初期化APIを呼ぶ
   * @param params クエリーパラメータ
   */
  fetchCarEditInitData(carId: string): Promise<any> {
    this.api.currentScreenCode = ScreenCode.carEdit;
    return this.api.callApisForInitialize(
      ScreenCode.carEdit,
      'fetchCarEditInitData',
      {
        items: () =>
          this.api.post(Apis.postCarsAccumulateFuelIntervalItemsSearch, {
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
            {}
          ),
      }
    );
  }

  /**
   * 車両毎累積燃料消費量インターバル管理項目更新 API を実行
   * @param car_id 車両 ID
   * @param param パラメータ
   */
  updateCarsFuelItems(carId: string, params): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateCarsFuelItems',
        this.api
          .put(
            {
              apiId: Apis.putCars_carId_AccumulateFuelIntervalItems,
              params: [carId],
            },
            params
          )
          .subscribe(res => resolve(res), err => reject(err))
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
              condition: 'accumulate_fuel_interval_item.support_distributor_id',
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
   * 車両毎設定一覧/ダウンロード用指定項目取得
   */
  fetchCarIndexDownloadFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchCarIndexDownloadFields',
        this.api
          .fetchFields(FunctionCode.carListDownloadFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 車両毎設定一覧/指定項目リソース取得
   */
  fetchCarIndexFieldResouces() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchCarIndexFieldResouces',
        this.api
          .fetchFieldResources(FunctionCode.carListFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 車両毎設定一覧/ダウンロード用指定項目リソース取得
   */
  fetchCarIndexDownloadFieldResources() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchCarIndexDownloadFieldResources',
        this.api
          .fetchFieldResources(FunctionCode.carListDownloadFunction)
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
