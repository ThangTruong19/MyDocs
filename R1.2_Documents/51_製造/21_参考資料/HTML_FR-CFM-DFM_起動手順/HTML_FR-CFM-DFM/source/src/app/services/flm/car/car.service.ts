import * as _ from 'lodash';
import { Injectable } from '@angular/core';

import { RequestHeaderParams } from '../../../types/request';
import { SearchItems } from '../../../types/search';
import {
  CarTemplateCreateParams,
  TimeDifferenceSettingParams,
} from '../../../types/flm/car';

import { ApiService } from '../../api/api.service';
import { ResourceService } from '../../api/resource.service';

import { Apis } from '../../../constants/apis';
import { ResourceKind } from '../../../constants/resource-type';
import { ScreenCode } from '../../../constants/flm/screen-codes/car-management';
import { FunctionCode } from '../../../constants/flm/function-codes/car-management';
import { Fields } from '../../../types/common';

@Injectable()
export class CarService {
  constructor(private api: ApiService, private resource: ResourceService) {}

  /**
   * 車両管理一覧画面の初期表示に必要な情報を取得
   */
  fetchCarInitData() {
    this.api.currentScreenCode = ScreenCode.list;
    return this.api.callApisForInitialize(ScreenCode.list, 'fetchCarInitData', {
      fields: () => this.api.fetchFields(FunctionCode.listFunction),
      downloadFields: () =>
        this.api.fetchFields(FunctionCode.listDownloadFunction),
      updatable: Apis.putCars_carId_,
      deletable: Apis.deleteCars,
      fieldResources: () =>
        this.api.fetchFieldResources(FunctionCode.listFunction),
      searchCondition: () => this.api.fetchSearchCondition(ScreenCode.list),
    });
  }

