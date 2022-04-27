import { Injectable } from '@angular/core';

import { ApiService } from '../../api/api.service';
import {
  FlagConditionParams,
  FlagConditionIndexParams,
  FlagConditionDeleteParams,
} from '../../../types/opa/flag-condition';
import { RequestHeaderParams } from '../../../types/request';
import { ScreenCode } from '../../../constants/opa/screen-codes/flag-condition-management';
import { FunctionCode } from '../../../constants/opa/function-codes/flag-condition-management';
import { Resources } from '../../../types/common';
import { FlagConditionKinds } from '../../../constants/opa/flag-condition-kinds';
import { Apis } from '../../../constants/apis';

@Injectable()
export class FlagConditionService {
  constructor(private api: ApiService) {}

  /**
   * フラグ条件一覧画面の初期表示に必要な情報を取得します。
   * @param opt パラメータ
   */
  fetchInitData(opt?: any) {
    this.api.currentScreenCode = ScreenCode.list;
    return this.api.callApisForInitialize(
      ScreenCode.list,
      'fetchDataForIntializeIndex',
      {
        updatable: Apis.putFlagConditions_flagConditionId_,
        deletable: Apis.deleteFlagConditions_flagConditionId_,
        fieldResources: () =>
          this.api.fetchFieldResources(FunctionCode.listCautionFunction),
        downloadFieldResources: () =>
          this.api.fetchFieldResources(
            FunctionCode.listCautionDownloadFunction
          ),
        downloadFields: () =>
          this.api.fetchFields(FunctionCode.listCautionDownloadFunction),
        fields: () => this.api.fetchFields(FunctionCode.listCautionFunction),
        deleteFields: () =>
          this.api.fetchFields(FunctionCode.listCautionDeleteFunction),
      }
    );
  }

