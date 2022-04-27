import { Injectable } from '@angular/core';

import { RequestHeaderParams } from '../../../types/request';
import { Api, Fields } from '../../../types/common';
import {
  SubgroupParams,
  SubgroupIndexParams,
} from '../../../types/flm/subgroup';

import { ScreenCode } from '../../../constants/flm/screen-codes/subgroup-management';
import { FunctionCode } from '../../../constants/flm/function-codes/subgroup-management';
import { Apis } from '../../../constants/apis';

import { ApiService } from '../../api/api.service';
import { ResourceService } from '../../../services/api/resource.service';

@Injectable()
export class SubgroupService {
  constructor(private api: ApiService, private resource: ResourceService) {}

  /**
   * サブグループ登録の初期表示に必要な情報を取得
   *
   * @return {Object} 初期パラメータ群
   */
  fetchInitNew(opt?: any): Promise<any> {
    this.api.currentScreenCode = ScreenCode.regist;
    return this.api.callApisForInitialize(ScreenCode.regist, 'fetchInitNew');
  }

  /**
   * サブグループ登録 API をコール
   * @param params パラメータ
   */
  createSubgroup(params: SubgroupParams): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createSubgroup',
        this.api
          .post(Apis.postGroupsSubGroups, params)
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * サブグループ一覧の初期表示に必要な情報を取得
   */
  fetchIndexInitData() {
    this.api.currentScreenCode = ScreenCode.list;
    return this.api.callApisForInitialize(
      ScreenCode.list,
      'fetchIndexInitData',
      {
        updatable: Apis.putGroupsSubGroups_subGroupId_,
        deletable: Apis.deleteGroupsSubGroups_subGroupId_,
        fields: () => this.api.fetchFields(FunctionCode.listFunction),
      }
    );
  }

  /**
   * 一覧画面のリスト取得APIを呼ぶ
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ情報
   */
  fetchIndexList(
    params: SubgroupIndexParams,
    requestHeaderParams: RequestHeaderParams
  ): Promise<Api> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchIndexList',
        this.api
          .get(Apis.getGroupsSubGroups, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * サブグループ詳細取得 API をコール
   * @param id サブグループID
   * @param requestHeaderParams ヘッダ情報
   */
  fetchSubgroupDetail(
    id: string,
    requestHeaderParams: RequestHeaderParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchSubgroupDetail',
        this.api
          .get(
            {
              apiId: Apis.getGroupsSubGroups_subGroupId_Detail,
              params: [id],
            },
            {},
            { cache: false, request_header: requestHeaderParams }
          )
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 車両管理一覧取得APIリクエスト
   * @param params リクエストパラメータ
   * @param requestHeaderParams ヘッダ情報
   */
  fetchCarListData(
    params,
    requestHeaderParams: RequestHeaderParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchCarListData',
        this.api
          .post(Apis.postCarsSearch, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * サブグループ削除 API をコール
   * @param id ID
   * @param update_datetime 更新日時
   */
  deleteSubgroup(id: string, update_datetime: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'deleteSubgroup',
        this.api
          .delete(
            {
              apiId: Apis.deleteGroupsSubGroups_subGroupId_,
              params: [id],
            },
            { update_datetime }
          )
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * サブグループ変更画面の初期化APIを呼ぶ
   * @param id サブグループ ID
   */
  fetchEditInitData(id: string): Promise<any> {
    this.api.currentScreenCode = ScreenCode.edit;
    return this.api.callApisForInitialize(
      ScreenCode.edit,
      'fetchEditInitData',
      {
        item: () =>
          this.api.get({
            apiId: Apis.getGroupsSubGroups_subGroupId_Detail,
            params: [id],
          }),
      }
    );
  }

  /**
   * サブグループ更新 API をコール
   * @param id ID
   * @param params パラメータ
   */
  updateSubgroup(id: string, params: SubgroupParams): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateSubgroup',
        this.api
          .put(
            {
              apiId: Apis.putGroupsSubGroups_subGroupId_,
              params: [id],
            },
            params
          )
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * 一覧/詳細画面の指定項目取得
   */
  fetchIndexDetailFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler('fetchIndexDetailFields',
        this.api
          .fetchFields(FunctionCode.listDetailFunction)
          .subscribe((res) => resolve(res))
      );
    });
  }

  /**
   * 一覧/削除モーダルの指定項目取得
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
   * 車両一覧の指定項目取得
   */
  fetchCarListFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler('fetchCarListFields',
        this.api
          .fetchFields(FunctionCode.listDetailCarFunction)
          .subscribe((res) => resolve(res))
      );
    });
  }

  /**
   * 一覧/指定項目リソース取得
   */
  fetchIndexFieldResources() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler('fetchCarListFieldResources',
        this.api
          .fetchFieldResources(FunctionCode.listFunction)
          .subscribe((res) => resolve(res))
      );
    });
  }
}
