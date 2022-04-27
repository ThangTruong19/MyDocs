import { Injectable } from '@angular/core';
import * as _ from 'lodash';

import { Api, Fields } from '../../../types/common';
import { RequestHeaderParams } from '../../../types/request';
import {
  LandmarkParams,
  LandmarIndexParams,
} from '../../../types/flm/landmark';

import { KindSetting } from '../../../constants/flm/landmark';

import { ScreenCode } from '../../../constants/flm/screen-codes/landmark-management';
import { FunctionCode } from '../../../constants/flm/function-codes/landmark-management';
import { Apis } from '../../../constants/apis';

import { ApiService } from '../../api/api.service';
import { ResourceService } from '../../api/resource.service';

@Injectable()
export class LandmarkService {
  constructor(private api: ApiService, private resource: ResourceService) {}

  /**
   * ランドマーク登録の初期表示に必要な API をコール
   */
  fetchNewInitData(opt?: any): Promise<any> {
    this.api.currentScreenCode = ScreenCode.regist;
    return this.api.callApisForInitialize(
      ScreenCode.regist,
      'fetchNewInitData',
      {
        mapFields: () => this.api.fetchFields(FunctionCode.listMapFunction),
      }
    );
  }

  /**
   * ランドマーク取得
   * @param params パラメータ
   * @param requestHeaderParams ヘッダー情報
   */
  fetchIndexList(
    params: LandmarIndexParams,
    requestHeaderParams: RequestHeaderParams
  ): Promise<Api> {
    params['editable_kind'] = KindSetting.on;
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchLandmarkIndexList',
        this.api
          .get(Apis.getLandmarks, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * ランドマークアイコン一覧取得
   */
  fetchIcons(): Promise<Api> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchIcons',
        this.api
          .get(Apis.getApplicationsLandmarkIcons, '', { cache: false })
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * ランドマーク登録
   * @param params パラメータ
   */
  createLandmark(params: LandmarkParams<[number, number]>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createLandmark',
        this.api
          .post(Apis.postLandmarks, params)
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * ランドマーク一覧の初期化APIを呼ぶ
   */
  fetchIndexInitData() {
    this.api.currentScreenCode = ScreenCode.list;
    return this.api.callApisForInitialize(
      ScreenCode.list,
      'fetchIndexInitData',
      {
        updatable: Apis.putLandmarks_landmarkId_,
        deletable: Apis.deleteLandmarks_landmarkId_,
        fields: () => this.api.fetchFields(FunctionCode.listFunction),
        // deleteFields: () =>
        //   this.api.fetchFields(FunctionCode.listDeleteFunction),
        // mapFields: () => this.api.fetchFields(FunctionCode.listMapFunction),
      }
    );
  }

  /**
   * ランドマーク削除 API を実行
   * @param id ランドマークID
   * @param updateDatetime 更新日時
   */
  deleteLandmark(id: string, updateDatetime: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'deleteLandmark',
        this.api
          .delete(
            {
              apiId: Apis.deleteLandmarks_landmarkId_,
              params: [id],
            },
            { update_datetime: updateDatetime }
          )
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * ランドマーク変更の初期表示に必要な API をコール
   * @param params クエリーパラメータ
   */
  fetchEditInitData(params): Promise<any> {
    this.api.currentScreenCode = ScreenCode.edit;
    return this.api.callApisForInitialize(ScreenCode.edit, 'fetchInitEdit', {
      target: () => this.api.get(Apis.getLandmarks, params, { cache: false }),
      mapFields: () => this.api.fetchFields(FunctionCode.listMapFunction),
    });
  }

  /**
   * ランドマーク更新
   * @param params パラメータ
   * @param id ランドマーク ID
   * @param updateDatetime 更新日時
   */
  updateLandmark(
    params: LandmarkParams<[number, number]>,
    id: string,
    updateDatetime: string
  ): Promise<any> {
    _.set(params.landmark, 'update_datetime', updateDatetime);
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createLandmark',
        this.api
          .put(
            {
              apiId: Apis.putLandmarks_landmarkId_,
              params: [id],
            },
            params
          )
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * 一覧/削除モーダルの指定項目を取得
   */
  fetchIndexDeleteFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler('fetchIndexDeleteFields',
        this.api
          .fetchFields(FunctionCode.listDeleteFunction)
          .subscribe((res) => resolve(res))
      );
    });
  }

  /**
   * 一覧/MAPの指定項目を取得
   */
  fetchIndexMapFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler('fetchIndexMapFields',
        this.api
          .fetchFields(FunctionCode.listMapFunction)
          .subscribe((res) => resolve(res))
      );
    });
  }
}
