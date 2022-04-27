import { Injectable } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { Apis } from '../../../constants/apis';
import { FunctionCode } from '../../../constants/flm/function-codes/support-distributor-change-management';
import { RequestHeaderParams } from '../../../types/request';
import {
  CarAssignsSearchParams,
  CarAssignsParams,
  SupportDistributorChangeConsignorParams,
} from '../../../types/flm/support-distributor-change';
import { ScreenCode } from '../../../constants/flm/screen-codes/support-distributor-change-management';
import { SearchItems } from '../../../types/search';

@Injectable()
export class SupportDistributorChangeService {
  constructor(private api: ApiService) {}

  /**
   * 担当代理店変更承認の初期表示に必要な情報を取得
   */
  fetchSupportDistributorChangeConsigneeInitData(): Promise<any> {
    this.api.currentScreenCode = ScreenCode.supportDistributorChangeConsignee;
    return this.api.callApisForInitialize(
      ScreenCode.supportDistributorChangeConsignee,
      'fetchSupportDistributorChangeConsigneeInitData',
      {
        fields: () =>
          this.api.fetchFields(
            FunctionCode.supportDistributorChangeConsigneeFunction
          ),
        assignFields: () =>
          this.api.fetchFields(
            FunctionCode.supportDistributorChangeConsigneeConfirmFunction
          ),
        enableAssigns: Apis.putCarsAssigns,
      }
    );
  }

  /**
   * 車両引き当て一覧取得APIリクエスト
   * @param params リクエストパラメータ
   * @param requestHeaderParams ヘッダ情報
   */
  fetchSupportDistributorChangeConsigneeList(
    params: CarAssignsSearchParams,
    requestHeaderParams: RequestHeaderParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchSupportDistributorChangeConsigneeList',
        this.api
          .get(Apis.getCarsAssigns, params, {
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
   * 車両引き当てAPIリクエスト
   * @param params リクエストパラメータ
   */
  updateSupportDistributorChangeConsignee(
    params: CarAssignsParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateSupportDistributorChangeConsignee',
        this.api.put(Apis.putCarsAssigns, params).subscribe(res => {
          resolve(res);
        })
      );
    });
  }

  /**
   * 担当代理店変更の初期表示に必要な情報を取得
   */
  fetchCarSupportDistributorChangeConsignorInitData(): Promise<any> {
    this.api.currentScreenCode = ScreenCode.supportDistributorChangeConsignor;
    return this.api.callApisForInitialize(
      ScreenCode.supportDistributorChangeConsignor,
      'fetchCarSupportDistributorChangeConsignorInitData',
      {
        fields: () =>
          this.api.fetchFields(
            FunctionCode.supportDistributorChangeConsignorFunction
          ),
        fieldResources: () =>
          this.api.fetchFieldResources(
            FunctionCode.supportDistributorChangeConsignorFunction
          ),
        searchCondition: () =>
          this.api.fetchSearchCondition(
            ScreenCode.supportDistributorChangeConsignor
          ),
        applyFields: () =>
          this.api.fetchFields(
            FunctionCode.supportDistributorChangeConsignorTargetFunction
          ),
        applyConfirmFields: () =>
          this.api.fetchFields(
            FunctionCode.supportDistributorChangeConsignorConfirmFunction
          ),
        enableConsignor: Apis.postCarsSupportDistributorChangeConsignor,
      }
    );
  }

  /**
   * 車両管理 担当代理店変更の検索条件を更新
   */
  updateSupportDistributorChangeConsignorSearchCondition(
    params: SearchItems
  ): Promise<any> {
    return this.api.updateSearchCondition(
      ScreenCode.supportDistributorChangeConsignor,
      params
    );
  }

  /**
   * 車両管理 担当代理店変更の検索条件を初期化
   */
  initSupportDistributorChangeConsignorSearchCondition(): Promise<any> {
    return this.api.initSearchCondition(
      ScreenCode.supportDistributorChangeConsignor
    );
  }

  /**
   * 担当代理店変更申請登録APIリクエスト
   * @param params リクエストパラメータ
   */
  consignorSupportDistributorChange(
    params: SupportDistributorChangeConsignorParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'consignorSupportDistributorChange',
        this.api
          .post(Apis.postCarsSupportDistributorChangeConsignor, params)
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }
}
