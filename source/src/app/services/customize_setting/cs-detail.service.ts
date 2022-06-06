import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { LocationStrategy } from '@angular/common';

import { Api, InitializeApiResult } from 'app/types/common';
import { Apis } from 'app/constants/apis';
import { RequestHeaderParams } from 'app/types/request';
import {
    GetCustomizeUsageDefinitionRequestParam,
    UpdateCustomizeUsageDefinitionRequestParam,
    RetryCustomizeUsageDefinitionRequestParam,
} from 'app/types/cs-detail';
import { ScreenCodeConst } from 'app/constants/api/screen-code-const';
import { FunctionCodeConst } from 'app/constants/api/function-code-const';
import { ApiService } from 'app/services/api/api.service';
import { CsDetailComponent } from 'app/components/customize_setting/cs-detail.component';

@Injectable()
export class CsDetailService implements CanDeactivate<CsDetailComponent> {
    constructor(private api: ApiService, private locationStrategy: LocationStrategy) {
        this.locationStrategy.onPopState(() => {
            this.backClicked = true;
        });
    }

    private backClicked = false;

    /**
     * ページ離脱時の制御
     * @returns true：画面遷移あり、false：画面遷移なし
     */
    public canDeactivate(component: CsDetailComponent): boolean {
        if (component.shouldConfirmOnBeforeunload()) {
            const msg = component.labels.customize_transition_confirm_message;
            if (confirm(msg)) {
                return true;
            } else {
                if (this.backClicked) {
                    this.backClicked = false;
                    history.pushState(null, null, null);
                }
                return false;
            }
        }
        return true;
    }

    /**
     * 一覧画面のリスト取得API呼び出し
     * @param carId パラメータ
     * @param requestHeaderParams ヘッダ情報
     */
    public fetchIndexList(carId: string, requestHeaderParams: RequestHeaderParams): Promise<Api> {
        return new Promise((resolve, reject) => {
            this.api.requestHandler(
                'fetchIndexList',
                this.api
                    .get(
                        {
                            apiId: Apis.getCars_carId_CustomizeUsageDefinitionDetails,
                            params: [carId],
                        },
                        null,
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
     * カスタマイズ設定詳細の初期表示に必要な情報を取得
     */
    public fetchIndexInitData(): Promise<InitializeApiResult> {
        this.api.currentScreenCode = ScreenCodeConst.CAR_MGT_DETAIL;
        return this.api.callApisForInitialize(ScreenCodeConst.CAR_MGT_DETAIL, 'fetchIndexInitData', {
            fields1: () => this.api.fetchFields(FunctionCodeConst.CAR_MGT_DETAIL_FUNCTION, '1'),
            fields2: () => this.api.fetchFields(FunctionCodeConst.CAR_MGT_DETAIL_FUNCTION, '2'),
            fields3: () => this.api.fetchFields(FunctionCodeConst.CAR_MGT_DETAIL_FUNCTION, '3'),
            fields4: () => this.api.fetchFields(FunctionCodeConst.CAR_MGT_DETAIL_FUNCTION, '4'),
            fields5: () => this.api.fetchFields(FunctionCodeConst.CAR_MGT_DETAIL_FUNCTION, '5'),
            fields6: () => this.api.fetchFields(FunctionCodeConst.CAR_MGT_DETAIL_FUNCTION, '6'),
        });
    }

    /**
     * 車両カスタマイズ用途定義一括取得要求API呼び出し
     * @param params パラメータ
     * @param requestHeaderParams ヘッダ情報
     */
    public postCarsRequestSetsCustomizeUsageDefinitionsM2s(
        params: GetCustomizeUsageDefinitionRequestParam,
        requestHeaderParams: RequestHeaderParams
    ): Promise<Api> {
        return new Promise((resolve, reject) => {
            this.api.requestHandler(
                'postCarsRequestSetsCustomizeUsageDefinitionsM2s',
                this.api
                    .post(Apis.postCarsRequestSetsCustomizeUsageDefinitionsM2s, params, {
                        cache: false,
                        request_header: requestHeaderParams,
                    })
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
     * 車両カスタマイズ用途定義更新要求API呼び出し
     * @param carId パラメータ
     * @param params パラメータ
     * @param requestHeaderParams ヘッダ情報
     */
    public postCarsCarIdRequestsCustomizeUsageDefinitionsS2m(
        carId: string,
        params: UpdateCustomizeUsageDefinitionRequestParam,
        requestHeaderParams: RequestHeaderParams
    ): Promise<Api> {
        return new Promise((resolve, reject) => {
            this.api.requestHandler(
                'postCarsCarIdRequestsCustomizeUsageDefinitionsS2m',
                this.api
                    .post(
                        {
                            apiId: Apis.postCars_carId_RequestsCustomizeUsageDefinitionsS2m,
                            params: [carId],
                        },
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
     * 車両カスタマイズ設定要求再送API呼び出し
     * @param carId パラメータ
     * @param params パラメータ
     * @param requestHeaderParams ヘッダ情報
     */
    public postCarsCarIdRequestsCustomizeSettingsRetryS2m(
        carId: string,
        params: RetryCustomizeUsageDefinitionRequestParam,
        requestHeaderParams: RequestHeaderParams
    ): Promise<Api> {
        return new Promise((resolve, reject) => {
            this.api.requestHandler(
                'postCarsCarIdRequestsCustomizeSettingsRetryS2m',
                this.api
                    .post(
                        {
                            apiId: Apis.postCars_carId_RequestsCustomizeSettingsRetryS2m,
                            params: [carId],
                        },
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
}
