import { forkJoin as observableForkJoin, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

import * as _ from 'lodash';

import { RequestHeaderParams } from '../../../types/request';
import { Api, Fields, Resources } from '../../../types/common';
import { GroupParams } from '../../../types/opa/group';

import { Apis } from '../../../constants/apis';
import { ScreenCode } from '../../../constants/opa/screen-codes/group-management';
import { FunctionCode } from '../../../constants/opa/function-codes/group-management';

import { ApiService } from '../../api/api.service';
import { ResourceService } from '../../api/resource.service';
import { PublishGroupKind } from '../../../constants/publish-group-kind';
import { FilterReservedWord } from '../../../constants/condition';

@Injectable()
export class GroupService {
  constructor(private api: ApiService, private resource: ResourceService) {}

  /**
   * グループ登録画面の初期化APIを呼ぶ
   */
  fetchNewInitData() {
    this.api.currentScreenCode = ScreenCode.regist;
    return this.api.callApisForInitialize(
      ScreenCode.regist,
      'fetchNewInitData'
    );
  }

  /**
   * グループ登録画面の初期化APIを呼ぶ
   */
  fetchIndexInitData() {
    this.api.currentScreenCode = ScreenCode.list;
    return this.api.callApisForInitialize(
      ScreenCode.list,
      'fetchIndexInitData',
      {
        updatable: Apis.putGroups_groupId_,
        deletable: Apis.deleteGroups_groupId_,
        fields: () => this.api.fetchFields(FunctionCode.listFunction),
      }
    );
  }

  /**
   * グループ登録画面の初期化APIを呼ぶ
   * @param id グループID
   */
  fetchEditInitData(id: string) {
    this.api.currentScreenCode = ScreenCode.edit;
    return this.api.callApisForInitialize(
      ScreenCode.edit,
      'fetchEditInitData',
      {
        item: () =>
          this.api.get({
            apiId: Apis.getGroups_groupId_Detail,
            params: [id],
          }),
      }
    );
  }

  /**
   * グループ統合画面の初期化APIを呼ぶ
   */
  fetchIntegrateInitData() {
    this.api.currentScreenCode = ScreenCode.integration;
    return this.api.callApisForInitialize(
      ScreenCode.integration,
      'fetchIntegrateInitData',
      {
        destFields: () =>
          this.api.fetchFields(FunctionCode.integrationToFunction),
        srcFields: () =>
          this.api.fetchFields(FunctionCode.integrationFromFunction),
        confirmFields: () =>
          this.api.fetchFields(FunctionCode.integrationConfirmFunction),
      }
    );
  }

  /**
   * グループ公開設定画面の初期化APIを呼ぶ
   */
  fetchPublishInitData() {
    this.api.currentScreenCode = ScreenCode.publishSettingGroup;
    return this.api.callApisForInitialize(
      ScreenCode.publishSettingGroup,
      'fetchPublishInitData',
      {
        fields: () =>
          this.api.fetchFields(FunctionCode.publishSettingGroupFunction),
        downloadFields: () =>
          this.api.fetchFields(
            FunctionCode.publishSettingGroupDownloadFunction
          ),
        registFields: () =>
          this.api.fetchFields(FunctionCode.publishSettingGroupRegistFunction),
        selectFields: () =>
          this.api.fetchFields(FunctionCode.publishSettingGroupSelectFunction),
        confirmFields: () =>
          this.api.fetchFields(
            FunctionCode.publishSettingGroupRegistConfirmFunction
          ),
        downloadFieldResources: () =>
          this.api.fetchFieldResources(
            FunctionCode.publishSettingGroupDownloadFunction
          ),
      }
    );
  }

  /**
   * グループ公開設定画面の初期化APIを呼ぶ
   */
  fetchCustomerPublishInitData() {
    this.api.currentScreenCode = ScreenCode.publishSettingCustomer;
    return this.api.callApisForInitialize(
      ScreenCode.publishSettingCustomer,
      'fetchCustomerPublishInitData',
      {
        fields: () =>
          this.api.fetchFields(FunctionCode.publishSettingCustomerFunction),
        downloadFields: () =>
          this.api.fetchFields(
            FunctionCode.publishSettingCustomerDownloadFunction
          ),
        downloadFieldResources: () =>
          this.api.fetchFieldResources(
            FunctionCode.publishSettingCustomerDownloadFunction
          ),
      }
    );
  }

  /**
   * 一覧画面のリスト取得APIを呼ぶ
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ
   */
  fetchIndexList(
    params,
    requestHeaderParams: RequestHeaderParams
  ): Promise<Api> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchIndexList',
        this.api
          .get(
            Apis.getGroups,
            {
              ...params,
              configuration_group_ids: this._filterBlockParams(
                params.configuration_group_ids
              ),
            },
            { cache: false, request_header: requestHeaderParams }
          )
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * グループ分類に依存するリソースを取得
   * @param screenCode 画面コード
   * @param groupKind グループ分類
   */
  fetchGroupKindBelongingResource(screenCode: string, groupKind: string) {
    const params = [
      {
        condition_sets: [
          { condition: 'group.identification.kind_id', values: [groupKind] },
        ],
      },
    ];

    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchGroupKindBelongingResource',
        this.api
          .fetchResource(screenCode, params)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * グループ登録 API をコール
   * @param params パラメータ
   */
  createGroup(params: GroupParams): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createGroup',
        this.api
          .post(Apis.postGroups, params)
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * グループ詳細 API をコール
   * @param params パラメータ
   */
  fetchGroupDetail(id: string, request_header): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchGroupDetail',
        this.api
          .get(
            {
              apiId: Apis.getGroups_groupId_Detail,
              params: [id],
            },
            {},
            { request_header }
          )
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * グループ登録 API をコール
   * @param id ID
   * @param update_datetime 更新日時
   */
  deleteGroup(id: string, update_datetime: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'deleteGroup',
        this.api
          .delete(
            {
              apiId: Apis.deleteGroups_groupId_,
              params: [id],
            },
            { update_datetime }
          )
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * グループ更新 API をコール
   * @param id ID
   * @param params パラメータ
   */
  updateGroup(id: string, params): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateGroup',
        this.api
          .put(
            {
              apiId: Apis.putGroups_groupId_,
              params: [id],
            },
            params
          )
          .subscribe(res => resolve(res), err => reject(err))
      );
    });
  }

  /**
   * グループ一覧ファイル作成APIを呼ぶ
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ
   */
  createGroupsFile(
    params,
    requestHeaderParams: RequestHeaderParams
  ): Promise<Api> {
    requestHeaderParams['X-Count'] = null;
    requestHeaderParams['X-From'] = null;

    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createGroupsFile',
        this.api
          .get(
            Apis.getGroupsFileCreate,
            {
              ...params,
              configuration_group_ids: this._filterBlockParams(
                params.configuration_group_ids
              ),
            },
            { cache: false, request_header: requestHeaderParams }
          )
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 代表管理者更新 API をコール
   * @param id ID
   * @param params パラメータ
   */
  updateRepresentAdministrator(id: string, params): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateRepresentAdministrator',
        this.api
          .put(
            {
              apiId: Apis.putGroups_groupId_RepresentAdministrator,
              params: [id],
            },
            params
          )
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * グループ規模取得 API をコール
   * @param group_ids グループID の配列
   */
  fetchGroupScale(
    group_ids: string[],
    requestHeaderParams: RequestHeaderParams
  ): Promise<Api> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchGroupScale',
        this.api
          .get(
            Apis.getGroupsScale,
            { group_ids },
            { cache: false, request_header: requestHeaderParams }
          )
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 公開設定グループ一覧取得APIを呼ぶ
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ
   */
  fetchPublishSettingGroups(
    params,
    requestHeaderParams: RequestHeaderParams
  ): Promise<Api> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchPublishSettingGroups',
        this.api
          .get(Apis.getGroupsPublishSettingGroups, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 公開設定グループ一覧ファイル作成APIを呼ぶ
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ
   */
  createPublishSettingGroupsFile(
    params,
    requestHeaderParams: RequestHeaderParams
  ): Promise<Api> {
    requestHeaderParams['X-Count'] = null;
    requestHeaderParams['X-From'] = null;

    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'createPublishSettingGroupsFile',
        this.api
          .get(Apis.getGroupsPublishSettingGroupsFileCreate, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * 公開グループ一覧取得 API
   * @param id グループID
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ
   */
  fetchScopeGroups(
    id: string,
    params,
    requestHeaderParams: RequestHeaderParams
  ): Promise<Api> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchScopeGroups',
        this.api
          .get(
            {
              apiId: Apis.getGroups_groupId_ScopeGroups,
              params: [id],
            },
            params,
            { cache: false, request_header: requestHeaderParams }
          )
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 公開顧客一覧取得 API
   * @param id グループID
   * @param params パラメータ
   */
  fetchScopeCustomers(
    id: string,
    params,
    requestHeaderParams: RequestHeaderParams
  ): Promise<Api> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchScopeCustomers',
        this.api
          .get(
            {
              apiId: Apis.getGroups_groupId_ScopeCustomers,
              params: [id],
            },
            params,
            { cache: false, request_header: requestHeaderParams }
          )
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * グループ公開設定更新 API をコール
   * @param id ID
   * @param params パラメータ
   */
  updateScopeGroups(id: string, params) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateScopeGroups',
        this.api
          .put(
            {
              apiId: Apis.putGroups_groupId_ScopeGroups,
              params: [id],
            },
            params
          )
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 顧客公開設定更新 API をコール
   * @param id ID
   * @param params パラメータ
   */
  updateScopeCustomers(id: string, params) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateScopeCustomers',
        this.api
          .put(
            {
              apiId: Apis.putGroups_groupId_ScopeCustomers,
              params: [id],
            },
            params
          )
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * グループ一括統合 API をコール
   * @param id 統合先グループID
   * @param params パラメータ
   */
  integrateGroups(id: string, params): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'integrateGroups',
        this.api
          .put(
            {
              apiId: Apis.putGroups_groupId_Integration,
              params: [id],
            },
            params
          )
          .subscribe(res => resolve(res), error => reject(error))
      );
    });
  }

  /**
   * リージョンに依存するリソースを取得
   * @param regionId リージョンID
   */
  fetchRegionBelongingResource(regionId) {
    const params = {
      screen_code: ScreenCode.integration,
      search_parameters: [
        {
          resource_path: 'block_id',
          condition_sets: [{ condition: 'region_id', values: [regionId] }],
        },
      ],
    };

    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchGroupKindBelongingResource',
        this.api
          .post(Apis.postApplicationsViewsResourcesSearch, params)
          .subscribe(res => resolve(this.resource.parse(res.result_data)))
      );
    });
  }

  /**
   * ブロックに依存する権限のリソースを取得
   * @param screenCode 画面コード
   * @param blockId ブロックID
   */
  fetchBlockBelongingAuthorityResource(
    screenCode: string,
    blockId: string,
    groupKind: string
  ) {
    const condition_sets = [
      { condition: 'group.configuration_group_id', values: [blockId] },
      { condition: 'group.identification.kind_id', values: [groupKind] },
    ];
    const resourcePaths = [
      'group.administrator_role.authorities.id',
      'group.administrator_role.authorities.default_kind',
      'group.general_role.authorities.id',
      'group.general_role.authorities.default_kind',
    ];

    if (screenCode === ScreenCode.regist) {
      resourcePaths.push(
        'group.administrator_role.authorities.checked_items',
        'group.general_role.authorities.checked_items'
      );
    }

    const params = resourcePaths.map(resource_path => ({
      resource_path,
      condition_sets,
    }));

    return new Promise<Resources>((resolve, reject) => {
      this.api.requestHandler(
        'fetchBlockBelongingAuthorityResource',
        this.api
          .fetchResource(screenCode, params)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 言語を指定し地図ソフトのリソースを取得
   * @param screenCode 画面コード
   * @param langCode 言語
   */
  fetchMapApplicationResource(screenCode, langCode): Promise<Resources> {
    const params = [
      {
        resource_path: 'group.map_application.id',
        condition_sets: [
          { condition: 'group.attribute.nation_code', values: [langCode] },
        ],
      },
    ];

    return new Promise(resolve => {
      this.api.requestHandler(
        'fetchMapApplicationResource',
        this.api
          .fetchResource(screenCode, params)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 配下グループのリソースを再取得する
   * @param screenCode 画面コード
   * @param kindId グループ種別ID
   * @param fetchCheckedItems group.preset_roles.authorities.checked_items を取得するか
   */
  fetchPresetRolesResource(
    screenCode: string,
    kindId: string,
    fetchCheckedItems: boolean
  ): Promise<Resources> {
    const condition_sets = [
      { condition: 'group.preset_roles.group_kind_id', values: [kindId] },
    ];

    const params = [
      {
        resource_path: 'group.preset_roles.authorities.id',
        condition_sets,
      },
      {
        resource_path: 'group.preset_roles.authorities.default_kind',
        condition_sets,
      },
    ];

    if (fetchCheckedItems) {
      params.push({
        resource_path: 'group.preset_roles.authorities.checked_items',
        condition_sets,
      });
    }

    return new Promise(resolve => {
      this.api.requestHandler(
        'fetchPresetRolesResource',
        this.api
          .fetchResource(screenCode, params)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 言語を指定し逆引き地名言語のリソースを取得
   * @param screenCode 画面コード
   * @param langCodes 言語コードの配列
   */
  fetchMapApplicationLangResource(
    screenCode: string,
    langCodes: string[]
  ): Promise<Resources> {
    const params = [
      {
        resource_path: 'group.map_application.lang_code',
        condition_sets: [
          { condition: 'group.lang_codes', values: langCodes },
          {
            condition: 'group.identification.kind_id',
            values: [PublishGroupKind.block],
          },
        ],
      },
    ];

    return new Promise(resolve => {
      this.api.requestHandler(
        'fetchMapApplicationLangResource',
        this.api
          .fetchResource(screenCode, params)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * グループ種別を指定して顧客公開設定画面の指定項目を取得する
   * @param searchParams　検索条件
   */
  fetchPublishCustomerFieldsWithParams(searchParams) {
    return new Promise<Fields[]>((resolve, reject) => {
      this.api.requestHandler(
        'fetchPublishCustomerFieldsWithParams',
        observableForkJoin(
          this.api.fetchFields(
            FunctionCode.publishSettingCustomerRegistFunction,
            null,
            searchParams
          ),
          this.api.fetchFields(
            FunctionCode.publishSettingCustomerSelectFunction,
            null,
            searchParams
          ),
          this.api.fetchFields(
            FunctionCode.publishSettingCustomerRegistConfirmFunction,
            null,
            searchParams
          )
        ).subscribe(res => resolve(res))
      );
    });
  }

  /**
   * ブロックIDを指定し代理店のリソースを取得する
   * @param blockId ブロックID
   */
  fetchDistributorByBlockId(blockId: string) {
    const searchParameters = [
      {
        resource_path: 'distributor_id',
        condition_sets: [{ condition: 'block_id', values: [blockId] }],
      },
    ];

    return new Promise<Resources>((resolve, reject) => {
      this.api.requestHandler(
        'fetchDistributorByBlockId',
        this.api
          .fetchResource(ScreenCode.publishSettingCustomer, searchParameters)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * グループ一覧/削除モーダル用指定項目取得
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
   * グループ一覧/ダウンロード用指定項目取得
   */
  fetchIndexDownloadFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchIndexDownloadFields',
        this.api
          .fetchFields(FunctionCode.listDownloadFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * グループ一覧/指定項目リソース取得
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

  /**
   * グループ一覧/ダウンロード用指定項目リソース取得
   */
  fetchIndexDownloadFieldResources() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchIndexDownloadFieldResources',
        this.api
          .fetchFieldResources(FunctionCode.listDownloadFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * グループ一覧・ファイル作成のブロックのパラメータをフォーマットする
   * @param blockIds ブロックID
   */
  private _filterBlockParams(blockIds: [string] | null) {
    if (_.isArray(blockIds) && blockIds.length > 0) {
      const [configurationGroupId] = blockIds;

      return configurationGroupId === FilterReservedWord.selectAll
        ? null
        : [configurationGroupId];
    }

    return null;
  }
}
