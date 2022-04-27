import { Injectable } from '@angular/core';

import {
  SystemNotificationIndexParams,
  SystemNotificationDeleteParams,
  SystemNotificationParams,
} from '../../../types/opa/system-notification';
import { RequestHeaderParams } from '../../../types/request';
import { Fields } from '../../../types/common';

import { ScreenCode } from '../../../constants/opa/screen-codes/system-notification-management';
import { FunctionCode } from '../../../constants/opa/function-codes/system-notification-management';
import { Apis } from '../../../constants/apis';

import { ApiService } from '../../api/api.service';
import { FilterReservedWord } from '../../../constants/condition';

@Injectable()
export class SystemNotificationService {
  constructor(private api: ApiService) {}

  /**
   * システム通知一覧画面の初期表示に必要な情報を取得します。
   * @param opt パラメータ
   */
  fetchInitData(opt?: any) {
    this.api.currentScreenCode = ScreenCode.list;
    return this.api.callApisForInitialize(
      ScreenCode.list,
      'fetchDataForIntializeIndex',
      {
        updatable:
          Apis.putApplicationsSystemNotifications_systemNotificationId_,
        deletable:
          Apis.deleteApplicationsSystemNotifications_systemNotificationId_,
        fields: () => this.api.fetchFields(FunctionCode.listFunction),
      }
    );
  }

  /**
   * システム通知一覧画面のリスト表示に必要な情報を取得
   * @param params パラメータ
   * @param opt パラメータ
   */
  fetchIndexList(
    params: SystemNotificationIndexParams,
    requestHeaderParams: RequestHeaderParams,
    opt?: any
  ): Promise<any> {
    // #46629対応 公開先アプリが「全て」の場合はパラメータの指定を除外する
    if (params.publish_application_code === FilterReservedWord.selectAll) {
      params.publish_application_code = null;
    }

    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchIndexList',
        this.api
          .get(Apis.getApplicationsSystemNotifications, params, {
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
   * システム通知の削除 API
   * @param id システム通知の ID
   */
  deleteSystemNotifications(
    id: string,
    params: SystemNotificationDeleteParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'deleteSystemNotifications',
        this.api
          .delete(
            {
              apiId:
                Apis.deleteApplicationsSystemNotifications_systemNotificationId_,
              params: [id],
            },
            params
          )
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * システム通知登録の初期表示に必要な情報を取得
   *
   * @return {Object} 初期パラメータ群
   */
  fetchInitNew(opt?: any): Promise<any> {
    this.api.currentScreenCode = ScreenCode.regist;
    return this.api.callApisForInitialize(
      ScreenCode.regist,
      'fetchInitNew',
      {}
    );
  }

  /**
   * システム通知の登録 API
   *
   * @param {Object} params APIパラメータ
   * @return {Object} 応答本文
   */
  createSystemNotification(params: SystemNotificationParams): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createSystemNotification',
        this.api
          .post(Apis.postApplicationsSystemNotifications, params)
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * システム通知更新の初期化に必要な情報を取得
   * @param params パラメタ
   */
  fetchEditInitData(params): Promise<any> {
    this.api.currentScreenCode = ScreenCode.edit;
    return this.api.callApisForInitialize(
      ScreenCode.edit,
      'fetchEditInitData',
      {
        target: () =>
          this.api.get(Apis.getApplicationsSystemNotifications, params, {
            cache: false,
          }),
      }
    );
  }

  /**
   * システム通知の更新 API
   * @param id システム通知の ID
   * @param params パラメタ
   */
  updateSystemNotifications(
    id: string,
    params: SystemNotificationParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateSystemNotifications',
        this.api
          .put(
            {
              apiId:
                Apis.putApplicationsSystemNotifications_systemNotificationId_,
              params: [id],
            },
            params
          )
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * 一覧/削除モーダル用指定項目取得
   */
  fetchIndexDeleteFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchIndexDeleteFields',
        this.api
          .fetchFields(FunctionCode.listDeleteFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 一覧/詳細モーダル用指定項目取得
   */
  fetchIndexDetailFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchIndexDetailFields',
        this.api
          .fetchFields(FunctionCode.listDetailFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 一覧/指定項目リソース取得
   */
  fetchIndexFieldResources() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchIndexFieldResources',
        this.api
          .fetchFieldResources(FunctionCode.listFunction)
          .subscribe(res => resolve(res))
      );
    });
  }
}
