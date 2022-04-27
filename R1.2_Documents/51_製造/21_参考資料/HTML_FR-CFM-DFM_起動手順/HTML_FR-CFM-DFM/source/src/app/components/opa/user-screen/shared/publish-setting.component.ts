import { KbaAbstractRegisterComponent } from '../../../shared/kba-abstract-component/kba-abstract-register-component';
import * as _ from 'lodash';

import {
  Categories,
  SimpleTableHeader as TableHeader,
  CategoryLists,
  PublishSettings,
  PublishSettingList as List,
  PublishSettingListItem as ListItem,
  ExternalAppPublishSettings,
  ListAppKind,
  PublishSettingUpdateParams,
  GroupPublishSetting,
  BaseUpdateParams,
  CommonBaseUpdateParams,
} from '../../../../types/opa/user-screen';
import {
  ExternalAppKind,
  PublishKind,
  PermissionKind,
} from '../../../../constants/opa/user-screen';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { Title } from '@angular/platform-browser';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { PublishSettingConfirmModalComponent } from './confirm-modal.component';
import { FilterReservedWord } from '../../../../constants/condition';
import { ViewChild, TemplateRef, QueryList, ViewChildren } from '@angular/core';
import { KbaFormTableSelectComponent } from '../../../shared/kba-form-table-select/kba-form-table-select.component';
import { KbaScrollToDirective } from '../../../../directives/kba-scroll-to/kba-scroll-to.directive';
import { Resources, Resource } from '../../../../types/common';

export abstract class PublishSettingComponent extends KbaAbstractRegisterComponent {
  @ViewChild('groupIdSelect', { static: false }) groupIdSelect: KbaFormTableSelectComponent;
  @ViewChild('displayCountSelect', { static: false }) displayCountSelect: KbaFormTableSelectComponent;
  @ViewChild('resetModalContent', { static: false }) resetModalContent: TemplateRef<null>;
  @ViewChildren(KbaScrollToDirective) tabList: QueryList<KbaScrollToDirective>;

