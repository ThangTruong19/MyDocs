import { get, set } from 'lodash';

import { Injectable } from '@angular/core';

import { Api, Resources } from '../../../types/common';
import { RequestHeaderParams } from '../../../types/request';
import {
  ModelSettingSearchParams,
  ModelSettingUpdateParams,
  MakerDivision,
} from '../../../types/opa/management-car-setting/model-setting';
import {
  ModelTypeSettingUpdateParams,
  ModelTypeSettingSearchParams,
} from '../../../types/opa/management-car-setting/model-type-setting';
import {
  MakerSettingUpdateParams,
  MakerSettingSearchParams,
} from '../../../types/opa/management-car-setting/maker-setting';
import {
  DivisionSettingSearchParams,
  DivisionSettingUpdateParams,
} from '../../../types/opa/management-car-setting/division-setting';
import {
  CustomDivisionRegistParams,
  CustomDivisionSearchParams,
  CustomDivisionEditParams,
} from '../../../types/opa/management-car-setting/custom-division';

import { ApiService } from '../../api/api.service';
import { ResourceService } from '../../../services/api/resource.service';

import { ScreenCode } from '../../../constants/opa/screen-codes/management-car-setting';
import { FunctionCode } from '../../../constants/opa/function-codes/management-car-setting';
import { Apis } from '../../../constants/apis';
import { ResourceKind } from '../../../constants/resource-type';
import { FilterReservedWord } from '../../../constants/condition';

@Injectable()
export class ManagementCarSettingService {
  constructor(private api: ApiService, private resource: ResourceService) {}

  /**
   * 機種設定画面の初期化APIをコール
   */
  fetchModelSettingInitData() {
    this.api.currentScreenCode = ScreenCode.modelSetting;
    return this.api.callApisForInitialize(
      ScreenCode.modelSetting,
      'fetchModelSettingInitData',
      {},
      { search_parameters: [{ kinds: [ResourceKind.global] }] }
    );
  }

