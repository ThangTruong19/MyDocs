import { RequestHeaderParams } from '../../types/request';
import { Api, Resources } from '../../types/common';
import {
  HistoryIndexParams,
  HistoryFileCreateParams,
} from '../../types/history';
import { Apis } from '../../constants/apis';

import { ResourceService } from '../../services/api/resource.service';
import { ApiService } from '../api/api.service';

export class KbaHistoryCommonService {
  screenCode;
  functionCode;
  datePickerScreenCode: string;

  constructor(protected api: ApiService, protected resource: ResourceService) {}

  /**
   * 作業履歴一覧の初期表示に必要な情報を取得
   */
  fetchIndexInitData() {
    this.api.currentScreenCode = this.screenCode.list;
    return this.api.callApisForInitialize(
      this.screenCode.list,
      'fetchIndexInitData',
      {
        fields: () => this.api.fetchFields(this.functionCode.listFunction),
        fieldResources: () =>
          this.api.fetchFieldResources(this.functionCode.listFunction),
        downloadFields: () =>
          this.api.fetchFields(this.functionCode.listDownloadFunction),
        downloadFieldResources: () =>
          this.api.fetchFieldResources(this.functionCode.listDownloadFunction),
      }
    );
  }

  /**
   * 一覧画面のリスト取得APIを呼ぶ
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ情報
   */
  fetchIndexList(
    params: HistoryIndexParams,
    requestHeaderParams: RequestHeaderParams
  ): Promise<Api> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchIndexList',
        this.api
          .post(
            Apis.postApplicationsHistoriesSearch,
            { operation_history: params },
            { cache: false, request_header: requestHeaderParams }
          )
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
    params: HistoryFileCreateParams,
    requestHeaderParams: RequestHeaderParams
  ) {
    requestHeaderParams['X-Count'] = null;
    requestHeaderParams['X-From'] = null;

    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createFile',
        this.api
          .post(Apis.postApplicationsHistoriesSearchFileCreate, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 大分類に依存する小分類のリソースを取得する
   * @param categoryCode 大分類ID
   */
  fetchBelongingCode(categoryCode: string): Promise<Api> {
    const params = [
      {
        resource_path: 'operation_history.code',
        condition_sets: [
          {
            condition: 'category_code',
            values: [categoryCode],
          },
        ],
      },
    ];
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchBelongingCode',
        this.api
          .fetchResource(this.screenCode.list, params)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * グループ分類に依存するグループのリソースを取得する
   * @param groupKindId グループ分類ID
   */
  fetchBelongingGroup(groupKindId: string): Promise<Api> {
    const params = [
      {
        resource_path: 'operation_history.group_id',
        condition_sets: [
          {
            condition: 'operation_history.group_kind_id',
            values: [groupKindId],
          },
        ],
      },
    ];
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchBelongingGroup',
        this.api
          .fetchResource(this.screenCode.list, params)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 対象画面を指定し大分類を取得する
   * @param appCode 対象画面
   */
  fetchCategoryResource(appCode: string): Promise<Resources> {
    const params = [
      {
        resource_path: 'operation_history.category_code',
        condition_sets: [
          {
            values: [appCode],
            condition: 'operation_history.app_code',
          },
        ],
      },
    ];

    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchCategoryResource',
        this.api
          .fetchResource(this.screenCode.list, params)
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }
}