  /**
   * 車両管理一覧取得APIリクエスト
   * @param params リクエストパラメータ
   * @param requestHeaderParams ヘッダ情報
   */
  fetchCarIndexList(
    params,
    requestHeaderParams: RequestHeaderParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchCarIndexList',
        this.api
          .post(Apis.postCarsManagementSearch, params, {
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
   * 車両登録の初期表示に必要な情報を取得
   *
   * @return {Object} 初期パラメータ群
   */
  fetchInitNew(opt?: any): Promise<any> {
    this.api.currentScreenCode = ScreenCode.regist;
    return this.api.callApisForInitialize(
      ScreenCode.regist,
      'fetchInitNew',
      {},
      {
        search_parameters: [
          { kinds: [ResourceKind.global, ResourceKind.nothing] },
        ],
      }
    );
  }

  /**
   * 車両管理登録APIリクエスト
   * @param params リクエストパラメータ
   */
  createCar(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createCar',
        this.api
          .post(Apis.postCars, params)
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * ORBCOMM申請APIリクエスト
   * @param id 車両ID
   * @param params リクエストパラメータ
   */
  applyOrbcomm(id: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'applyOrbcomm',
        this.api
          .post(
            {
              apiId: Apis.postCars_carId_Orbcomm,
              params: [id],
            },
            params,
            { screenCode: FunctionCode.terminalStartSettingOrbcommFunction }
          )
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * 車両登録画面表示制御APIリクエスト
   * @param params リクエストパラメータ
   */
  carRegistrationControl(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'carRegistrationControl',
        this.api
          .post(Apis.postApplicationsCarManagementRegistrationControl, params)
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * オペ初期化の初期表示に必要な情報を取得
   */
  fetchCarOperatorInitInitData(): Promise<any> {
    this.api.currentScreenCode = ScreenCode.operatorInitialize;
    return this.api.callApisForInitialize(
      ScreenCode.operatorInitialize,
      'fetchInputCarIndexInitData',
      {
        fields: () =>
          this.api.fetchFields(FunctionCode.operatorInitializeFunction),
        initFields: () =>
          this.api.fetchFields(FunctionCode.operatorInitializeConfirmFunction),
        fieldResources: () =>
          this.api.fetchFieldResources(FunctionCode.operatorInitializeFunction),
        searchCondition: () =>
          this.api.fetchSearchCondition(ScreenCode.operatorInitialize),
        enableInit: Apis.deleteCarsRequestsOperatorIdentificationOffS2m,
      }
    );
  }

  /**
   * 車両変更の初期表示に必要な情報を取得
   *
   * @return {Object} 初期パラメータ群
   */
  fetchEditInitData(params): Promise<any> {
    this.api.currentScreenCode = ScreenCode.edit;
    return this.api.callApisForInitialize(
      ScreenCode.edit,
      'fetchEditInitData',
      {
        target: () =>
          this.api.post(Apis.postCarsManagementSearch, params, {
            cache: false,
          }),
      },
      {
        search_parameters: [
          { kinds: [ResourceKind.global, ResourceKind.nothing] },
        ],
      }
    );
  }

  /**
   * 車両端末載せ替えの初期表示に必要な情報を取得
   *
   * @return {Object} 初期パラメータ群
   */
  fetchInitTerminalChange(opt?: any): Promise<any> {
    this.api.currentScreenCode = ScreenCode.terminalChange;
    return this.api.callApisForInitialize(
      ScreenCode.terminalChange,
      'fetchInitTerminalChange',
      {},
      {
        search_parameters: [
          { kinds: [ResourceKind.global, ResourceKind.nothing] },
        ],
      }
    );
  }

  /**
   * 端末開始設定の初期表示に必要な情報を取得
   */
  fetchStartSettingInitData(): Promise<any> {
    this.api.currentScreenCode = ScreenCode.terminalStartSetting;
    return this.api.callApisForInitialize(
      ScreenCode.terminalStartSetting,
      'fetchStartSettingInitData',
      {
        fields: () =>
          this.api.fetchFieldsWithWordBreak(FunctionCode.terminalStartSettingFunction),
        fieldResources: () =>
          this.api.fetchFieldResources(
            FunctionCode.terminalStartSettingFunction
          ),
        startSettingFields: () =>
          this.api.fetchFields(
            FunctionCode.terminalStartSettingConfirmFunction
          ),
        orbcommApplyFields: () =>
          this.api.fetchFields(
            FunctionCode.terminalStartSettingOrbcommFunction
          ),
        enableOrbcomm: Apis.postCars_carId_Orbcomm,
        enableStartSetting: Apis.putCarsRequestSetsTerminalStartSettingS2m,
      }
    );
  }

  /**
   * 時差設定変更の初期表示に必要な情報を取得
   */
  fetchTimeDifferenceSettingInitData(): Promise<any> {
    this.api.currentScreenCode = ScreenCode.timeDifferenceSetting;
    return this.api.callApisForInitialize(
      ScreenCode.timeDifferenceSetting,
      'fetchTimeDifferenceSettingInitData',
      {
        fields: () =>
          this.api.fetchFields(FunctionCode.timeDifferenceSettingFunction),
        fieldResources: () =>
          this.api.fetchFieldResources(
            FunctionCode.timeDifferenceSettingFunction
          ),
        retryFields: () =>
          this.api.fetchFields(FunctionCode.timeDifferenceSettingRetryFunction),
        editFields: () =>
          this.api.fetchFields(FunctionCode.timeDifferenceSettingEditFunction),
        editConfirmFields: () =>
          this.api.fetchFields(
            FunctionCode.timeDifferenceSettingEditConfirmFunction
          ),
        deletable: Apis.deleteCars,
        enableTimeDifferenceSetting:
          Apis.putCarsRequestSetsTimeDifferenceSettingS2m,
      }
    );
  }

  /**
   * 車両管理の更新 API
   * @param id 車両の ID
   * @param params パラメタ
   */
  updateCars(id: string, params): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateCars',
        this.api
          .put(
            {
              apiId: Apis.putCars_carId_,
              params: [id],
            },
            params,
            {
              exclusionKeys: [
                'car.distributor_attribute.free_memo',
                'car.distributor_attribute.note_1',
                'car.distributor_attribute.note_2',
                'car.distributor_attribute.note_3',
                'car.distributor_attribute.note_4',
                'car.distributor_attribute.note_5',
              ],
            }
          )
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
          .post(Apis.postCarsManagementSearchFileCreate, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 車両管理 一覧の検索条件を更新
   * @param params APIパラメータ
   */
  updateCarSearchCondition(params): Promise<any> {
    return this.api.updateSearchCondition(ScreenCode.list, params);
  }

  /**
   * 車両管理 一覧の検索条件を初期化
   */
  initCarSearchCondition(): Promise<any> {
    return this.api.initSearchCondition(ScreenCode.list);
  }

  /**
   * 車両管理 オペ識別初期化の検索条件を更新
   */
  updateCarOperatorSearchCondition(params: SearchItems): Promise<any> {
    return this.api.updateSearchCondition(
      ScreenCode.operatorInitialize,
      params
    );
  }

  /**
   * 車両管理 オペ識別初期化の検索条件を初期化
   */
  initCarOperatorSearchCondition(): Promise<any> {
    return this.api.initSearchCondition(ScreenCode.operatorInitialize);
  }

  /**
   * 車両管理削除APIリクエスト
   * @param params リクエストパラメータ
   */
  deleteCars(params, screenCode?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'deleteCars',
        this.api
          .delete(Apis.deleteCars, params, { screenCode })
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * 端末開始設定API
   * @param params パラメータ
   */
  updataTerminalStartSetting(params, screenCode?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updataTerminalStartSetting',
        this.api
          .put(Apis.putCarsRequestSetsTerminalStartSettingS2m, params, {
            screenCode,
          })
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * 端末載せ替え実施APIリクエスト
   * @param carId 車両ID
   * @param params リクエストパラメータ
   */
  changeTerminal(carId: string, params): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'changeTerminal',
        this.api
          .put(
            {
              apiId: Apis.putCars_carId_TerminalChange,
              params: [carId],
            },
            params
          )
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * 時差設定更新要求APIリクエスト
   * @param params リクエストパラメータ
   */
  updataTimeDifferenceSetting(
    params: TimeDifferenceSettingParams,
    screenCode?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updataTimeDifferenceSetting',
        this.api
          .put(Apis.putCarsRequestSetsTimeDifferenceSettingS2m, params, {
            screenCode,
          })
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * 車両一括登録テンプレートファイル作成APIリクエスト
   * @param params リクエストパラメータ
   */
  templateCreate(params: CarTemplateCreateParams, xFields: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'templateCreate',
        this.api
          .get(Apis.getCarsManagementTemplateCreate, params, {
            request_header: { 'X-Fields': xFields },
          })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 車両最新情報取得APIリクエスト
   * @param carId 車両ID
   */
  fetchCarLatest(carId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchCarLatest',
        this.api
          .get({
            apiId: Apis.getCars_carId_Latest,
            params: [carId],
          })
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * 担当DBに対応する車両所属リソースの取得API
   * @param supportDistributorIds 担当DBのID
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
   * 車両IDに対応する端末品番・端末シリアルリソースの取得API
   * @param carid 車両ID
   */
  fetchCarIdBelongResource(screenCode: string, carId: string): Promise<any> {
    const paths = [
      'car.komtrax_unit.terminal_component.serial',
      'car.komtrax_unit.terminal_component.part',
    ];

    const params = paths.map(path => ({
      resource_path: path,
      condition_sets: [
        {
          values: [carId],
          condition: 'car_id',
        },
      ],
    }));

    return new Promise(resolve => {
      this.api.fetchResource(screenCode, params).subscribe(res => resolve(res));
    });
  }

  /**
   * サービスDB組織コードに対応するサービスDBリソースの取得API
   * @param serviceDbId サービスDB組織コード
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
   * 担当DBに対応する車両所属リソースの取得API
   * @param supportDistributorIds 担当DBのID
   */
  getBelongResource(values, condition, belongResourcePaths): Promise<any> {
    const params = _.map(belongResourcePaths, path => {
      return {
        resource_path: path,
        condition_sets: [
          {
            values: values,
            condition: condition,
          },
        ],
      };
    });
    return this._fetchResource('getBelongResource', params, ScreenCode.list);
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

    return this._fetchResource('getServiceDbOrgCode', params, ScreenCode.list);
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
    return this._fetchResource('getServiceDb', params, ScreenCode.list);
  }

  /**
   * 担当DBに対応する顧客リソースの取得API
   * @param serviceDbId サービスDBのID
   */
  getCustomers(supportDbId: string, screenCode: string): Promise<any> {
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

    return this._fetchResource('getCustomers', params, screenCode);
  }

  /**
   * 車両登録画面表示制御APIの返却値に対応するリソースを取得する
   * @param resourcePaths リソースパスの配列
   */
  getDetailSubmitResource(
    resourcePaths: string[],
    supportDbId?: string
  ): Promise<any> {
    resourcePaths = resourcePaths.filter(
      path =>
        ![
          'car.car_management_attribute.time_difference',
          'car.car_management_attribute.time_difference_minute',
        ].includes(path)
    );
    const params = _.map(resourcePaths, path => {
      const param: any = {
        resource_path: path,
        kinds: [ResourceKind.global, ResourceKind.nothing],
      };

      if (supportDbId != null) {
        param.condition_sets = [
          {
            values: [supportDbId],
            condition: 'car.support_distributor_id',
          },
        ];
      }

      return param;
    });
    return this._fetchResource(
      'getDetailSubmitResource',
      params,
      ScreenCode.regist
    );
  }

  /**
   * Orbcomm申請画面用のリソースを取得する
   * @param carId 担当DBID
   */
  getApplyOrbcommResourceByCarId(
    carId: string,
    screenCode: string
  ): Promise<any> {
    const params = [
      {
        resource_path: 'orbcomm_request.nation_id',
        condition_sets: [
          {
            values: [carId],
            condition: 'car_id',
          },
        ],
      },
    ];

    return this._fetchResource(
      'getApplyOrbcommResourceByCarId',
      params,
      screenCode
    );
  }

  /**
   * 登録・変更画面において担当代理店に依存するリソースを取得する
   * @param supportDbId 担当代理店ID
   */
  fetchSupportDistributorIdBelongParams(
    screenCode: string,
    supportDbId: string
  ) {
    let paths = ['car.car_identification.maker_code'];

    if (screenCode === ScreenCode.edit) {
      paths = paths.concat([
        'car.car_management_attribute.rental_car_kind',
        'car.distributor_attribute.asset_status_kind',
        'car.distributor_attribute.asset_owner_id',
        'car.distributor_attribute.custom_car_attribute_1_detail_id',
        'car.distributor_attribute.custom_car_attribute_2_detail_id',
        'car.distributor_attribute.custom_car_attribute_3_detail_id',
        'car.distributor_attribute.custom_car_attribute_4_detail_id',
        'car.distributor_attribute.custom_car_attribute_5_detail_id',
        'car.distributor_attribute.custom_car_attribute_6_detail_id',
        'car.distributor_attribute.custom_car_attribute_7_detail_id',
        'car.distributor_attribute.custom_car_attribute_8_detail_id',
        'car.distributor_attribute.custom_car_attribute_9_detail_id',
        'car.distributor_attribute.custom_car_attribute_10_detail_id',
        'car.distributor_attribute.class_1_id',
        'car.distributor_attribute.class_2_id',
        'car.distributor_attribute.class_3_id',
        'car.distributor_attribute.class_4_id',
        'car.distributor_attribute.class_5_id',
        'car.distributor_attribute.spec_pattern_id',
        'car.customer_id',
        'car.bank_id',
        'car.finance_id',
        'car.insurance_id',
      ]);
    }

    const condition = {
      values: [supportDbId],
      condition: 'car.support_distributor_id',
    };
    const params = paths.map(path => ({
      resource_path: path,
      condition_sets: [condition],
    }));

    return this._fetchResource(
      'fetchSupportDistributorIdBelongParams',
      params,
      screenCode
    );
  }

  /**
   * 担当DB・メーカを指定して機種のリソースを取得する
   */
  fetchModelsBySupportDistributorIdAndMakerCode(
    screenCode: string,
    makerCode: string,
    supportDbId?: string,
    identifier?: string
  ) {
    const conditionSets = [
      {
        values: [makerCode],
        condition: 'car.car_identification.maker_code',
      },
    ];
    const params = [
      {
        resource_path: 'car.car_identification.model',
        condition_sets: conditionSets,
      },
    ];

    if (supportDbId != null) {
      conditionSets.push({
        values: [supportDbId],
        condition: 'car.support_distributor_id',
      });
    }

    return this._fetchResource(
      identifier || 'fetchModelsBySupportDistributorIdAndMakerCode',
      params,
      screenCode
    );
  }

  /**
   * 担当DB・機種を指定して型式のリソースを取得する
   */
  fetchTypesBySupportDistributorIdAndModel(
    screenCode: string,
    model: string,
    supportDbId?: string,
    identifier?: string
  ) {
    const conditionSets = [
      {
        values: [model],
        condition: 'car.car_identification.model',
      },
    ];
    const params = [
      {
        resource_path: 'car.car_identification.type_rev',
        condition_sets: conditionSets,
      },
    ];

    if (supportDbId != null) {
      conditionSets.push({
        values: [supportDbId],
        condition: 'car.support_distributor_id',
      });
    }

    return this._fetchResource(
      identifier || 'fetchTypesBySupportDistributorIdAndModel',
      params,
      screenCode
    );
  }

  /**
   * メーカを指定して機種のリソースを取得する（端末載せ替え画面用）
   */
  fetchModelsByMakerCode(makerCode: string) {
    const conditionSets = [
      {
        values: [makerCode],
        condition: 'common.car_identification.maker_codes',
      },
    ];
    const params = [
      {
        resource_path: 'common.car_identification.models',
        condition_sets: conditionSets,
      },
    ];

    return this._fetchResource(
      'fetchModelsByMakerCode',
      params,
      ScreenCode.terminalChange
    );
  }

  /**
   * 機種を指定して型式のリソースを取得する（端末載せ替え画面用）
   */
  fetchTypesByModel(model: string) {
    const conditionSets = [
      {
        values: [model],
        condition: 'common.car_identification.models',
      },
    ];
    const params = [
      {
        resource_path: 'common.car_identification.type_revs',
        condition_sets: conditionSets,
      },
    ];

    return this._fetchResource(
      'fetchTypesByModel',
      params,
      ScreenCode.terminalChange
    );
  }

  /**
   * 機種・型式・機番を指定して型式のリソースを取得する
   */
  fetchTimeDifferenceResouce(
    screenCode: string,
    makerCode: string,
    model: string,
    type: string,
    serial: string
  ) {
    const paths = [
      'car.car_management_attribute.time_difference',
      'car.car_management_attribute.time_difference_minute',
    ];
    const condition_sets = [
      {
        values: [makerCode],
        condition: 'car.car_identification.maker_code',
      },
      {
        values: [model],
        condition: 'car.car_identification.model',
      },
      {
        values: [type],
        condition: 'car.car_identification.type_rev',
      },
      {
        values: [serial],
        condition: 'car.car_identification.serial',
      },
    ];
    const params = paths.map(path => ({
      resource_path: path,
      condition_sets,
    }));

    return this._fetchResource(
      'fetchTimeDifferenceResouce',
      params,
      screenCode
    );
  }

  /**
   * 車両一括登録のダウンロード用指定項目を取得
   */
  fetchCarBatchDownloadFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler('fetchCarBatchDownloadFields',
        this.api
          .fetchFields(FunctionCode.templateRegistDownloadFunction)
          .subscribe((res) => resolve(res))
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
