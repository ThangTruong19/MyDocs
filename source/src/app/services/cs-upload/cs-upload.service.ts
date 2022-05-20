import { Injectable } from '@angular/core';

import { RequestHeaderParams } from 'app/types/request';
import { Api, Resources } from 'app/types/common';
import { HistoryMgtListIndexParams, HistoryMgtListFileCreateParams } from 'app/types/history-mgt-list';
import { Apis } from 'app/constants/apis';
import { ResourceService } from 'app/services/api/resource.service';
import { ApiService } from 'app/services/api/api.service';
import { ScreenCodeConst } from 'app/constants/api/screen-code-const';
import { FunctionCodeConst } from 'app/constants/api/function-code-const';


@Injectable()
export class CsUploadService {
  datePickerScreenCode: string;

  constructor(protected api: ApiService, protected resource: ResourceService) { }

  /**
   * 作業履歴一覧の初期表示に必要な情報を取得
   */
  fetchIndexInitData(requestHeaderParams: RequestHeaderParams) {
    this.api.currentScreenCode = ScreenCodeConst.CUSTOMIZE_SETTING_UPLOAD_CODE;
    return this.api.callApisForInitialize(
      ScreenCodeConst.CUSTOMIZE_SETTING_UPLOAD_CODE,
      'fetchIndexInitData',
      {
        // テーブルヘッダー取得
        fields: () =>
          this.api.fetchFields(FunctionCodeConst.CUSTOMIZE_SETTING_UPLOAD_LIST_FUNCTION),
        fieldResources: () =>
          this.api.fetchFieldResources(
            FunctionCodeConst.HISTORY_MGT_LIST_FUNCTION
          ),
        downloadFields: () =>
          this.api.fetchFields(
            FunctionCodeConst.HISTORY_MGT_LIST_DOWNLOAD_FUNCTION
          ),
        downloadFieldResources: () =>
          this.api.fetchFieldResources(
            FunctionCodeConst.HISTORY_MGT_LIST_DOWNLOAD_FUNCTION
          ),
      },
      { request_header: requestHeaderParams }
    );
  }

  /**
  * 一覧画面のリスト取得APIを呼ぶ
  * @param params パラメータ
  * @param requestHeaderParams ヘッダ情報
  */
  fetchIndexList(
    params: HistoryMgtListIndexParams,
    requestHeaderParams: RequestHeaderParams
  ): Promise<Api> {
    return new Promise((resolve) => {
      this.api.requestHandler(
        'fetchIndexList',
        this.api
          .post(
            Apis.postCarCustomizesUsageDefinitionHistoriesSearch,
            { customize_operation_history: params },
            { cache: false, request_header: requestHeaderParams }
          )
          .subscribe((res) => resolve(res))
      );
    });
  }

  /**
   * ファイル作成APIを呼ぶ
   * @param params パラメータ
   * @param headerParams ヘッダ情報
   */
  createFile(
    params: HistoryMgtListFileCreateParams,
    requestHeaderParams: RequestHeaderParams
  ) {
    requestHeaderParams['X-Count'] = null;
    requestHeaderParams['X-From'] = null;

    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createFile',
        this.api
          .post(Apis.postCarCustomizesUsageDefinitionHistoriesSearchFileCreate, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(
            (res) => resolve(res),
            (error) => reject(error)
          )
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
          .fetchResource(ScreenCodeConst.CUSTOMIZE_SETTING_UPLOAD_CODE, params)
          .subscribe((res) => resolve(res))
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
          .fetchResource(ScreenCodeConst.CUSTOMIZE_SETTING_UPLOAD_CODE, params)
          .subscribe(
            (res) => resolve(res),
            (error) => reject(error)
          )
      );
    });
  }

}
