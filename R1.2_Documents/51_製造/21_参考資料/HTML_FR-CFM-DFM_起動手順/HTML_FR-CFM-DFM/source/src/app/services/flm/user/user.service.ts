import { Injectable } from '@angular/core';
import { map, omit } from 'lodash';

import { ApiService } from '../../api/api.service';
import { ResourceService } from '../../../services/api/resource.service';
import {
  UserIndexParams,
  UserDeleteParams,
  UserParams,
  AuthoritiesUpdateParams,
} from '../../../types/flm/user';

import { RequestHeaderParams } from '../../../types/request';
import { ScreenCode } from '../../../constants/flm/screen-codes/user-management';
import { FunctionCode } from '../../../constants/flm/function-codes/user-management';
import { Apis } from '../../../constants/apis';

@Injectable()
export class UserService {
  constructor(private api: ApiService, private resource: ResourceService) {}

  /**
   * ユーザ一覧画面の初期表示に必要な情報を取得します。
   * @param opt パラメータ
   */
  fetchInitData(opt?: any) {
    this.api.currentScreenCode = ScreenCode.list;
    return this.api.callApisForInitialize(ScreenCode.list, 'fetchInitData', {
      updatable: Apis.putUsers_userId_,
      deletable: Apis.deleteUsers_userId_,
      fields: () => this.api.fetchFieldsWithWordBreak(FunctionCode.listFunction),
      fieldResources: () =>
        this.api.fetchFieldResources(FunctionCode.listFunction),
      deleteFields: () => this.api.fetchFields(FunctionCode.listDeleteFunction),
    });
  }

  /**
   * ユーザ一覧画面のリスト表示に必要な情報を取得
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
   * ユーザの削除 API
   * @param id ユーザの ID
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
   * ユーザの権限更新 API
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
   * ユーザ登録の初期表示に必要な情報を取得
   *
   * @return {Object} 初期パラメータ群
   */
  fetchInitNew(opt?: any): Promise<any> {
    this.api.currentScreenCode = ScreenCode.regist;
    return this.api.callApisForInitialize(ScreenCode.regist, 'fetchInitNew', {
      fields: () => this.api.fetchFields(FunctionCode.regist),
    });
  }

  /**
   * グループの選択値が変更された場合、それに対応した所属を取得してくる
   * @param screen_code 画面ID
   * @param opt グループID
   */
  fetchBelongingGroupIdByGroupIdIndex(screen_code, opt): Promise<any> {
    const path = 'belonging_group_id';
    const search_parameters = [
      {
        resource_path: path,
        condition_sets: [
          {
            condition: 'configuration_group_id',
            values: [opt.configuration_group_id],
          },
        ],
      },
    ];
    const items = { screen_code, search_parameters };
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchBelongingGroupIdByGroupIdIndex',
        this.api
          .post(Apis.postApplicationsViewsResourcesSearch, items)
          .subscribe(res => resolve(this.resource.parse(res.result_data)))
      );
    });
  }

  /**
   * グループの選択値が変更された場合、それに対応した所属を取得してくる
   * @param screen_code 画面ID
   * @param opt グループID
   */
  fetchBelongingGroupIdByGroupId(screen_code, opt): Promise<any> {
    const path = 'user.group.belonging_group_id';
    const search_parameters = [
      {
        resource_path: path,
        condition_sets: [
          { condition: 'user.group.id', values: [opt.configuration_group_id] },
        ],
      },
    ];
    const items = { screen_code, search_parameters };
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchBelongingGroupIdByGroupId',
        this.api
          .post(Apis.postApplicationsViewsResourcesSearch, items)
          .subscribe(res => resolve(this.resource.parse(res.result_data)))
      );
    });
  }

  /**
   * 所属の選択値が変更された場合、それに対応したロールを取得してくる
   * @param screen_code 画面ID
   * @param opt グループID
   */
  fetchGrantedRoleIdByBelongingGroupId(screen_code, opt): Promise<any> {
    const search_parameters = [
      {
        resource_path: 'user.group.granted_role_id',
        condition_sets: [
          {
            condition: 'user.group.belonging_group_id',
            values: [opt.belonging_group_id],
          },
        ],
      },
    ];
    const items = { screen_code, search_parameters };
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchGrantedRoleIdByBelongingGroupId',
        this.api
          .post(Apis.postApplicationsViewsResourcesSearch, items)
          .subscribe(res => resolve(this.resource.parse(res.result_data)))
      );
    });
  }

  /**
   * ロールの選択値が変更された場合、それに対応した権限を取得してくる
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
   * ユーザの登録 API
   *
   * @param {Object} params APIパラメータ
   * @return {Object} 応答本文
   */
  createUser(userId: string, params: UserParams): Promise<any> {
    const registParams = {
      user: {
        ...params.user,
        group: params.group,
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
   * ユーザの詳細情報を取得する
   * @param userId ユーザーシーケンスID
   * @param params パラメータ
   * @param requestHeaderParams ヘッダー情報
   */
  fetchUserDetail(
    userId: string,
    params,
    requestHeaderParams: RequestHeaderParams
  ): Promise<any> {
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
   * ユーザ変更の初期化に必要な情報を取得する
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
        fields: () => this.api.fetchFields(FunctionCode.edit),
      }
    );
  }

  /**
   * ユーザを更新する
   *
   * @param {Object} params APIパラメータ
   * @return {Object} 応答本文
   */
  updateUser(userId: string, params: UserParams): Promise<any> {
    const updateParams = {
      user: {
        ...params.user,
        group: {
          ...omit(params.group, ['label', 'belonging_group_label']),
        },
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
   * コントラストを考慮しグループ種別のテキストカラーを計算する
   * @param color 背景色
   */
  getGroupKindTextColor(color: string) {
    if (color == null) {
      return 'transprent';
    }

    color = color.startsWith('#') ? color.slice(1) : color;

    const r = parseInt(color.slice(0, 2), 16);
    const g = parseInt(color.slice(2, 4), 16);
    const b = parseInt(color.slice(4, 6), 16);

    // 参考: http://stackoverflow.com/a/3943023/112731
    return (r * 0.299 + g * 0.587 + b * 0.114) > 186
      ? '#000000'
      : '#FFFFFF';
  }
}
