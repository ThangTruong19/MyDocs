import { Injectable } from '@angular/core';

import { RequestHeaderParams } from 'app/types/request';
import { Api, Resource, InitializeApiResult } from 'app/types/common';
import {
    GetHistoryMgtListRequestParam,
    PrintHistoryMgtListRequestParam,
} from 'app/types/history-mgt-list';
import { Apis } from 'app/constants/apis';
import { ResourceService } from 'app/services/api/resource.service';
import { ApiService } from 'app/services/api/api.service';
import { ScreenCodeConst } from 'app/constants/api/screen-code-const';
import { FunctionCodeConst } from 'app/constants/api/function-code-const';

@Injectable()
export class HistoryMgtListService {
    protected datePickerScreenCode: string;

    constructor(
        protected api: ApiService,
        protected resource: ResourceService
    ) {}

    /**
     * 作業履歴一覧の初期表示に必要な情報を取得
     */
    public fetchIndexInitData(): Promise<InitializeApiResult> {
        this.api.currentScreenCode = ScreenCodeConst.HISTORY_MGT_LIST_CODE;
        return this.api.callApisForInitialize(
            ScreenCodeConst.HISTORY_MGT_LIST_CODE,
            'fetchIndexInitData',
            {
                fields: () =>
                    this.api.fetchFields(
                        FunctionCodeConst.HISTORY_MGT_LIST_FUNCTION
                    ),
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
            }
        );
    }

    /**
     * 一覧画面のリスト取得APIを呼ぶ
     * @param params パラメータ
     * @param requestHeaderParams ヘッダ情報
     */
    public fetchIndexList(
        params: GetHistoryMgtListRequestParam,
        requestHeaderParams: RequestHeaderParams
    ): Promise<Api> {
        return new Promise((resolve, reject) => {
            this.api.requestHandler(
                'fetchIndexList',
                this.api
                    .post(
                        Apis.postCarCustomizesUsageDefinitionHistoriesSearch,
                        params,
                        { cache: false, request_header: requestHeaderParams }
                    )
                    .subscribe({
                        next: (res: Api) => {
                            resolve(res);
                        },
                        error: (error) => reject(error),
                    })
            );
        });
    }

    /**
     * ファイル作成APIを呼ぶ
     * @param params パラメータ
     * @param requestHeaderParams ヘッダ情報
     */
    public createFile(
        params: PrintHistoryMgtListRequestParam,
        requestHeaderParams: RequestHeaderParams
    ): Promise<Api> {
        requestHeaderParams['X-Count'] = null;
        requestHeaderParams['X-From'] = null;

        return new Promise((resolve, reject) => {
            this.api.requestHandler(
                'createFile',
                this.api
                    .post(
                        Apis.postCarCustomizesUsageDefinitionHistoriesSearchFileCreate,
                        params,
                        {
                            cache: false,
                            request_header: requestHeaderParams,
                        }
                    )
                    .subscribe({
                        next: (res: Api) => {
                            resolve(res);
                        },
                        error: (error) => reject(error),
                    })
            );
        });
    }

    /**
     * 大分類に依存する小分類のリソースを取得する
     * @param categoryCode 大分類ID
     */
    public fetchBelongingCategoryCode(
        categoryCode: string
    ): Promise<{ operation_history: { code: Resource } }> {
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
                'fetchBelongingCategoryCode',
                this.api
                    .fetchResource(
                        ScreenCodeConst.HISTORY_MGT_LIST_CODE,
                        params
                    )
                    .subscribe({
                        next: (res: {
                            operation_history: { code: Resource };
                        }) => {
                            resolve(res);
                        },
                        error: (error) => reject(error),
                    })
            );
        });
    }

    /**
     * カスタマイズ用途定義に依存するカスタマイズ定義のリソースを取得する
     * @param customizeUsageDefinitionId カスタマイズ用途定義
     */
    public fetchBelongingCustomizeUsageDefinitionId(
        customizeUsageDefinitionId: string
    ): Promise<{ operation_history: { customize_definition_id: Resource } }> {
        const params = [
            {
                resource_path: 'operation_history.customize_definition_id',
                condition_sets: [
                    {
                        condition: 'customize_usage_definition_id',
                        values: [customizeUsageDefinitionId],
                    },
                ],
            },
        ];
        return new Promise((resolve, reject) => {
            this.api.requestHandler(
                'fetchBelongingCustomizeUsageDefinitionId',
                this.api
                    .fetchResource(
                        ScreenCodeConst.HISTORY_MGT_LIST_CODE,
                        params
                    )
                    .subscribe({
                        next: (res: {
                            operation_history: {
                                customize_definition_id: Resource;
                            };
                        }) => {
                            resolve(res);
                        },
                        error: (error) => reject(error),
                    })
            );
        });
    }
}
