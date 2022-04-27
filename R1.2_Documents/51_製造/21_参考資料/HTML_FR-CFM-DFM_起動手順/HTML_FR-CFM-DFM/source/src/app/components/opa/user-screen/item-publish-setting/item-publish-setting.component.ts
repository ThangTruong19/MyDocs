import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import {
  ResourceParams,
  CategoryLists,
  ItemPublishSettingUpdateBaseParams as BaseUpdateParams,
  ItemPublishSettingUpdateParams as UpdateParams,
  CommonBaseUpdateParams,
} from '../../../../types/opa/user-screen';

import { PublishSettingComponent } from '../shared/publish-setting.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { UserScreenService } from '../../../../services/opa/user-screen/user-screen.service';
import { ApiService } from '../../../../services/api/api.service';

@Component({
  selector: 'app-item-publish-setting',
  templateUrl: '../shared/publish-setting.component.html',
  styleUrls: ['../shared/publish-setting.component.scss'],
})
export class ItemPublishSettingComponent extends PublishSettingComponent {
  params: ResourceParams = {
    group_item_publish_setting: {
      display_count: '',
      paper_size_id: '',
    },
  };
  commonBaseUpdateParams: CommonBaseUpdateParams;
  typeName = 'item';
  _super_onGroupIdChange = super.onGroupIdChange;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    modalService: KbaModalService,
    protected router: Router,
    protected alertService: KbaAlertService,
    protected userScreenService: UserScreenService,
    private api: ApiService
  ) {
    super(nav, title, header, modalService);
  }

  /**
   * 設定グループ変更時コールバック
   * @param value グループID
   */
  async onGroupIdChange(value: string = null): Promise<void> {
    const groupId = value || this.api.getGroupId();

    this.isFetching = true;
    if (groupId != null) {
      const {
        group_item_publish_setting: { paper_size_id },
      } = await this.userScreenService.fetchPaperSizeResouceByGroupId(groupId);
      _.set(
        this.resource,
        'group_item_publish_setting.paper_size_id',
        paper_size_id
      );
      _.set(this.baseResource, 'paper_size_id', paper_size_id);
    }

    const res = await this.userScreenService.fetchItemPublishSetting({ group_id: groupId });
    if (res.result_data.group_item_publish_setting.display_count) {
      this.params.group_item_publish_setting.display_count = String(res.result_data.group_item_publish_setting.display_count);
      this.displayCountSelect.refresh();
    } else {
      this.displayCountSelect.reset();
    }
    this.params.group_item_publish_setting.paper_size_id = res.result_data.group_item_publish_setting.paper_size_id;
    this.commonBaseUpdateParams = this._createCommonBaseParams(res.result_data.group_item_publish_setting);
    this.categories = this._createCategories(res.result_data.group_item_publish_setting, this.typeName);
    this.thList = this._renameThListLabel(this.thList, this.categories[0].name);
    this.categories.forEach(
      category =>
        (this.thLists[category.id] = this._renameThListLabel(
          this.thList,
          category.name
        ))
    );
    this.currentCategoryId = this.categories[0].id;
    this.categoryLists = this._createCategoryLists(
      this.categories,
      this.typeName
    );
    this.isFetching = false;
    this._super_onGroupIdChange();
  }

  /**
   * 設定ボタン押下時コールバック
   */
  onClickSubmit(): void {
    this._openConfirmModal('/');
  }

  /**
   * 続けて設定ボタン押下時コールバック
   */
  onClickContinue(): void {
    this._openConfirmModal('user_screen/item_publish_setting');
  }

  protected async _fetchDataForInitialize(): Promise<void> {
    const res = await this.userScreenService.fetchItemPublishSettingInitData();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this.baseResource = this.resource.group_item_publish_setting;
    this.externalAppKindResource = this.baseResource.item_publish_settings.external_app_publish_settings.external_app_kind;

    this.selectedAppKind = this.externalAppKindResource.values[0].value;
    this._setTitle();
    this.thList = this._createInitThList();
    if (!this.baseResource.group_id) {
      this.onGroupIdChange();
    }
    this.loading = false;
  }

  /**
   * 項目公開設定の更新をリクエストする
   * @param params リクエストパラメータ
   * @param path リクエスト後に遷移する画面のパス
   */
  protected _register(params: UpdateParams, path: string): void {
    this.userScreenService.updateItemPublishSetting(params).then(res => {
      this.router.navigate([path]).then(() => {
        if (path === 'user_screen/item_publish_setting') {
          this._reset();
        }
        this.alertService.show(this.labels.finish_message);
      });
    });
  }

  /**
   * 更新APIリクエストパラメータのベースを取得する
   * @param commonBaseParams 共通ベースパラメータ
   */
  protected _getBaseParams(
    commonBaseParams: CommonBaseUpdateParams
  ): BaseUpdateParams {
    return {
      ...commonBaseParams,
      ...this.params.group_item_publish_setting,
    };
  }

  /**
   * カテゴリリストから更新リクエストパラメータを作成
   * @param categoryLists カテゴリリスト
   * @param baseParams ベースパラメータ
   */
  protected _parametarize(
    categoryLists: CategoryLists,
    baseParams: BaseUpdateParams
  ): UpdateParams {
    return {
      group_item_publish_setting: {
        ...baseParams,
        item_publish_settings: this._createPublishSettings(categoryLists),
      },
    };
  }
}
