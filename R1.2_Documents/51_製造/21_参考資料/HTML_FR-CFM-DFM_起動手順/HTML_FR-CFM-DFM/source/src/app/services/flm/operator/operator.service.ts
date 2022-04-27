import { Injectable } from '@angular/core';
import { ApiService } from '../../api/api.service';

import {
  OperatorIndexParams,
  OperatorRegistParams,
  OperatorUpdateParams,
  OperatorDeleteParams,
  OperatorTemplateCreateParams,
  OperatorIdKeyIndexParams,
  OperatorIdKeyUpdateParams,
  CreateFileParams,
  OperatorCarIdInputIndexParams,
  OperatorCarIdInputIndexCarIdParams,
  OperatorCarIdInputUpdateParams,
  OperatorCarIdInputDeleteParams,
  OperatorCarIdKeyIndexParams,
  OperatorCarIdKeyIndexCarIdParams,
  OperatorCarIdKeyUpdateParams,
  DisableOperatorIdentificationParams,
} from '../../../types/flm/operator';
import { RequestHeaderParams } from '../../../types/request';
import { SearchItems } from '../../../types/search';

import { Apis } from '../../../constants/apis';
import { ScreenCode } from '../../../constants/flm/screen-codes/operator-management';
import { FunctionCode } from '../../../constants/flm/function-codes/operator-management';
import { Fields, Labels, Resources } from '../../../types/common';

@Injectable()
export class OperatorService {
  constructor(private api: ApiService) {}

  /**
   * ID キー対象車両一覧画面の初期表示に必要な情報を取得します。
   * @param opt パラメータ
   */
  fetchKeyCarInitData(opt?: any) {
    this.api.currentScreenCode = ScreenCode.carIdKeyList;
    return this.api.callApisForInitialize(
      ScreenCode.carIdKeyList,
      'fetchDataForIntializeIdKeyIndex',
      {
        fields: () => this.api.fetchFields(FunctionCode.carIdKeyListFunction),
        searchCondition: () =>
          this.api.fetchSearchCondition(ScreenCode.carIdKeyList),
      }
    );
  }