  /**
   * 機種設定取得APIをコール
   * @param params パラメータ
   */
  fetchModelSettings(params: ModelSettingSearchParams) {
    return new Promise<Api>((resolve, reject) => {
      this.api.requestHandler(
        'fetchModelSettings',
        this.api
          .get(Apis.getManagementCarSettingsModelSettings, params)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 機種設定更新APIをコール
   * @param params パラメータ
   */
  updateModelSettings(params: ModelSettingUpdateParams) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchModelSettings',
        this.api
          .put(Apis.putManagementCarSettingsModelSettings, params)
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * メーカ・機種のIDを生成して返す
   * @param makerDivision メーカ・機種
   */
  getMakerDivisionID(makerDivision: MakerDivision) {
    return `${makerDivision.maker_id}_${makerDivision.division_id}`;
  }

  /**
   * メーカ・機種の名称を生成して返す
   * @param makerDivision メーカ・機種
   */
  getMakerDivisonName(makerDivision: MakerDivision) {
    return `${makerDivision.maker_name} - ${makerDivision.division_name}`;
  }

  /**
   * 配列からメーカ-車種を探す
   * @param array 配列
   * @param makerDivision メーカ・配列
   */
  findMakerDivision(array: MakerDivision[], makerDivision: MakerDivision) {
    return array.find(
      _makerDivision =>
        makerDivision.maker_id === _makerDivision.maker_id &&
        makerDivision.division_id === _makerDivision.division_id
    );
  }

  /**
   * 型式設定画面の初期化APIをコール
   */
  fetchModelTypeSettingInitData() {
    this.api.currentScreenCode = ScreenCode.modelTypeSetting;
    return this.api.callApisForInitialize(
      ScreenCode.modelTypeSetting,
      'fetchModelTypeSettingInitData',
      {},
      { search_parameters: [{ kinds: [ResourceKind.global] }] }
    );
  }

  /**
   * 型式設定取得APIをコール
   * @param params パラメータ
   */
  fetchModelTypeSettings(params: ModelTypeSettingSearchParams) {
    return new Promise<Api>((resolve, reject) => {
      this.api.requestHandler(
        'fetchModelTypeSettings',
        this.api
          .get(Apis.getManagementCarSettingsModelTypeSettings, params)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 型式設定更新APIをコール
   * @param params パラメータ
   */
  updateModelTypeSettings(params: ModelTypeSettingUpdateParams) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateModelTypeSettings',
        this.api
          .put(Apis.putManagementCarSettingsModelTypeSettings, params)
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * メーカ設定画面の初期化APIをコール
   */
  fetchMakerSettingInitData() {
    this.api.currentScreenCode = ScreenCode.makerSetting;
    return this.api.callApisForInitialize(
      ScreenCode.makerSetting,
      'fetchMakerSettingInitData'
    );
  }

  /**
   * メーカ設定取得APIをコール
   * @param params パラメータ
   */
  fetchMakerSettings(params: MakerSettingSearchParams) {
    return new Promise<Api>((resolve, reject) => {
      this.api.requestHandler(
        'fetchMakerSettings',
        this.api
          .get(Apis.getManagementCarSettingsMakerSettings, params)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * メーカ設定更新APIをコール
   * @param params パラメータ
   */
  updateMakerSettings(params: MakerSettingUpdateParams) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchMakerSettings',
        this.api
          .put(Apis.putManagementCarSettingsMakerSettings, params)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * メーカ設定画面の初期化APIをコール
   */
  fetchDivisionSettingInitData() {
    this.api.currentScreenCode = ScreenCode.divisionSetting;
    return this.api.callApisForInitialize(
      ScreenCode.divisionSetting,
      'fetchDivisionSettingInitData'
    );
  }

  /**
   * メーカ設定取得APIをコール
   * @param params パラメータ
   */
  fetchDivisionSettings(params: DivisionSettingSearchParams) {
    return new Promise<Api>((resolve, reject) => {
      this.api.requestHandler(
        'fetchDivisionSettings',
        this.api
          .get(Apis.getManagementCarSettingsDivisionSettings, params)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * メーカ設定更新APIをコール
   * @param params パラメータ
   */
  updateDivisionSettings(params: DivisionSettingUpdateParams) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateDivisionSettings',
        this.api
          .put(Apis.putManagementCarSettingsDivisionSettings, params)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * カスタム車種登録画面の初期化APIをコール
   */
  fetchCustomDivisionRegistInitData() {
    this.api.currentScreenCode = ScreenCode.customDivisionRegist;
    return this.api.callApisForInitialize(
      ScreenCode.customDivisionRegist,
      'fetchCustomDivisionRegistInitData',
      {},
      { search_parameters: [{ kinds: [ResourceKind.global] }] }
    );
  }

  /**
   * カスタム車種変更画面の初期化APIをコール
   */
  fetchCustomDivisionEditInitData() {
    this.api.currentScreenCode = ScreenCode.customDivisionEdit;
    return this.api.callApisForInitialize(
      ScreenCode.customDivisionEdit,
      'fetchCustomDivisionEditInitData',
      {},
      { search_parameters: [{ kinds: [ResourceKind.global] }] }
    );
  }

  /**
   * カスタム車種一覧画面の初期化APIをコール
   */
  fetchCustomDivisionIndexInitData() {
    this.api.currentScreenCode = ScreenCode.customDivisionList;
    return this.api.callApisForInitialize(
      ScreenCode.customDivisionList,
      'fetchCustomDivisionIndexInitData',
      {
        updatable:
          Apis.putManagementCarSettingsCustomDivisions_customDivisionId_,
        deletable:
          Apis.deleteManagementCarSettingsCustomDivisions_customDivisionId_,
        fields: () =>
          this.api.fetchFields(FunctionCode.customDivisionListFunction),
        detailFields: () =>
          this.api.fetchFields(FunctionCode.customDivisionListDetailFunction),
        deleteFields: () =>
          this.api.fetchFields(FunctionCode.customDivisionListDeleteFunction),
        downloadFields: () =>
          this.api.fetchFields(FunctionCode.customDivisionListDownloadFunction),
        downloadFieldResources: () =>
          this.api.fetchFieldResources(
            FunctionCode.customDivisionListDownloadFunction
          ),
      }
    );
  }

  /**
   * カスタム車種登録APIをコール
   * @param params パラメータ
   */
  createCustomDivision(params: CustomDivisionRegistParams) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createCustomDivision',
        this.api
          .post(Apis.postManagementCarSettingsCustomDivisions, params)
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * カスタム車種一覧取得APIをコール
   * @param params パラメータ
   */
  fetchCustomDivisions(
    params: CustomDivisionSearchParams,
    requestHeaderParams?: RequestHeaderParams
  ) {
    return new Promise<Api>((resolve, reject) => {
      this.api.requestHandler(
        'fetchCustomDivisions',
        this.api
          .get(Apis.getManagementCarSettingsCustomDivisions, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * カスタム車種更新APIをコール
   * @param id カスタム車種ID
   * @param params パラメータ
   */
  updateCustomDivision(id: string, params: CustomDivisionEditParams) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createCustomDivision',
        this.api
          .put(
            {
              apiId:
                Apis.putManagementCarSettingsCustomDivisions_customDivisionId_,
              params: [id],
            },
            params
          )
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * カスタム車種削除APIをコール
   * @param id カスタム車種ID
   * @param updateDatetime 最終更新日時
   */
  deleteCustomDivision(id: string, updateDatetime: string) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'deleteCustomDivision',
        this.api
          .delete(
            {
              apiId:
                Apis.deleteManagementCarSettingsCustomDivisions_customDivisionId_,
              params: [id],
            },
            {
              update_datetime: updateDatetime,
            }
          )
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * カスタム車種一覧ファイル作成APIを実行
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ
   */
  createCustomDivisionFile(params, requestHeaderParams: RequestHeaderParams) {
    requestHeaderParams['X-Count'] = null;
    requestHeaderParams['X-From'] = null;

    return new Promise<Api>((resolve, reject) => {
      this.api.requestHandler(
        'createCustomDivisionFile',
        this.api
          .get(Apis.getManagementCarSettingsCustomDivisionsFileCreate, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 設定グループの選択値が変更された場合、それに対応したカスタム車両名を取得してくる
   * @param screen_code 画面ID
   * @param opt グループ
   */
  fetchNamesByGroupId(screen_code, opt) {
    const search_parameters = [
      {
        resource_path: 'custom_division.names.label',
        condition_sets: [
          { condition: 'custom_division.group_id', values: [opt.group_id] },
        ],
      },
    ];
    const items = { screen_code, search_parameters };
    return new Promise<Resources>((resolve, reject) => {
      this.api.requestHandler(
        'fetchNamesByGroupId',
        this.api
          .post(Apis.postApplicationsViewsResourcesSearch, items)
          .subscribe(
            res => resolve(this.resource.parse(res.result_data)),
            error => reject(error)
          )
      );
    });
  }

  /**
   * グループIDを指定してメーカのリソースを取得する
   * @param screenCode 画面コード
   * @param groupId グループID
   */
  fetchMakerResouceByGroupId(screen_code: string, groupId: string) {
    const condition = (() => {
      switch (screen_code) {
        case ScreenCode.modelSetting:
          return 'model_setting.group_id';
        case ScreenCode.modelTypeSetting:
          return 'model_type_setting.group_id';
        case ScreenCode.customDivisionRegist:
        case ScreenCode.customDivisionEdit:
          return 'custom_division.group_id';
      }
    })();

    const search_parameters = [
      {
        resource_path: 'maker_code',
        condition_sets: [{ condition, values: [groupId] }],
        kinds: [ResourceKind.global],
      },
    ];

    const items = { screen_code, search_parameters };
    return new Promise<Resources>((resolve, reject) => {
      this.api.requestHandler(
        'fetchMakerResouceByGroupId',
        this.api
          .post(Apis.postApplicationsViewsResourcesSearch, items)
          .subscribe(
            res =>
              resolve(
                this.setNothingResourceValue(
                  this.resource.parse(res.result_data),
                  'maker_code'
                )
              ),
            error => reject(error)
          )
      );
    });
  }

  /**
   * グループID・メーカを指定して車両種類のリソースを取得する
   * @param screenCode 画面コード
   * @param groupId グループID
   */
  fetchDivisionResouceByGroupIdAndMakerCode(
    screen_code: string,
    groupId: string | null,
    makerCode: string
  ) {
    const groupCondition = (() => {
      switch (screen_code) {
        case ScreenCode.modelSetting:
          return 'model_setting.group_id';
        case ScreenCode.modelTypeSetting:
          return 'model_type_setting.group_id';
        case ScreenCode.customDivisionRegist:
        case ScreenCode.customDivisionEdit:
          return 'custom_division.group_id';
      }
    })();

    const condition_sets = [
      { condition: groupCondition, values: [groupId] },
      { condition: 'maker_code', values: [makerCode] },
    ].filter(condition => condition.values[0] != null);

    const search_parameters = [
      {
        resource_path: 'division_code',
        condition_sets,
        kinds: [ResourceKind.global],
      },
    ];

    const items = { screen_code, search_parameters };
    return new Promise<Resources>((resolve, reject) => {
      this.api.requestHandler(
        'fetchDivisionResouceByGroupIdAndMakerCode',
        this.api
          .post(Apis.postApplicationsViewsResourcesSearch, items)
          .subscribe(
            res =>
              resolve(
                this.setNothingResourceValue(
                  this.resource.parse(res.result_data),
                  'division_code'
                )
              ),
            error => reject(error)
          )
      );
    });
  }

  /**
   * リソースが空で返ってきた場合に’-’の値をリソースとして返却する
   *
   * @param resultData リザルトデータ
   * @param resourcePath リソースパス
   */
  private setNothingResourceValue(resources: any, resourcePath: string) {
    const resource = get(resources, resourcePath);

    if (resource && resource.values.length === 0) {
      set(resources, `${resourcePath}.values`, [
        {
          name: '-',
          value: FilterReservedWord.selectAll,
          kind: ResourceKind.all,
        },
      ]);
    }

    return resources;
  }
}
