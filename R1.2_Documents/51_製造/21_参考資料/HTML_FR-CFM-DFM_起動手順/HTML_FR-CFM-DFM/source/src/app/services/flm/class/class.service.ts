import { Injectable } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { ResourceService } from '../../api/resource.service';
import { RequestHeaderParams } from '../../../types/request';
import { ClassParams, ClassIndexParams } from '../../../types/flm/class';
import * as _ from 'lodash';
import { ScreenCode } from '../../../constants/flm/screen-codes/class-management';
import { FunctionCode } from '../../../constants/flm/function-codes/class-management';
import { Apis } from '../../../constants/apis';
import { Api } from '../../../types/common';

@Injectable()
export class ClassService {
  constructor(private api: ApiService, private resource: ResourceService) {}

  fetchInitNew(opt?: any): Promise<any> {
    this.api.currentScreenCode = ScreenCode.regist;
    return this.api.callApisForInitialize(ScreenCode.regist, 'fetchInitNew');
  }

  /**
   * 分類登録APIを実行
   *
   * @param {Object} params APIパラメータ
   * @return {Object} 応答本文
   */
  createClass(params: ClassParams): Promise<any> {
    const requestBody = {
      class: {
        kind_id: params.kind_id,
        label: params.label,
      },
    };
    if (_.has(params, 'support_distributor_id')) {
      requestBody.class['support_distributor_id'] =
        params.support_distributor_id;
    }
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createClass',
        this.api
          .post(Apis.postClasses, requestBody)
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * 分類一覧の初期表示に必要な情報を取得
   *
   * @return {Object} 初期パラメータ群
   */
  fetchIndexInitData(opt?: any) {
    this.api.currentScreenCode = ScreenCode.list;
    return this.api.callApisForInitialize(ScreenCode.list, 'fetchInitIndex', {
      updatable: Apis.putClasses_classId_,
      deletable: Apis.deleteClasses_classId_,
      fields: () => this.api.fetchFields(FunctionCode.listFunction),
      deleteFields: () => this.api.fetchFields(FunctionCode.listDeleteFunction),
    });
  }

  /**
   * 分類更新APIを実行
   *
   * @param {Object} params APIパラメータ
   * @return {Object} 応答本文
   */
  updateClass(params: ClassParams): Promise<any> {
    const class_id = params.id;
    const requestBody = {
      class: {
        update_datetime: params.update_datetime,
        label: params.label,
      },
    };

    if (_.has(params, 'support_distributor_id')) {
      requestBody.class['support_distributor_id'] =
        params.support_distributor_id;
    }
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateClass',
        this.api
          .put(
            {
              apiId: Apis.putClasses_classId_,
              params: [class_id],
            },
            requestBody
          )
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * 一覧画面用に分類一覧取得APIを実行する
   *
   * @param {Object} APIパラメータ
   * @return {Object} 初期パラメータ
   */
  fetchIndexList(
    params: ClassIndexParams,
    requestHeaderParams: RequestHeaderParams
  ) {
    return new Promise<Api>((resolve, reject) => {
      this.api.requestHandler(
        'fetchIndexList',
        this.api
          .get(Apis.getClasses, params, { request_header: requestHeaderParams })
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * 分類削除APIを実行
   *
   * @param {any} id APIパラメータ
   * @return {Object} 応答本文
   */
  deleteClassItem(class_id: string, update_datetime: string) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'deleteClassItem',
        this.api
          .delete(
            {
              apiId: Apis.deleteClasses_classId_,
              params: [class_id],
            },
            { update_datetime }
          )
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * 分類変更画面の初期表示に必要な情報を取得
   *
   * @param params 変更対象のパラメータ(分類項目IDを含む)
   * @return {Object} 初期パラメータ群
   */
  fetchEditInitData(params): Promise<any> {
    this.api.currentScreenCode = ScreenCode.edit;
    return this.api.callApisForInitialize(
      ScreenCode.edit,
      'fetchEditInitData',
      {
        classItem: () => this.api.get(Apis.getClasses, params),
      }
    );
  }
}
