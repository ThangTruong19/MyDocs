import { Injectable } from '@angular/core'
import { CanDeactivate } from '@angular/router'
import { LocationStrategy } from '@angular/common'

import { Api } from 'app/types/common'
import { Apis } from 'app/constants/apis'
import { RequestHeaderParams } from 'app/types/request'
import {
  RequestBodyParamsKOM00110120,
  RequestBodyParamsKOM00110130,
  RequestBodyParamsKOM00110XXX,
} from 'app/types/cs-detail'
import { ScreenCodeConst } from 'app/constants/api/screen-code-const'
import { FunctionCodeConst } from 'app/constants/api/function-code-const'
import { ApiService } from '../api/api.service'
import { CsDetailComponent } from 'app/components/customize_setting/cs-detail.component'

@Injectable()
export class CsDetailService implements CanDeactivate<CsDetailComponent>{
  constructor(private api: ApiService, private locationStrategy: LocationStrategy) {
    this.locationStrategy.onPopState(() => {
      this.backClicked = true
    })
  }

  backClicked = false

  canDeactivate(component: CsDetailComponent) {
    if (component.shouldConfirmOnBeforeunload()) {
      const msg = component.labels.customize_transition_confirm_message
      if (confirm(msg)) {
        return true
      } else {
        if (this.backClicked) {
          this.backClicked = false
          history.pushState(null, null, null)
        }
        return false
      }
    }
    return true
  }

  /**
   * 一覧画面のリスト取得API呼び出し
   * @param carId パラメータ
   * @param requestHeaderParams ヘッダ情報
   */
  fetchIndexList(carId: string,
    requestHeaderParams: RequestHeaderParams
  ): Promise<Api> {
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
          .subscribe(
            {
              next: (res: Api) => {
                resolve(res)
              },
              error: (error) => reject(error)
            }
          )
      )
    })
  }

  /**
   * カスタマイズ設定詳細の初期表示に必要な情報を取得
   */
  fetchIndexInitData() {
    this.api.currentScreenCode = ScreenCodeConst.CAR_MGT_DETAIL
    return this.api.callApisForInitialize(
      ScreenCodeConst.CAR_MGT_DETAIL,
      'fetchIndexInitData',
      {
        csDetailFields: () =>
          this.api.fetchFields(FunctionCodeConst.CAR_MGT_DETAIL_FUNCTION, "1"),
        csUpdateRequestConfirmFields: () =>
          this.api.fetchFields(FunctionCodeConst.CAR_MGT_DETAIL_FUNCTION, "2"),
        csImmediateUpdateRequestConfirmFields: () =>
          this.api.fetchFields(FunctionCodeConst.CAR_MGT_DETAIL_FUNCTION, "2"),
        csRequestResendConfirmFields: () =>
          this.api.fetchFields(FunctionCodeConst.CAR_MGT_DETAIL_FUNCTION, "2"),
        csNewFields: () =>
          this.api.fetchFields(FunctionCodeConst.CAR_MGT_DETAIL_FUNCTION, "3"),
        csEditFields: () =>
          this.api.fetchFields(FunctionCodeConst.CAR_MGT_DETAIL_FUNCTION, "3"),
        csExpectedTrafficConfirmFields1: () =>
          this.api.fetchFields(FunctionCodeConst.CAR_MGT_DETAIL_FUNCTION, "5"),
        csExpectedTrafficConfirmFields2: () =>
          this.api.fetchFields(FunctionCodeConst.CAR_MGT_DETAIL_FUNCTION, "4"),
      }
    )
  }

  /**
   * 車両カスタマイズ用途定義一括取得要求API呼び出し
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ情報
   */
  postCarsRequestSetsCustomizeUsageDefinitionsM2s(
    params: RequestBodyParamsKOM00110120,
    requestHeaderParams: RequestHeaderParams
  ): Promise<Api> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'postCarsRequestSetsCustomizeUsageDefinitionsM2s',
        this.api.post(Apis.postCarsRequestSetsCustomizeUsageDefinitionsM2s, params, {
          cache: false,
          request_header: requestHeaderParams,
        })
          .subscribe(
            {
              next: (res: Api) => {
                resolve(res)
              },
              error: (error) => reject(error)
            }
          )
      )
    })
  }

  /**
   * 車両カスタマイズ用途定義更新要求API呼び出し
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ情報
   */
  postCarsRequestsCustomizeUsageDefinitionsS2m(
    params: RequestBodyParamsKOM00110130,
    requestHeaderParams: RequestHeaderParams
  ): Promise<Api> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'postCarsRequestsCustomizeUsageDefinitionsS2m',
        this.api
          .post(Apis.postCarsRequestsCustomizeUsageDefinitionsS2m, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(
            {
              next: (res: Api) => {
                resolve(res)
              },
              error: (error) => reject(error)
            }
          )
      )
    })
  }

  /**
   * 車両カスタマイズ設定要求再送API呼び出し
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ情報
   */
  postCarsRequestsCustomizeSettingsRetryS2m(
    params: RequestBodyParamsKOM00110XXX,
    requestHeaderParams: RequestHeaderParams
  ): Promise<Api> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'postCarsRequestsCustomizeSettingsRetryS2m',
        this.api.post(Apis.postCarsRequestsCustomizeSettingsRetryS2m, params, {
          cache: false,
          request_header: requestHeaderParams,
        })
          .subscribe(
            {
              next: (res: Api) => {
                resolve(res)
              },
              error: (error) => reject(error)
            }
          )
      )
    })
  }
}