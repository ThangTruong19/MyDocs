import { Injectable } from '@angular/core';
import { map, omit } from 'lodash';

import {
  UserIndexParams,
  UserDeleteParams,
  UserParams,
  AuthoritiesUpdateParams,
  UserCountParams,
} from '../../../types/opa/user';
import { RequestHeaderParams } from '../../../types/request';
import { Api, Fields } from '../../../types/common';

import { ScreenCode } from '../../../constants/opa/screen-codes/user-management';
import { FunctionCode } from '../../../constants/opa/function-codes/user-management';
import { Apis } from '../../../constants/apis';

import { ApiService } from '../../api/api.service';
import { ResourceService } from '../../../services/api/resource.service';

@Injectable()
export class UserService {
  constructor(private api: ApiService, private resource: ResourceService) {}

  /**
   * 運用ユーザ一覧画面の初期表示に必要な情報を取得する
   * @param opt パラメータ
   */
  fetchInitData(opt?: any) {
    this.api.currentScreenCode = ScreenCode.list;
    return this.api.callApisForInitialize(ScreenCode.list, 'fetchInitData', {
      updatable: Apis.putUsers_userId_,
      deletable: Apis.deleteUsers_userId_,
      fields: () => this.api.fetchFields(FunctionCode.listFunction),
      // deleteFields: () => this.api.fetchFields(FunctionCode.listDeleteFunction),
    });
  }

  /**
   * 運用ユーザ一覧画面のリスト表示に必要な情報を取得する
   * @param params パラメータ
   * @param opt パラメータ
   */
  fetchIndexList(
    params: UserIndexParams,
    requestHeaderParams: RequestHeaderParams,
    opt?: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchIndexList',
        this.api
          .get(Apis.getUsers, params, {
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
   * 運用ユーザを削除する
   * @param id 運用ユーザの ID
   */
  deleteUsers(id: string, params: UserDeleteParams): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'deleteUsers',
        this.api
          .delete(
            {
              apiId: Apis.deleteUsers_userId_,
              params: [id],
            },
            params,
            { screenCode: FunctionCode.listDeleteFunction }
          )
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 運用ユーザ登録の初期表示に必要な情報を取得する
   *
   * @return {Object} 初期パラメータ群
   */
  fetchInitNew(opt?: any): Promise<any> {
    this.api.currentScreenCode = ScreenCode.regist;
    return this.api.callApisForInitialize(ScreenCode.regist, 'fetchInitNew');
  }

  /**
   * 所属グループの選択値が変更された場合、それに対応したロールを取得する
   * @param screen_code 画面ID
   * @param opt 所属グループID
   */
  fetchRoleIdByBelongingGroupId(screen_code, opt) {
    const search_parameters = [
      {
        resource_path: 'role_id',
        condition_sets: [{ condition: 'group_id', values: [opt.group_id] }],
      },
    ];
    const items = { screen_code, search_parameters };
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchRoleIdByBelongingGroupId',
        this.api
          .post(Apis.postApplicationsViewsResourcesSearch, items)
          .subscribe(res => resolve(this.resource.parse(res.result_data)))
      );
    });
  }