  /**
   * フラグ条件一覧画面のリスト表示に必要な情報を取得
   * @param params パラメータ
   * @param opt パラメータ
   */
  fetchIndexList(
    params: FlagConditionIndexParams,
    requestHeaderParams: RequestHeaderParams,
    opt?: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchIndexList',
        this.api
          .get(Apis.getFlagConditions, params, {
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
   * フラグ条件(フラグ種別: 交換時期)の
   * 初期処理に必要なAPI を実行
   */
  fetchInitReplacementTimeData(): Promise<any> {
    return Promise.all([
      this.fetchReplacementTimeFields(),
      this.fetchReplacementTimeResourceFields(),
      this.fetchReplacementTimeDownloadFields(),
      this.fetchReplacementTimeDownloadResourceFields(),
      this.fetchReplacementTimeDeleteFields(),
    ]).then(res => {
      return Promise.resolve({
        fields: res[0],
        fieldResources: res[1],
        downloadFields: res[2],
        downloadFieldResources: res[3],
        deleteFields: res[4],
      });
    });
  }

  /**
   * フラグ条件(フラグ種別: 交換時期)の指定項目取得API
   */
  fetchReplacementTimeFields(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchReplacementTimeFields',
        this.api
          .fetchFields(FunctionCode.listReplaceFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * フラグ条件(フラグ種別: 交換時期)の指定項目リソース取得取得API
   */
  fetchReplacementTimeResourceFields(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchReplacementTimeResourceFields',
        this.api
          .fetchFieldResources(FunctionCode.listReplaceFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * フラグ条件(フラグ種別: 交換時期)の指定項目取得API(ダウンロード)
   */
  fetchReplacementTimeDownloadFields(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchReplacementTimeDownloadFields',
        this.api
          .fetchFields(FunctionCode.listReplaceDownloadFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * フラグ条件(フラグ種別: 交換時期)の指定項目リソース取得API(ダウンロード)
   */
  fetchReplacementTimeDownloadResourceFields(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchReplacementTimeDownloadResourceFields',
        this.api
          .fetchFieldResources(FunctionCode.listReplaceDownloadFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * フラグ条件(フラグ種別: 交換時期)の指定項目取得API(削除)
   */
  fetchReplacementTimeDeleteFields(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchReplacementTimeDeleteFields',
        this.api
          .fetchFields(FunctionCode.listReplaceDeleteFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * フラグ条件の削除 API
   * @param id フラグ条件の ID
   */
  deleteFlagConditions(
    id: string,
    params: FlagConditionDeleteParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'deleteFlagConditions',
        this.api
          .delete(
            {
              apiId: Apis.deleteFlagConditions_flagConditionId_,
              params: [id],
            },
            params
          )
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * フラグ条件登録の初期表示に必要な情報を取得
   *
   * @return {Object} 初期パラメータ群
   */
  fetchInitNew(opt?: any): Promise<any> {
    this.api.currentScreenCode = ScreenCode.regist;
    return this.api.callApisForInitialize(ScreenCode.regist, 'fetchInitNew');
  }

  /**
   * フラグ条件の登録 API
   *
   * @param {Object} params APIパラメータ
   * @return {Object} 応答本文
   */
  createFlagCondition(params: FlagConditionParams): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createFlagCondition',
        this.api
          .post(Apis.postFlagConditions, params)
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * フラグ条件更新の初期化に必要な情報を取得
   * @param params パラメタ
   */
  fetchEditInitData(params): Promise<any> {
    this.api.currentScreenCode = ScreenCode.edit;
    return this.api.callApisForInitialize(
      ScreenCode.edit,
      'fetchEditInitData',
      {
        target: () =>
          this.api.get(Apis.getFlagConditions, params, { cache: false }),
      }
    );
  }

  /**
   * フラグ条件の更新 API
   * @param id フラグ条件の ID
   * @param params パラメタ
   */
  updateFlagConditions(id: string, params: FlagConditionParams): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateFlagConditions',
        this.api
          .put(
            {
              apiId: Apis.putFlagConditions_flagConditionId_,
              params: [id],
            },
            params
          )
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * ファイル作成APIを呼ぶ
   * @param params パラメータ
   * @param headerParams ヘッダ
   */
  createFile(params, headerParams: RequestHeaderParams) {
    headerParams['X-Count'] = null;
    headerParams['X-From'] = null;

    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createFile',
        this.api
          .get(Apis.getFlagConditionsFileCreate, params, {
            cache: false,
            request_header: headerParams,
          })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 設定項目に関連するリソースを取得する
   * @param screenCode 画面コード
   * @param flagKind フラグ条件コード
   */
  fetchCautionResource(
    screenCode: string,
    flagKind: string
  ): Promise<Resources> {
    return new Promise((resolve, reject) => {
      const paramTemplate = {
        resource_path: '',
        condition_sets: [
          { condition: 'flag_condition.flag_kind_code', values: [flagKind] },
        ],
      };
      let targetResources: string[];

      switch (flagKind) {
        case FlagConditionKinds.caution:
          targetResources = [
            'flag_condition.flag_code',
            'flag_condition.event_condition.event_code',
            'flag_condition.minimum_duration',
            'flag_condition.event_condition.occurrence_identification.min_alerm_time',
            'flag_condition.event_condition.detection_condition_code',
            'flag_condition.event_condition.occurrence_identification.consecutive_occurrence_days',
            'flag_condition.event_condition.occurrence_identification.occurrence_days',
            'flag_condition.event_condition.occurrence_identification.decision_period',
          ];
          break;
        case FlagConditionKinds.replacementTime:
          targetResources = [
            'flag_condition.flag_code',
            'flag_condition.event_condition.time_identification.remaining_time_threshold',
            'flag_condition.event_condition.detection_condition_code',
          ];
          break;
      }

      const params = targetResources.map(resource_path => ({
        ...paramTemplate,
        resource_path,
      }));

      this.api.requestHandler(
        'fetchCautionResource',
        this.api
          .fetchResource(screenCode, params)
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }
}
