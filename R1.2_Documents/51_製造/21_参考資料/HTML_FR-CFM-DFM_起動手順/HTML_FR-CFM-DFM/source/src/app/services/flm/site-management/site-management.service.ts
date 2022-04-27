import { Injectable } from '@angular/core';

import { RequestHeaderParams } from '../../../types/request';
import { Api } from '../../../types/common';
import { MonthlyParams, DailyParams } from '../../../types/flm/site-management';

import { ScreenCode } from '../../../constants/flm/screen-codes/site-management';
import { ScreenCode as CommonScreenCode } from '../../../constants/flm/screen-codes/common';
import { FunctionCode } from '../../../constants/flm/function-codes/site-management';
import { Mode } from '../../../constants/flm/site-management';
import { Apis } from '../../../constants/apis';

import { ApiService } from '../../api/api.service';
import { ResourceService } from '../../api/resource.service';

@Injectable()
export class SiteManagementService {
  constructor(private api: ApiService, private resource: ResourceService) {}

  /**
   * 現場一覧画面の初期表示に必要な情報を取得
   */
  fetchSiteInitData() {
    this.api.currentScreenCode = ScreenCode.site;
    return this.api.callApisForInitialize(
      ScreenCode.site,
      'fetchSiteInitData',
      {
        fields: () => this.api.fetchFields(FunctionCode.siteListFunction),
      }
    );
  }

  /**
   * エリア一覧画面の初期表示に必要な情報を取得
   */
  fetchAreaInitData() {
    this.api.currentScreenCode = ScreenCode.area;
    return this.api.callApisForInitialize(
      ScreenCode.area,
      'fetchAreaInitData',
      {
        fields: () => this.api.fetchFields(FunctionCode.areaListFunction),
      }
    );
  }

  /**
   * 現場一覧を取得
   */
  fetchSiteMaps(
    params?: { site_ids: string[] },
    requestHeaderParams?: RequestHeaderParams
  ) {
    return new Promise<Api>((resolve, reject) => {
      this.api.requestHandler(
        'fetchSiteMaps',
        this.api
          .get(
            Apis.getSitesMaps,
            { ...params, mode: Mode.site },
            { cache: false, request_header: requestHeaderParams }
          )
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * エリア一覧を取得
   */
  fetchAreaMaps(
    params?: { area_ids?: string[]; customer_ids?: string[] },
    requestHeaderParams?: RequestHeaderParams
  ) {
    return new Promise<Api>((resolve, reject) => {
      this.api.requestHandler(
        'fetchAreaMaps',
        this.api
          .get(
            Apis.getSitesMaps,
            { ...params, mode: Mode.area },
            { cache: false, request_header: requestHeaderParams }
          )
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 詳細画面（稼働状況）の初期表示に必要な情報を取得
   * @param screenCode 画面コード（現場・エリアの切り分けに使用する）
   */
  fetchStatInitData(screenCode: string) {
    this.api.currentScreenCode = screenCode;
    return this.api.callApisForInitialize(screenCode, 'fetchStatInitData');
  }

  /**
   * 詳細画面（稼働状況）の初期表示に必要な情報を取得
   * @param screenCode 画面コード（現場・エリアの切り分けに使用する）
   */
  fetchMapInitData(screenCode: string) {
    this.api.currentScreenCode = screenCode;
    return this.api.callApisForInitialize(screenCode, 'fetchMapInitData', {
      fields: () => this.api.fetchFields(FunctionCode.carListFunction),
    });
  }

  /**
   * 月次稼働状況を取得
   */
  fetchMonthlyOperations(params: MonthlyParams) {
    return new Promise<Api>((resolve, reject) => {
      this.api.requestHandler(
        'fetchMonthlyOperations',
        this.api
          .get(Apis.getSitesCarsOperationsMonthly, params, { cache: false })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 日次稼働状況を取得
   */
  fetchDailyOperations(params: DailyParams) {
    return new Promise<Api>((resolve, reject) => {
      this.api.requestHandler(
        'fetchDailyOperations',
        this.api
          .get(Apis.getSitesCarsOperationsDaily, params, { cache: false })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 保税エリア一覧取得
   */
  fetchBondAreas() {
    return new Promise<Api>((resolve, reject) => {
      this.api.requestHandler(
        'fetchBondAreas',
        this.api
          .get(Apis.getAreasBond, null, { cache: false })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * ランドマーク一覧取得
   */
  fetchLandmarks() {
    return new Promise<Api>((resolve, reject) => {
      this.api.requestHandler(
        'fetchLandmarks',
        this.api
          .get(Apis.getLandmarks, null, { cache: false })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 車両一覧取得
   */
  fetchCars(fields: string) {
    return new Promise<Api>((resolve, reject) => {
      this.api.requestHandler(
        'fetchCars',
        this.api
          .post(Apis.postCarsSearch, null, {
            cache: false,
            request_header: {
              'X-Fields': fields,
            },
          })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }
}
