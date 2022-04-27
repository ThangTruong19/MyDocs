import { Injectable } from '@angular/core';
import { RequestHeaderParams } from 'app/types/request';
import { ApiService } from '../api/api.service';
import { ResourceService } from '../api/resource.service';
import { Apis } from 'app/constants/apis';
import { ScreenCodeConst } from 'app/constants/api/screen-code-const';
import { FunctionCodeConst } from 'app/constants/api/function-code-const';
import { Api, InitializeApiResult } from 'app/types/common';
import { AuthoritiesUpdateParams, UserIndexParams } from 'app/types/user';

/**
 * ログインユーザ情報関連のサービス
 */
@Injectable()
export class UserService {


    constructor(
        private api: ApiService,
        private resource: ResourceService
    ) {
    }

    /**
      * ユーザ一覧画面のリスト表示に必要な情報を取得
      * @param params パラメータ
      * @param opt パラメータ
      */
    public fetchIndexList(
        params: UserIndexParams,
        requestHeaderParams: RequestHeaderParams,
        opt?: any
    ): Promise<Api> {
        return new Promise((resolve) => {
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
     * ユーザ一覧画面の初期表示に必要な情報を取得します。
     */
    public fetchInitData(): Promise<InitializeApiResult> {
        this.api.currentScreenCode = ScreenCodeConst.AUTHORITY_MGT_LIST_CODE;
        return this.api.callApisForInitialize(ScreenCodeConst.AUTHORITY_MGT_LIST_CODE, 'fetchInitData', {
            fields: () => this.api.fetchFieldsWithWordBreak(FunctionCodeConst.AUTHORITY_MGT_LIST_FUNCTION),
            fieldResources: () =>
                this.api.fetchFieldResources(FunctionCodeConst.AUTHORITY_MGT_LIST_FUNCTION),
        });
    }

    /**
     * 権限一覧の初期表示に必要な情報を取得
     */
    public fetchIndexInitData(): Promise<InitializeApiResult> {
        this.api.currentScreenCode = ScreenCodeConst.AUTHORITY_MGT_LIST_CODE;
        return this.api.callApisForInitialize(
            ScreenCodeConst.AUTHORITY_MGT_LIST_CODE,
            'fetchIndexInitData',
            {
                fields: () =>
                    this.api.fetchFields(
                        FunctionCodeConst.AUTHORITY_MGT_LIST_FUNCTION
                    ),
                fieldResources: () =>
                    this.api.fetchFieldResources(
                        FunctionCodeConst.AUTHORITY_MGT_LIST_FUNCTION
                    ),
                downloadFields: () =>
                    this.api.fetchFields(
                        FunctionCodeConst.AUTHORITY_MGT_LIST_DOWNLOAD_FUNCTION
                    ),
                downloadFieldResources: () =>
                    this.api.fetchFieldResources(
                        FunctionCodeConst.AUTHORITY_MGT_LIST_DOWNLOAD_FUNCTION
                    ),
            }
        );
    }

 /**
   * ユーザの権限更新 API
   *
   * @param {Object} params APIパラメータ
   * @return {Object} 応答本文
   */
//   updateAuthorities(
//     userId: string,
//     params: AuthoritiesUpdateParams
//   ): Promise<any> {
//     return new Promise((resolve, reject) => {
//       this.api.requestHandler(
//         'updateAuthorities',
//         this.api
//           .put(
//             {
//               apiId: Apis.putUsers_userId_Authorities,
//               params: [userId],
//             },
//             params
//           )
//           .subscribe(res => resolve(res))
//       );
//     });
//   }
 /**
   * グループの選択値が変更された場合、それに対応した所属を取得してくる
   * @param screen_code 画面ID
   * @param opt グループID
   */
    fetchBelongingGroupIdByGroupIdIndex(screen_code: string, opt: { configuration_group_id: any; }): Promise<any> {
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
     * ロールの選択値が変更された場合、それに対応した権限を取得する（一覧画面用）
     * @param screen_code 画面ID
     * @param opt ロールID
     */
    public fetchGrantedAuthorityIdsByRoleId(screen_code: string, opt: { granted_role_id: any; }): Promise<any> {
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

}
