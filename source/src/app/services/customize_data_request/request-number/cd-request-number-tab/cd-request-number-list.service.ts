import { Injectable } from "@angular/core";
import { Apis } from "app/constants/apis";
import { ApiService } from "app/services/api/api.service";
import { Api } from "app/types/common";
import { RequestHeaderParams } from "app/types/request";

@Injectable()
export class CdRequestNumberListService {
    constructor(private api: ApiService) {}

    /**
     * カスタマイズデータ管理
     * @param params リクエストパラメータ
     * @param requestHeaderParams ヘッダ情報
     */
    fetchCarTransmissionNumbers(
        params: any,
        requestHeaderParams: RequestHeaderParams
    ): Promise<any>{
        return new Promise((resolve, reject) => {
            this.api.requestHandler(
                'fetchCarTransmissionNumbers',
                this.api
                  .get(Apis.getListCarsTransmissionNumbers, params, {
                    cache: false,
                    request_header: requestHeaderParams,
                  })
                  .subscribe(
                    {
                        next: (res: Api) => {
                            resolve(res);
                        },
                        error: (error) => reject(error)
                    }
                  )
              );
        });
    }
}