  abstract commonBaseUpdateParams: CommonBaseUpdateParams;
  abstract typeName: string;
  PermissionKind = PermissionKind;
  ExternalAppKind = ExternalAppKind;
  categories: Categories;
  categoryLists: CategoryLists;
  selectedAppKind: string;
  thList: TableHeader[];
  currentCategoryId: string;
  loading = true;
  isFetching = true;
  thLists: { [category: string]: TableHeader[] } = {};
  baseResource: Resources;
  externalAppKindResource: Resource;
  baseParams: any;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    protected modalService: KbaModalService
  ) {
    super(nav, title, header);
  }

  onGroupIdChange() {
    const firstTab = this.tabList.first;

    if (firstTab) {
      firstTab.onClickScrollTo();
    }

    this.setVisibleExternalAppKind(
      this.externalAppKindResource.values[0].value
    );
  }

  /**
   * 一覧テーブルの公開・非公開ボタン押下時コールバック
   * @param index 行インデックス
   * @param categoryId カテゴリID
   * @param appKind 外部アプリケーション区分
   */
  onChangePublishSetting(
    index: number,
    categoryId: string,
    appKind: string
  ): void {
    const newPublishKind = this._togglePublishKind(
      this.categoryLists[categoryId].originList[index].app_kind[appKind]
        .publish_kind
    );
    this.categoryLists[categoryId].originList[index].app_kind[
      appKind
    ].publish_kind = newPublishKind;
    this.categoryLists[categoryId].visibleList[index].app_kind[
      appKind
    ].publish_kind = newPublishKind;
  }

  /**
   * 入力内容をリセット押下時コールバック
   */
  onClickReset(): void {
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      ok: () => this._reset(),
    });
  }

  /**
   * 設定メニュー変更時コールバック
   * @param menuTabId 設定メニュータブのID
   */
  onTabChange(categoryId: string): void {
    this.currentCategoryId = categoryId;
  }

  /**
   * リソースに指定されたパスが存在するかチェック
   * @param path リソースのパス
   * @override
   */
  exists(path: string) {
    return _.get(this.baseResource, path) != null;
  }

  protected abstract _register(
    params: PublishSettingUpdateParams,
    path: string
  ): void;
  protected abstract _getBaseParams(baseParams);
  protected abstract _parametarize(
    categoryLists: CategoryLists,
    baseParams: BaseUpdateParams
  ): PublishSettingUpdateParams;

  /**
   * 入力内容のリセット処理
   */
  protected _reset(): void {
    this.selectedAppKind = this.externalAppKindResource.values[0].value;
    this.thList = this._createInitThList();
    if (this.groupIdSelect) {
      this.groupIdSelect.resetAndEmit();
    } else {
      this.onGroupIdChange();
    }
  }

  /**
   * 一覧表示する外部アプリケーション変更時コールバック
   * @param appKind 外部アプリケーション区分
   */
  protected setVisibleExternalAppKind(appKind: string): void {
    this.selectedAppKind = appKind;
    this.thLists = _.mapValues(this.thLists, thList => {
      switch (this.selectedAppKind) {
        case FilterReservedWord.selectAll:
          return this._changeThListDisplayable(thList, [0, 1, 2]);
        case ExternalAppKind.dfm:
          return this._changeThListDisplayable(thList, [0, 1]);
        case ExternalAppKind.cfm:
          return this._changeThListDisplayable(thList, [0, 2]);
      }
    });
  }

  /**
   * APIから取得したグループの機能公開設定情報からカテゴリ情報を作成
   * @param groupFunctionPublishSetting グループの機能公開設定情報
   */
  protected _createCategories(
    groupPublishSetting: GroupPublishSetting,
    typeName: string
  ): Categories {
    return _.sortBy(
      groupPublishSetting[`${typeName}_categories`],
      c => +c.order
    );
  }

  /**
   * APIから取得した機能カテゴリ情報から一覧表示情報を作成
   * @param functionCategories 機能カテゴリ情報
   */
  protected _createCategoryLists(
    categories: Categories,
    typeName: string
  ): CategoryLists {
    return _.reduce(
      categories,
      (result, category) => {
        const list = _.chain(category[`${typeName}_publish_settings`])
          .sortBy(s => +s.order)
          .map(setting => {
            setting.app_kind = this._groupingExternalAppPublishSettings(
              setting.external_app_publish_settings
            );
            return _.pick(setting, ['id', 'name', 'app_kind']);
          })
          .value();
        result[category.id] = { originList: list, visibleList: list };
        return result;
      },
      {}
    );
  }

  /**
   * APIから取得した外部アプリケーション公開設定情報から公開・非公開情報を作成
   * @param externalAppPublishSettings 外部アプリケーション公開設定情報
   */
  protected _groupingExternalAppPublishSettings(
    externalAppPublishSettings: ExternalAppPublishSettings
  ): ListAppKind {
    return _.reduce(
      externalAppPublishSettings,
      (result, s) => {
        result[s.external_app_kind] = _.pick(s, [
          'external_app_kind',
          'permission_kind',
          'publish_kind',
        ]);
        return result;
      },
      {}
    );
  }

  /**
   * 列表示状態を変更した一覧ヘッダ情報を返す
   * @param thList 一覧ヘッダ情報
   * @param indexes 表示する列のインデックス
   */
  protected _changeThListDisplayable(
    thList: TableHeader[],
    indexes: number[]
  ): TableHeader[] {
    const newThList = _.cloneDeep(thList);
    newThList.forEach((l, i) => {
      l.displayable = _.includes(indexes, i);
    });
    return newThList;
  }

  /**
   * 初期状態の一覧ヘッダ情報を作成
   */
  protected _createInitThList(): TableHeader[] {
    const listNames = ['name', 'dfm', 'cfm'];

    return _.map(listNames, name => ({
      label: this.labels[name] || _.upperCase(name),
      name: name,
      displayable: true,
      sortable: false,
    }));
  }

  /**
   * 最初の列の列名を変更した一覧ヘッダ情報を返す
   * @param thList 一覧ヘッダ情報
   * @param name 名前
   */
  protected _renameThListLabel(
    thList: TableHeader[],
    name: string
  ): TableHeader[] {
    const newThList = _.cloneDeep(thList);
    newThList[0].label = name;
    return newThList;
  }

  /**
   * APIから取得したグループの機能公開設定情報から更新リクエストパラメータのベース情報を作成
   * @param groupFunctionPublishSetting グループの機能公開設定情報
   */
  protected _createCommonBaseParams(
    groupPublishSetting: GroupPublishSetting
  ): CommonBaseUpdateParams {
    return {
      group_id: groupPublishSetting.group_id,
      update_datetime: groupPublishSetting.update_datetime,
    };
  }

  /**
   * 確認モーダルを開く
   * @param path 確認後に遷移する画面のパス
   */
  protected _openConfirmModal(path: string): void {
    const baseParams = this._getBaseParams(this.commonBaseUpdateParams);
    this.modalService.customOpen(
      PublishSettingConfirmModalComponent,
      {
        resource: {
          ...this.resource,
          ...this.baseResource,
        },
        labels: this.labels,
        params: this.params,
        categoryLists: this.categoryLists,
        categories: this.categories,
        submit: () =>
          this._register(
            this._parametarize(this.categoryLists, baseParams),
            path
          ),
      },
      {
        size: 'lg',
      }
    );
  }

  /**
   * カテゴリーリスト情報から更新リクエストパラメータの公開設定部分を作成
   * @param categoryLists カテゴリーリスト
   */
  protected _createPublishSettings(
    categoryLists: CategoryLists
  ): PublishSettings {
    return _.reduce(
      categoryLists,
      (result, categoryList) => {
        result = _.concat(
          result,
          this._parametarizeList(categoryList.visibleList)
        );
        return result;
      },
      []
    );
  }

  /**
   * 公開区分をトグルして返す
   * @param publishKind 公開区分
   */
  private _togglePublishKind(publishKind: string): string {
    return publishKind === PublishKind.publish
      ? PublishKind.unpublish
      : PublishKind.publish;
  }

  /**
   * リスト情報から更新リクエストパラメータの機能公開設定部分を作成
   * @param list リスト
   */
  private _parametarizeList(list: List) {
    return _.reduce(
      list,
      (result, listItem) => {
        const externalAppPublishSettings = this._parametarizeExternalAppPublishSettings(
          listItem
        );
        if (externalAppPublishSettings.length > 0) {
          result.push({
            id: listItem.id,
            external_app_publish_settings: externalAppPublishSettings,
          });
        }
        return result;
      },
      []
    );
  }

  /**
   * リストの行情報から更新リクエストパラメータの外部アプリ毎の公開設定部分を作成
   * @param listItem リストの行情報
   */
  private _parametarizeExternalAppPublishSettings(listItem: ListItem) {
    return _.chain(listItem.app_kind)
      .filter((v, _k) => v.permission_kind === PermissionKind.enable)
      .map((v, _k) => ({
        publish_kind: v.publish_kind,
        external_app_kind: v.external_app_kind,
      }))
      .value();
  }
}