  /**
   * 所属の選択値が変更された場合、それに対応したロールを取得する
   * @param screen_code 画面ID
   * @param opt グループID
   */
  fetchGrantedRoleIdByGroupId(screen_code, opt): Promise<any> {
    const search_parameters = [
      {
        resource_path: 'user.group.granted_role_id',
        condition_sets: [
          {
            condition: 'user.group.belonging_group_id',
            values: [opt.group_id],
          },
        ],
      },
    ];
    const items = { screen_code, search_parameters };
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchGrantedRoleIdByGroupId',
        this.api
          .post(Apis.postApplicationsViewsResourcesSearch, items)
          .subscribe(res => resolve(this.resource.parse(res.result_data)))
      );
    });
  }

  /**
   * ロールの選択値が変更された場合、それに対応した権限を取得する
   * @param screen_code 画面ID
   * @param opt ロールID
   */
  fetchGrantedAuthorityIdsByGrantedRoleId(screen_code, opt): Promise<any> {
    const search_parameters = map(
      [
        'user.group.granted_authority_ids',
        'user.group.granted_authority_checked_items',
      ],
      path => ({
        resource_path: path,
        condition_sets: [
          {
            condition: 'user.group.granted_role_id',
            values: [opt.granted_role_id],
          },
        ],
      })
    );
    const items = { screen_code, search_parameters };
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchGrantedAuthorityIdsByGrantedRoleId',
        this.api
          .post(Apis.postApplicationsViewsResourcesSearch, items)
          .subscribe(res => resolve(this.resource.parse(res.result_data)))
      );
    });
  }

  /**
   * ロールの選択値が変更された場合、それに対応した権限を取得する（一覧画面用）
   * @param screen_code 画面ID
   * @param opt ロールID
   */
  fetchGrantedAuthorityIdsByRoleId(screen_code, opt): Promise<any> {
    const search_parameters = [
      {
        resource_path: 'user.group.granted_authority_ids',
        condition_sets: [
          { condition: 'role_id', values: [opt.granted_role_id] },
        ],
      },
    ];
    const items = { screen_code, search_parameters };
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchGrantedAuthorityIdsByRoleId',
        this.api
          .post(Apis.postApplicationsViewsResourcesSearch, items)
          .subscribe(res => resolve(this.resource.parse(res.result_data)))
      );
    });
  }

  /**
   * 運用ユーザの権限を更新する
   *
   * @param {Object} params APIパラメータ
   * @return {Object} 応答本文
   */
  updateAuthorities(
    userId: string,
    params: AuthoritiesUpdateParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateAuthorities',
        this.api
          .put(
            {
              apiId: Apis.putUsers_userId_Authorities,
              params: [userId],
            },
            params
          )
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 運用ユーザを登録する
   *
   * @param {Object} params APIパラメータ
   * @return {Object} 応答本文
   */
  createUser(userId: string, params: UserParams): Promise<any> {
    const registParams = {
      user: {
        ...params,
      },
    };

    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createUser',
        this.api
          .post(
            {
              apiId: Apis.postUsers_userId_,
              params: [userId],
            },
            registParams
          )
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 運用ユーザ更新の初期化に必要な情報を取得する
   * @param userId ユーザシーケンスID
   * @param params パラメタ
   */
  fetchEditInitData(userId: string, params): Promise<any> {
    this.api.currentScreenCode = ScreenCode.edit;
    return this.api.callApisForInitialize(
      ScreenCode.edit,
      'fetchEditInitData',
      {
        target: () =>
          this.api.get(
            {
              apiId: Apis.getUsers_userId_Detail,
              params: [userId],
            },
            params,
            { cache: false }
          ),
      }
    );
  }

  /**
   * 運用ユーザを更新する
   *
   * @param {Object} params APIパラメータ
   * @return {Object} 応答本文
   */
  updateUser(userId: string, params: UserParams): Promise<any> {
    const updateParams = {
      user: {
        ...omit(params, 'group.label'),
      },
    };
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateUser',
        this.api
          .put(
            {
              apiId: Apis.putUsers_userId_,
              params: [userId],
            },
            updateParams,
            { exclusionKeys: ['user.attribute_create_place'] }
          )
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 運用ユーザユーザ一覧出力画面の初期表示に必要な情報を取得する
   * @param opt パラメータ
   */
  fetchInitExport(opt?: any) {
    this.api.currentScreenCode = ScreenCode.exportList;
    return this.api.callApisForInitialize(
      ScreenCode.exportList,
      'fetchInitExport',
      {
        downloadFields: () =>
          this.api.fetchFields(FunctionCode.exportListDownloadFunction),
      }
    );
  }

  /**
   * 運用ユーザ一覧出力画面のリスト表示に必要な情報を取得する
   * @param params パラメータ
   * @param opt パラメータ
   */
  fetchExportIndexList(params: UserCountParams, opt?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchExportIndexList',
        this.api
          .get(Apis.getGroupsUserCounts, params, { cache: false })
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * 運用ユーザーの詳細情報を取得する
   * @param userId ユーザーシーケンスID
   * @param params パラメータ
   * @param requestHeaderParams ヘッダー情報
   */
  fetchUserDetail(
    userId: string,
    params,
    requestHeaderParams: RequestHeaderParams
  ) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchUserDetail',
        this.api
          .get(
            {
              apiId: Apis.getUsers_userId_Detail,
              params: [userId],
            },
            params,
            { cache: false, request_header: requestHeaderParams }
          )
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * ファイル作成APIを実行
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ
   */
  createFile(params, requestHeaderParams: RequestHeaderParams): Promise<Api> {
    requestHeaderParams['X-Count'] = null;
    requestHeaderParams['X-From'] = null;

    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createFile',
        this.api
          .get(Apis.getUsersFileCreate, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * ユーザ一覧/削除モーダル用指定項目取得
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
}
