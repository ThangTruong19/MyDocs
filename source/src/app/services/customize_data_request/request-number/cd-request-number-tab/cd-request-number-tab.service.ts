import { Injectable } from '@angular/core';
import { FunctionCodeConst } from 'app/constants/api/function-code-const';
import { ScreenCodeConst } from 'app/constants/api/screen-code-const';
import { Apis } from 'app/constants/apis';
import { ApiService } from 'app/services/api/api.service';
import { ResourceService } from 'app/services/api/resource.service';
import { RequestHeaderParams } from 'app/types/request';

/**
 * 送信要求（送信番号単位）タブのサービス
 */
@Injectable()
export class CdRequestNumberTabService {
    constructor(private api: ApiService, private resource: ResourceService) { }

    fetchCarInitData(opt?: any): Promise<any> {
        this.api.currentScreenCode = ScreenCodeConst.CDSM_REQUEST_NUMBER_TAB;
        return this.api.callApisForInitialize(
            ScreenCodeConst.CDSM_REQUEST_NUMBER_TAB,
            'fetchCarInitData',
            {
                fields: () =>
                    this.api.fetchFields(
                        FunctionCodeConst.CDSM_CUSTOMIZE_DATA_REQUEST_NUMBER_TAB
                    ),
                fieldResources: () =>
                    this.api.fetchFieldResources(
                        FunctionCodeConst.CDSM_CUSTOMIZE_DATA_REQUEST_NUMBER_TAB
                    ),
                cdRequestNumberListFields: () =>
                    this.api.fetchFields(
                        FunctionCodeConst.CDSM_CUSTOMIZE_DATA_REQUEST_NUMBER_TAB, '2'
                    ),
                cdRequestNumberConfirmFields: () =>
                    this.api.fetchFields(
                        FunctionCodeConst.CDSM_CUSTOMIZE_DATA_REQUEST_NUMBER_TAB, '4'
                    )
            }
        );
    }

    /**
      * 車両管理一覧取得APIリクエスト
      * @param params リクエストパラメータ
      * @param requestHeaderParams ヘッダ情報
      */
    fetchCarIndexList(
        params: any,
        requestHeaderParams: RequestHeaderParams
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            this.api.requestHandler(
                'fetchCarIndexList',
                this.api
                    .post(Apis.postCustomizeDataRequestDetail,
                        params,
                        { cache: false, request_header: requestHeaderParams }
                    )
                    .subscribe(res => {
                        resolve(res);
                    })
            );
        });
    }
}
