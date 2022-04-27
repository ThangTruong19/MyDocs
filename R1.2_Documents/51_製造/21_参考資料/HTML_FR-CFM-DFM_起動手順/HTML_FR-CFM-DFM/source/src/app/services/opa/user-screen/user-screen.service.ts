import { Injectable } from '@angular/core';

import {
  FunctionPublishSettingUpdateParams,
  ItemPublishSettingUpdateParams,
  PublishSettingFetchParams,
} from '../../../types/opa/user-screen';

import { ApiService } from '../../api/api.service';

import { ScreenCode } from '../../../constants/opa/screen-codes/user-screen-management';
import { Apis } from '../../../constants/apis';
import { Resources } from '../../../types/common';
import { ResourceService } from '../../api/resource.service';

@Injectable()
export class UserScreenService {
  constructor(private api: ApiService, private resource: ResourceService) {}

  /**
   * メニュー設定画面の初期表示に必要な情報を取得する
   */
  fetchFunctionPublishSettingInitData() {
    this.api.currentScreenCode = ScreenCode.functionPublishSetting;
    return this.api.callApisForInitialize(
      ScreenCode.functionPublishSetting,
      'fetchFunctionPublishSettingInitData'
    );
  }

  /**
   * メニュー設定画面の初期表示に必要な情報を取得する
   */
  fetchItemPublishSettingInitData() {
    this.api.currentScreenCode = ScreenCode.itemPublishSetting;
    return this.api.callApisForInitialize(
      ScreenCode.itemPublishSetting,
      'fetchItemPublishSettingInitData'
    );
  }

  /**
   * 機能公開設定取得APIリクエスト
   * @param params リクエストパラメータ
   */
  fetchFunctionPublishSetting(params: PublishSettingFetchParams): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchFunctionPublishSetting',
        this.api
          .get(Apis.getApplicationsFunctionPublishSettings, params, {
            cache: false,
          })
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 機能公開設定更新APIリクエスト
   * @param params リクエストパラメータ
   */
  updateFunctionPublishSetting(
    params: FunctionPublishSettingUpdateParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateFunctionPublishSetting',
        this.api
          .put(Apis.putApplicationsFunctionPublishSettings, params)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 項目公開設定取得APIリクエスト
   * @param params リクエストパラメータ
   */
  fetchItemPublishSetting(params: PublishSettingFetchParams): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchItemPublishSetting',
        this.api
          .get(Apis.getApplicationsItemPublishSettings, params, {
            cache: false,
          })
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 項目公開設定更新APIリクエスト
   * @param params リクエストパラメータ
   */
  updateItemPublishSetting(
    params: ItemPublishSettingUpdateParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateItemPublishSetting',
        this.api
          .put(Apis.putApplicationsItemPublishSettings, params)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 用紙サイズのリソースをグループIDを指定し取得する
   * @param groupId グループID
   */
  fetchPaperSizeResouceByGroupId(groupId: string) {
    const screen_code = ScreenCode.itemPublishSetting;
    const search_parameters = [
      {
        resource_path: 'group_item_publish_setting.paper_size_id',
        condition_sets: [
          {
            condition: 'group_item_publish_setting.group_id',
            values: [groupId],
          },
        ],
      },
    ];
    const items = { screen_code, search_parameters };
    return new Promise<Resources>((resolve, reject) => {
      this.api.requestHandler(
        'fetchPaperSizeResouceByGroupId',
        this.api
          .post(Apis.postApplicationsViewsResourcesSearch, items)
          .subscribe(
            res => resolve(this.resource.parse(res.result_data)),
            error => reject(error)
          )
      );
    });
  }
}
