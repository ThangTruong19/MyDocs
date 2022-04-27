import { Injectable } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { FlagParams, ProfileListParams } from '../../../types/flm/flag';
import { RequestHeaderParams } from '../../../types/request';
import { ResourceService } from '../../../services/api/resource.service';
import { ScreenCode } from '../../../constants/flm/screen-codes/flag-condition-management';
import { FunctionCode } from '../../../constants/flm/function-codes/flag-condition-management';
import { Resources } from '../../../types/common';
import { Apis } from '../../../constants/apis';

@Injectable()
export class FlagService {
  constructor(private api: ApiService, private resource: ResourceService) {}

  /**
   * フラグ登録の初期化に必要な API コール
   */
  fetchNewInitData() {
    this.api.currentScreenCode = ScreenCode.regist;
    return this.api.callApisForInitialize(
      ScreenCode.regist,
      'fetchNewInitData',
      {
        refFields: () => this.api.fetchFields(FunctionCode.settingFunction),
      }
    );
  }

  /**
   * フラグ一覧の初期化APIを呼ぶ
   */
  fetchIndexInitData() {
    this.api.currentScreenCode = ScreenCode.list;
    return this.api.callApisForInitialize(
      ScreenCode.list,
      'fetchIndexInitData',
      {
        updatable: Apis.putFlagConditionsAbnormalities_flagConditionId_,
        deletable: Apis.deleteFlagConditionsAbnormalities_flagConditionId_,
        fields: () => this.api.fetchFields(FunctionCode.listFunction),
        fieldResources: () =>
          this.api.fetchFieldResources(FunctionCode.listFunction),
        downloadFields: () =>
          this.api.fetchFields(FunctionCode.listDownloadFunction),
        downloadFieldResources: () =>
          this.api.fetchFieldResources(FunctionCode.listDownloadFunction),
        detailFields: () =>
          this.api.fetchFields(FunctionCode.listDetailFunction),
        deleteFields: () =>
          this.api.fetchFields(FunctionCode.listDeleteFunction),
      }
    );
  }

  /**
   * フラグ更新の初期化APIを呼ぶ
   * @param id ID
   * @param params パラメータ
   */
  fetchEditInitData(params) {
    this.api.currentScreenCode = ScreenCode.edit;
    return this.api.callApisForInitialize(
      ScreenCode.edit,
      'fetchEditInitData',
      {
        target: () =>
          this.api.get(Apis.getFlagConditionsAbnormalitiesModelTypes, params, {
            cache: false,
          }),
        refFields: () => this.api.fetchFields(FunctionCode.settingFunction),
      }
    );
  }

  /**
   * フラグ登録 API をコール
   * @param params パラメータ
   */
  createFlag(params: FlagParams): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createFlag',
        this.api
          .post(Apis.postFlagConditionsAbnormalities, params)
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * フラグ更新 API をコール
   * @param params パラメータ
   */
  updateFlag(id: string, params: FlagParams): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateFlag',
        this.api
          .put(
            {
              apiId: Apis.putFlagConditionsAbnormalities_flagConditionId_,
              params: [id],
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
  fetchProfileList(
    params: ProfileListParams,
    requestHeaderParams: RequestHeaderParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchProfileList',
        this.api
          .get(Apis.getFlagConditionsModelTypesAbnormalities, params, {
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
   * フラグ一覧取得 API を実行
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ
   * @param opt オプション
   */
  fetchIndexList(params, requestHeaderParams: RequestHeaderParams, opt?: any) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchIndexList',
        this.api
          .get(Apis.getFlagConditionsAbnormalitiesModelTypes, params, {
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
   * フラグ削除 API を実行
   * @param flag_condition_id フラグ ID
   * @param update_datetime 更新日時
   */
  deleteFlag(flag_condition_id: string, update_datetime: string) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'deleteFlag',
        this.api
          .delete(
            {
              apiId: Apis.deleteFlagConditionsAbnormalities_flagConditionId_,
              params: [flag_condition_id],
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
          .get(
            Apis.getFlagConditionsAbnormalitiesModelTypesFileCreate,
            params,
            { cache: false, request_header: headerParams }
          )
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 車種のリソースを取得
   * @param screenCode 画面ID
   * @param supportDistributor 担当DB
   */
  fetchDivisionResource(
    screenCode,
    supportDistributor?: string
  ): Promise<Resources> {
    return new Promise((resolve, reject) => {
      const searchParams = [
        {
          resource_path: 'division_code',
          kinds: ['D'],
          condition_sets: [
            {
              condition: 'flag_condition.support_distributor_id',
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
        .subscribe(data => resolve(data), error => reject(error));
    });
  }
}
