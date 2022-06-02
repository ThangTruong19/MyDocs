import { Injectable } from '@angular/core';

import { RequestHeaderParams } from 'app/types/request';
import { Api } from 'app/types/common';
import { CustomizeRequestStatusListIndexParams } from 'app/types/customize-request-status-list';
import { Apis } from 'app/constants/apis';
import { ResourceService } from 'app/services/api/resource.service';
import { ApiService } from 'app/services/api/api.service';
import { ScreenCodeConst } from 'app/constants/api/screen-code-const';
import { FunctionCodeConst } from 'app/constants/api/function-code-const';

@Injectable()
export class CustomizeRequestStatusListService {
    datePickerScreenCode: string;

    constructor(protected api: ApiService, protected resource: ResourceService) {}

    /**
     * 作業履歴一覧の初期表示に必要な情報を取得
     */
    fetchIndexInitData() {
        this.api.currentScreenCode = ScreenCodeConst.CUSTOMIZE_REQUEST_STATUS_LIST_CODE;
        return this.api.callApisForInitialize(ScreenCodeConst.CUSTOMIZE_REQUEST_STATUS_LIST_CODE, 'fetchIndexInitData', {
            fields: () => this.api.fetchFields(FunctionCodeConst.CUSTOMIZE_REQUEST_STATUS_LIST_FUNCTION),
        });
    }

    /**
     * 一覧画面のリスト取得APIを呼ぶ
     * @param params パラメータ
     * @param requestHeaderParams ヘッダ情報
     */
    fetchIndexList(params: CustomizeRequestStatusListIndexParams, requestHeaderParams: RequestHeaderParams): Promise<Api> {
        return new Promise((resolve, reject) => {
            this.api.requestHandler(
                'fetchIndexList',
                this.api.post(Apis.postCarsCustomizeRequestsStatusSearch, params, { cache: false, request_header: requestHeaderParams }).subscribe({
                    next: (res: Api) => {
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
    fetchBelongingCustomizeUsageDefinitionId(customizeUsageDefinitionId: string): Promise<Api> {
        const params = [
            {
                resource_path: 'customize_definition_id',
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
                this.api.fetchResource(ScreenCodeConst.CUSTOMIZE_REQUEST_STATUS_LIST_CODE, params).subscribe({
                    next: (res: Api) => {
                        resolve(res);
                    },
                    error: (error) => reject(error),
                })
            );
        });
    }
}