  /**
   * ID キー対象車両一覧画面のリスト表示に必要な情報を取得
   * @param params パラメータ
   * @param opt パラメータ
   */
  fetchKeyCarIndexList(
    params: OperatorCarIdKeyIndexParams | OperatorCarIdKeyIndexCarIdParams,
    requestHeaderParams: RequestHeaderParams,
    opt?: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchKeyCarIndexList',
        this._searchCarsOperatorIdKey(params, requestHeaderParams).subscribe(
          res => resolve(res)
        )
      );
    });
  }

  /**
   * ID 入力対象車両一覧画面一覧の初期化に必要な情報を取得
   * @param opt パラメータ
   */
  fetchInputCarIndexInitData(opt?: any) {
    this.api.currentScreenCode = ScreenCode.carIdInputList;
    return this.api.callApisForInitialize(
      ScreenCode.carIdInputList,
      'fetchInputCarIndexInitData',
      {
        fields: () => this.api.fetchFields(FunctionCode.carIdInputListFunction),
        searchCondition: () =>
          this.api.fetchSearchCondition(ScreenCode.carIdInputList),
      }
    );
  }

  /**
   * ID 入力対象車両一覧画面のリスト表示に必要な情報を取得
   * @param params パラメータ
   * @param requestHeaderParams APIリクエストヘッダ用パラメータ
   * @param opt パラメータ
   */
  fetchInputCarIndexList(
    params: OperatorCarIdInputIndexParams | OperatorCarIdInputIndexCarIdParams,
    requestHeaderParams: RequestHeaderParams,
    opt?: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchInputCarIndexList',
        this.api
          .post(Apis.postCarsOperatorIdentificationIdInputSearch, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * オペレータ一覧画面のリスト表示に必要な情報を取得
   * @param params パラメータ
   * @param requestHeaderParams APIリクエストヘッダ用パラメータ
   * @param opt パラメータ
   */
  fetchIndexList(
    params: OperatorIndexParams,
    requestHeaderParams: RequestHeaderParams,
    opt?: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        (opt && opt.identifier) || 'fetchIndexList',
        this.api
          .get(Apis.getOperators, params, {
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
   * オペレータ識別管理 IDキー番号一覧画面
   * @param opt APIに渡すパラメータ
   */
  fetchIdKeyInitData(opt?: any): Promise<any> {
    this.api.currentScreenCode = ScreenCode.idKeyList;
    return this.api.callApisForInitialize(
      ScreenCode.idKeyList,
      'fetchIdKeyInitData',
      {
        fields: () => this.api.fetchFields(FunctionCode.idKeyListFunction),
        operatorXFields: () => this.api.fetchFields(FunctionCode.listFunction),
        // historyFields: () => this.api.fetchFields(FunctionCode.idKeyListHistoryFunction),
      }
    );
  }

  /**
   * オペレータ識別管理 オペレータID一覧画面
   * @param opt APIに渡すパラメータ
   */
  fetchOperatorInitData(opt?: any): Promise<any> {
    this.api.currentScreenCode = ScreenCode.list;
    return this.api.callApisForInitialize(
      ScreenCode.list,
      'fetchOperatorInitData',
      {
        fields: () => this.api.fetchFields(FunctionCode.listFunction),
        deletable: Apis.deleteOperators,
      }
    );
  }

  /**
   * オペレータ識別管理 IDキー番号一覧のリスト表示に必要な情報を取得
   * @param params APIパラメータ
   * @param requestHeaderParams APIリクエストヘッダ用パラメータ
   * @param opt APIパラメータ
   */
  fetchIdKeyIndexList(
    params: OperatorIdKeyIndexParams,
    requestHeaderParams: RequestHeaderParams,
    opt?: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchIdKeyIndexList',
        this.api
          .get(Apis.getOperatorsIdKeys, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * オペレータ識別管理 ID入力の検索条件を更新
   * @param params APIパラメータ
   */
  updateInputCarSearchCondition(params: SearchItems) {
    return this.api.updateSearchCondition(ScreenCode.carIdInputList, params);
  }

  /**
   * オペレータ識別管理 ID入力の検索条件を初期化
   */
  initCarInputSearchCondition() {
    return this.api.initSearchCondition(ScreenCode.carIdInputList);
  }

  /**
   * オペレータ識別管理 IDキーのオペレータ連結情報を変更する。
   * @param params APIパラメータ
   */
  updateIdKeys(params: OperatorIdKeyUpdateParams) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateIdKeys',
        this.api.put(Apis.putOperatorsIdKeys, params).subscribe(res => {
          resolve(res);
        })
      );
    });
  }

  /**
   * オペレータ識別管理 IDキーのオペレータ連結情報を解除する。
   * @param params APIパラメータ
   */
  unlinkIdKeys(params: OperatorIdKeyUpdateParams) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'unlinkIdKeys',
        this.api
          .put(Apis.putOperatorsIdKeys, params, {
            exclusionKeys: ['id_keys.current_operator.code'],
          })
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * オペレータ識別管理 車両オペレータ識別設定（ID入力）を有効にする。
   * @param params APIパラメータ
   */
  updateIdInput(params: OperatorCarIdInputUpdateParams) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateIdInput',
        this.api
          .put(Apis.putCarsRequestsOperatorIdentificationIdInputOnS2m, params)
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * オペレータ識別管理 オペレータID情報を登録
   * @param params APIパラメータ
   */
  createOperatorId(params: OperatorRegistParams) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createOperatorId',
        this.api
          .post(Apis.postOperators, params, {
            exclusionKeys: ['operators.current_label.label'],
          })
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * オペレータ識別管理 車両オペレータ識別設定（IDキー）有効化を要求する。
   * @param params APIパラメータ
   */
  updateOperatorIdentification(params: OperatorCarIdKeyUpdateParams) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateOperatorIdentification',
        this.api
          .put(Apis.putCarsRequestsOperatorIdentificationIdKeyOnS2m, params)
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * オペレータ識別管理 車両オペレータ識別設定無効化を要求する。
   * @param params APIパラメータ
   */
  disableOperatorIdentification(params: DisableOperatorIdentificationParams) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'disableOperatorIdentification',
        this.api
          .delete(Apis.deleteCarsRequestsOperatorIdentificationOffS2m, params)
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * オペレータ識別管理 対象車両一覧(IDキー)の検索条件を更新
   * @param params APIパラメータ
   */
  updateCarIdKeySearchCondition(params: SearchItems) {
    return this.api.updateSearchCondition(ScreenCode.carIdKeyList, params);
  }

  /**
   * オペレータ識別管理 対象車両一覧(IDキー)の検索条件を初期化
   */
  initCarIdKeySearchCondition() {
    return this.api.initSearchCondition(ScreenCode.carIdKeyList);
  }

  /**
   * オペレータ識別管理 オペレータ情報を変更する。
   * @param params APIパラメータ
   */
  updateOperators(params: OperatorUpdateParams) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateOperators',
        this.api
          .put(Apis.putOperators, params, {
            exclusionKeys: ['operators.current_label.label'],
          })
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * オペレータ識別管理 オペレータ情報を削除する。
   * @param params APIパラメータ
   */
  deleteOperators(params: OperatorDeleteParams) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'deleteOperators',
        this.api.delete(Apis.deleteOperators, params).subscribe(res => {
          resolve(res);
        })
      );
    });
  }

  deleteOperatorsIdInput(params: OperatorCarIdInputDeleteParams) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'deleteOperatorsIdInput',
        this.api
          .delete(
            Apis.deleteCarsRequestsOperatorIdentificationIdInputOperatorsDeleteS2m,
            params
          )
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * 顧客にひもづくオペレータのオペレータ名を全件取得する。
   * @param customerId 顧客ID
   */
  fetchAllOperatorLabels(customerId: string, fields?: string): Promise<any> {
    const requestHeaderParams: RequestHeaderParams = {};
    requestHeaderParams['X-From'] = 1;
    requestHeaderParams['X-Count'] = 0;
    requestHeaderParams['X-Fields'] = fields
      ? fields
      : 'operators.current_label.label';

    return this.fetchIndexList(
      { customer_id: customerId },
      requestHeaderParams,
      { identifier: 'fetchAllOperatorLabels' }
    );
  }

  /**
   * オペレータテンプレートファイル作成APIリクエスト
   * @param params パラメータ
   * @param fields 指定項目
   */
  templateCreate(params: OperatorTemplateCreateParams, fields: string[]) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'templateCreate',
        this.api
          .get(Apis.getOperatorsTemplateCreate, params, { cache: false, request_header: {
            'X-Fields': fields,
          } })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * ファイル作成APIリクエスト（IDキーとオペレータの連結情報一覧ファイル、オペレータ一覧ファイル）
   * @param path パス
   * @param params パラメータ
   * @param headerParams ヘッダ
   */
  // !TODO
  createFile(
    apiId: string,
    params: CreateFileParams,
    headerParams: RequestHeaderParams
  ) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createFile',
        this.api
          .get(apiId, params, { cache: false, request_header: headerParams })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

    /**
     * オペレータ一覧/削除モーダル用指定項目取得
     */
    fetchIndexDeleteFields() {
      return new Promise<Fields>((resolve) => {
        this.api.requestHandler(
          'fetchOperatorIndexDeleteFields',
          this.api
            .fetchFields(FunctionCode.listDeleteFunction)
            .subscribe(res => resolve(res))
        );
      });
    }

    /**
     * オペレータ一覧/履歴モーダル用指定項目取得
     */
    fetchIndexHistoryFields() {
      return new Promise<Fields>((resolve) => {
        this.api.requestHandler(
          'fetchOperatorIndexHistoryFields',
          this.api
            .fetchFields(FunctionCode.listHistoryFunction)
            .subscribe(res => resolve(res))
        );
      });
    }

    /**
     * オペレータ一覧/変更モーダル用指定項目取得
     */
    fetchIndexEditFields() {
      return new Promise<Fields>((resolve) => {
        this.api.requestHandler(
          'fetchOperatorIndexEditFields',
          this.api
            .fetchFields(FunctionCode.listEditFunction)
            .subscribe(res => resolve(res))
        );
      });
    }

    /**
     * オペレータ一覧/ダウンロード指定項目取得
     */
    fetchIndexDownloadFields() {
      return new Promise<Fields>((resolve) => {
        this.api.requestHandler(
          'fetchOperatorIndexDownloadFields',
          this.api
            .fetchFields(FunctionCode.listDownloadFunction)
            .subscribe(res => resolve(res))
        );
      });
    }

    /**
     * オペレータ一覧/オペレータ登録用リソース取得
     */
    fetchIndexRegistResources() {
      return new Promise<Resources>((resolve) => {
        this.api.requestHandler(
          'fetchIndexRegistresources',
          this.api
            .fetchResource(ScreenCode.regist)
            .subscribe(res => resolve(res))
        );
      });
    }

    /**
     * オペレータ一覧/オペレータ登録用ラベル取得
     */
    fetchIndexRegistLabels() {
      return new Promise<Labels>((resolve) => {
        this.api.requestHandler(
          'fetchIndexRegistLabels',
          this.api
            .fetchLabels(ScreenCode.regist)
            .subscribe(res => resolve(res))
        );
      });
    }

    /**
     * IDキー番号一覧/解除モーダル用指定項目取得
     */
    fetchIdKeyIndexUnlinkFields() {
      return new Promise<Fields>((resolve) => {
        this.api.requestHandler(
          'fetchIdKeyIndexUnlinkFields',
          this.api
            .fetchFields(FunctionCode.idKeyListUnlinkFunction)
            .subscribe(res => resolve(res))
        );
      });
    }

    /**
     * IDキー番号一覧/変更モーダル用指定項目取得
     */
    fetchIdKeyIndexEditFields() {
      return new Promise<Fields>((resolve) => {
        this.api.requestHandler(
          'fetchIdKeyIndexEditFields',
          this.api
            .fetchFields(FunctionCode.idKeyListEditFunction)
            .subscribe(res => resolve(res))
        );
      });
    }

  /**
   * 対象車両一覧（ID入力）/オペレータ一覧用指定項目取得
   */
  fetchInputCarIndexOperatorFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchInputCarIndexOperatorFields',
        this.api
          .fetchFields(FunctionCode.listFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 対象車両一覧（ID入力）/オペレータ識別設定画面用指定項目取得
   */
  fetchInputCarIndexListSettingFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchInputCarIndexListSettingFields',
        this.api
          .fetchFields(FunctionCode.carIdInputListSettingFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 対象車両一覧（ID入力）/オペレータ識別設定確認モーダル用指定項目取得
   */
  fetchInputCarIndexListSettingConfirmFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchInputCarIndexListSettingConfirmFields',
        this.api
          .fetchFields(FunctionCode.carIdInputListSettingConfirmFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 対象車両一覧（ID入力）/オペレータ識別設定OFFモーダル用指定項目取得
   */
  fetchInputCarIndexSettingOffFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchInputCarIndexSettingOffFields',
        this.api
          .fetchFields(FunctionCode.carIdInputListSettingOffFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 対象車両一覧（IDキー）/設定ONモーダル用指定項目取得
   */
  fetchKeyCarIndexSettingOnFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchKeyCarIndexSettingOnFields',
        this.api
          .fetchFields(FunctionCode.carIdKeyListSettingOnFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 対象車両一覧（IDキー）/設定ONモーダル用指定項目取得
   */
  fetchKeyCarIndexSettingOffFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchKeyCarIndexSettingOffFields',
        this.api
          .fetchFields(FunctionCode.carIdKeyListSettingOffFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 車両オペレータ識別設定(IDキー)一覧/詳細取得API
   */
  private _searchCarsOperatorIdKey(
    params: OperatorCarIdKeyIndexParams | OperatorCarIdKeyIndexCarIdParams,
    requestHeaderParams: RequestHeaderParams
  ) {
    return this.api.post(
      Apis.postCarsOperatorIdentificationIdKeySearch,
      params,
      {
        cache: false,
        request_header: requestHeaderParams,
      }
    );
  }
}
