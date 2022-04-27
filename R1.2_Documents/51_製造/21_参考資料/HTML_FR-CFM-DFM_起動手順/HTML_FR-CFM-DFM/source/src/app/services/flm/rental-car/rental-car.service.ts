import { Injectable } from '@angular/core';

import { RequestHeaderParams } from '../../../types/request';
import { Api, Resources } from '../../../types/common';
import { UpdateParams } from '../../../types/flm/rental-car';

import { ScreenCode } from '../../../constants/flm/screen-codes/rental-car-management';
import { ScreenCode as CommonScreenCode } from '../../../constants/flm/screen-codes/common';
import { FunctionCode } from '../../../constants/flm/function-codes/rental-car-management';
import { Apis } from '../../../constants/apis';

import { ApiService } from '../../api/api.service';
import { ResourceService } from '../../../services/api/resource.service';

@Injectable()
export class RentalCarService {
  constructor(private api: ApiService, private resource: ResourceService) {}

  /**
   * レンタル車両変更の初期化に必要な情報を取得する
   */
  fetchIndexInitData() {
    this.api.currentScreenCode = ScreenCode.list;
    return this.api.callApisForInitialize(
      ScreenCode.list,
      'fetchIndexInitData',
      {
        fields: () => this.api.fetchFields(FunctionCode.list),
        downloadFields: () => this.api.fetchFields(FunctionCode.listDownload),
        historyFields: () => this.api.fetchFields(FunctionCode.listHistory),
        updatable: Apis.putCars_carId_Rental,
      }
    );
  }

  /**
   * レンタル車両変更の初期化に必要な情報を取得するD
   */
  fetchEditInitData() {
    this.api.currentScreenCode = ScreenCode.edit;
    return this.api.callApisForInitialize(
      ScreenCode.edit,
      'fetchEditInitData',
      {
        fields: () => this.api.fetchFields(FunctionCode.editCarList),
      }
    );
  }

  /**
   * レンタル車両一覧取得
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ
   */
  fetchRentalCars(params, requestHeaderParams: RequestHeaderParams) {
    return new Promise<Api>((resolve, reject) =>
      this.api.requestHandler(
        'fetchRentalCars',
        this.api
          .post(Apis.postCarsRentalSearch, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res), error => reject(error))
      )
    );
  }

  /**
   * レンタル車両履歴取得
   * @param carId 車両ID
   * @param requestHeaderParams ヘッダ
   */
  fetchRentalHistories(
    carId: string,
    requestHeaderParams: RequestHeaderParams
  ) {
    return new Promise<Api>((resolve, reject) =>
      this.api.requestHandler(
        'fetchRentalHistories',
        this.api
          .get(
            {
              apiId: Apis.getCars_carId_RentalHistories,
              params: [carId],
            },
            null,
            { cache: false, request_header: requestHeaderParams }
          )
          .subscribe(res => resolve(res), error => reject(error))
      )
    );
  }

  /**
   * レンタル車両一覧ファイル作成
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ
   */
  createFile(params, requestHeaderParams: RequestHeaderParams) {
    requestHeaderParams['X-Count'] = null;
    requestHeaderParams['X-From'] = null;

    return new Promise<Api>((resolve, reject) =>
      this.api.requestHandler(
        'createFile',
        this.api
          .post(Apis.postCarsRentalSearchFileCreate, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res), error => reject(error))
      )
    );
  }

  /**
   * レンタル顧客IDに紐づくリソースを取得
   * @param customerId レンタル顧客ID
   * @param identifier パスの識別子
   * @param condition 検索条件のパス
   * @param fetchCustomerName 顧客名を取得する
   */
  fetchCustomerIdBelongingResource(
    customerId: string,
    identifier: string,
    condition: string,
    fetchCustomerName?: boolean
  ) {
    const searchParameters = [
      {
        resource_path: `car.rental.${identifier}.customer_id`,
        condition_sets: [
          {
            condition,
            values: [customerId],
          },
        ],
      },
    ];

    if (fetchCustomerName) {
      searchParameters.push({
        resource_path: `car.rental.${identifier}.customer_label`,
        condition_sets: [
          {
            condition,
            values: [customerId],
          },
        ],
      });
    }

    return new Promise<Resources>((resolve, reject) => {
      this.api.requestHandler(
        'fetchCustomerIdBelongingResource',
        this.api
          .post(Apis.postApplicationsViewsResourcesSearch, {
            screen_code: ScreenCode.edit,
            search_parameters: searchParameters,
          })
          .subscribe(res => resolve(this.resource.parse(res.result_data)))
      );
    });
  }

  /**
   * レンタル車両更新APIを実行
   * @param id 車両ID
   * @param params パラメータ
   */
  updateRentalCars(id: string, params: UpdateParams) {
    return new Promise<Api>((resolve, reject) =>
      this.api.requestHandler(
        'updateRentalCars',
        this.api
          .put(
            {
              apiId: Apis.putCars_carId_Rental,
              params: [id],
            },
            params,
            { cache: false }
          )
          .subscribe(res => resolve(res), error => reject(error))
      )
    );
  }
}
