import * as _ from 'lodash';
import {
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  TemplateRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { TableHeader, ModalValues, Fields } from '../../../types/common';
import { RequestHeaderParams } from '../../../types/request';
import { SearchItems } from '../../../types/search';

import { KbaAbstractBaseComponent } from './kba-abstract-base-compoenent';
import { KbaPaginationComponent } from '../../../components/shared/kba-pagination/kba-pagination.component';

import { KbaNavigationService } from '../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../services/shared/common-header.service';
import { KbaModalService } from '../../../services/shared/kba-modal.service';

import { DisplayCode } from '../../../constants/display-code';

export abstract class KbaAbstractIndexComponent extends KbaAbstractBaseComponent
  implements OnInit {
  @ViewChild(KbaPaginationComponent, { static: false })
  kbaPaginationComponent: KbaPaginationComponent;
  @ViewChild('resultModalContent', { static: false })
  resultModalContent: TemplateRef<null>;

  // アコーディオン関連
  collapsed = false;

  autoLoadCountOpen = (window as any).settings.autoLoadCount.open;
  autoLoadCountClose = (window as any).settings.autoLoadCount.close;

  // パラメータ関連
  params: any = {};
  searchParams: any;
  requestHeaderParams: RequestHeaderParams = {};
  sortingParams = {
    sort: '',
    sortLabel: '',
  };
  lists = {
    visibleList: [],
    originList: [],
  };
  sortableThList: string[] = [];
  displayableThList: string[] = [];
  paramsConvertTable = null;
  thList: TableHeader[];
  displayableFields: string[] = [];
  fieldResources: Fields;

  // 検索欄入力項目保持関連
  commaSeparated = [];
  stringParamList = [];

  // 要素情報関連
  selectable = true;
  detailedly = true;
  updatable = false;
  deletable = false;
  isFetching = false;

  // ページネーション関連
  count;
  pageParams = {
    pageNo: 1,
    dispPageNo: 1,
    pageCount: 10,
    autoLoadCount: this.autoLoadCountOpen,
    lastIndexList: this.autoLoadCountOpen,
  };
  pageCountEl;

  // 結果モーダル関連
  resultVal = [];
  resultDesc = [];
  resultCountMessage: string;

  // 詳細・削除モーダル
  detailModalValues: ModalValues;
  deleteModalValues: ModalValues;

  // 非推奨
  detailDesc: TableHeader[];
  deleteDesc: TableHeader[];

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    protected router: Router,
    protected ref: ChangeDetectorRef,
    protected header: CommonHeaderService,
    protected modalService: KbaModalService = null
  ) {
    super(navigationService, title);
  }

  ngOnInit() {
    this._fetchDataForInitialize()
      .then(async () => {
        await this.header.setHeader(this.labels, this.resource, this.functions);
        // ページネーションが不要な画面では resource.count がないため
        if (this.resource['X-Count']) {
          this.pageCountEl = {
            pageCount: { values: this.resource['X-Count'].values },
          };
        }
        this.safeDetectChanges();
        if (this.kbaPaginationComponent) {
          this.kbaPaginationComponent.initializePageCount();
          this._reflectPageParams();
        } else {
          this._reflectAllPageParams();
        }
        // 表示項目設定に表示される項目を取得
        if (this.fieldResources) {
          this.displayableFields = this.fieldResources
            .filter(field => field.display_code !== DisplayCode.none)
            .map(field => field.path);
        }
      })
      .then(async () => {
        this.isFetching = true;
        this.safeDetectChanges();
        if (this.kbaPaginationComponent) {
          this.kbaPaginationComponent.initOptions();
        }
        this.onLoad();

        await this._beforeInitFetchList();
        this.searchParams = this._getSearchParams(this.params);
        this.fetchList();
        this._afterInitFetchList();
      });
  }

  /**
   * 検索ボタン押下時の処理
   */
  onClickSearch() {
    if (this.kbaPaginationComponent) {
      this.pageParams.pageNo = 1;
      this.pageParams.dispPageNo = 1;
      this._reflectPageParams();
    } else {
      this._reflectAllPageParams();
    }
    this.searchParams = this._getSearchParams(this.params);
  }

  /**
   * ソート変更時の処理
   * @param sort_key ソートキー
   */
  onChangeSort(sort_key: string) {
    if (this.kbaPaginationComponent) {
      this._reflectPageParams();
    } else {
      this._reflectAllPageParams();
    }

    this.fetchList(sort_key);
  }

  /**
   * ページネーションの onChange イベントで呼ばれる処理です。
   */
  onPaginationChange() {
    this._reflectPageParams();
    this.fetchList(this.sortingParams['sort']);

    const tbody = document.querySelector('.kba-scroll-load');

    if (tbody != null) {
      tbody.scrollTop = 0;
    }
  }

  /**
   * アコーディオンの状態を変更します。
   * @param isCollapsed アコーディオンの開閉状態
   */
  changePanelState(isCollapsed: boolean) {
    this.collapsed = isCollapsed;
    // 検索条件アコーディオンの開閉状態により自動ロード件数を変更する
    this.pageParams.autoLoadCount = this.collapsed
      ? this.autoLoadCountClose
      : this.autoLoadCountOpen;
    if (this.lists.visibleList.length < this.pageParams.pageCount) {
      this.fetchList(this.sortingParams['sort']);
    }
  }

  /**
   * ソート項目リストを返却します。
   * @param thList テーブル項目リスト
   * @return ソート項目リスト
   */
  sortableThLists(thList: Object[]): string[] {
    return _.reduce(
      thList,
      (array, th) => {
        if (th.sortable) {
          array.push(th.name);
        }
        return array;
      },
      []
    );
  }

  /**
   * DateTimeの文字列の年月日部分を取得します。
   * @param dateTimeString DateTime文字列
   * @return 日付文字列
   */
  dateFormat(dateTimeString: string): string {
    return (dateTimeString || '').replace(/T/g, ' ').split(' ')[0];
  }

  /**
   * DateTimeの文字列の年月日 および 時分部分を取得します。
   * @param dateTimeString DateTime文字列
   * @return 日時文字列
   */
  dateTimeFormat(dateTimeString: string): string {
    return (dateTimeString || '')
      .replace(/T/g, ' ')
      .split(':', 2)
      .join(':');
  }

  /**
   * 表示可能項目リストを返却します。
   * @param thList テーブル項目リスト
   * @return ソート項目リスト
   */
  displayableThLists(thList: Object[]): string[] {
    return _.reduce(
      thList,
      (array, th) => {
        if (th.displayable) {
          array.push(th.name);
        }
        return array;
      },
      []
    );
  }

  /**
   * テーブル表示のためのデータを取得します。
   */
  abstract fetchList(sort_key?: string): Promise<any>;

  /**
   * 初期表示のためのデータを取得します。
   */
  protected abstract _fetchDataForInitialize(): Promise<any>;

  /**
   * 初期検索前に処理を行います。
   */
  protected async _beforeInitFetchList(): Promise<any> {
    return;
  }

  /**
   * 初期検索後に処理を行います。
   */
   protected _afterInitFetchList() {
  }

  /**
   * キーに対応するラベルを取得して返します。
   * @param labelKeys ラベルのキー配列
   */
  protected _labelMaps(thList: Object[], labelKeys: string[]): string[] {
    return _.chain(labelKeys)
      .map(name => {
        const t = _.find(thList, th => th.name === name);
        if (!_.isUndefined(t) && !t.displayable) {
          return;
        }
        return t ? t.label : this.labels[name];
      })
      .compact()
      .value();
  }

  /**
   * ページネーションの状態を API コールに使用するパラメータに反映します。
   */
  protected _reflectPageParams() {
    this.requestHeaderParams['X-From'] =
      (this.pageParams.pageNo - 1) * this.pageParams.pageCount + 1;
    this.requestHeaderParams['X-Count'] = this.pageParams.pageCount;
  }

  /**
   * 全件取得用のページネーション状態を API コールに仕様するパラメータに反映します。
   *
   * ページネーションが存在しない一覧画面で使用する。
   */
  protected _reflectAllPageParams() {
    this.requestHeaderParams['X-From'] = 1;
    this.requestHeaderParams['X-Count'] = 0;
  }

  /**
   * データ取得後、リストにデータを挿入します。
   * @param resultHeader API のレスポンスヘッダ
   * @param resultData API のレスポンスデータ
   */
  protected _fillLists(resultHeader: any, resultData: any) {
    this.lists.originList = resultData;
    this.count = resultHeader['X-TotalCount'];
    this.sortingParams['sortLabel'] = this._getSortLabelKey(
      resultHeader['X-Sort']
    );
    this.safeDetectChanges();
    if (this.kbaPaginationComponent) {
      this.kbaPaginationComponent.buildOptions();
    }
    // 検索条件アコーディオンが閉じており、表示件数が 20 件以上の場合は自動ロード件数を 20 件に変更する
    this.pageParams.autoLoadCount =
      this.collapsed && this.pageParams.pageCount >= 20
        ? this.autoLoadCountClose
        : this.autoLoadCountOpen;
    this.pageParams.lastIndexList = this.pageParams.autoLoadCount;
    this.lists.visibleList = this.lists.originList.slice(
      0,
      this.pageParams.autoLoadCount
    );
  }

  /**
   * 指定項目情報をAPI コールに使用するパラメータに反映します。
   * @param fieldItems 指定項目データ
   */
  protected _reflectXFields(fieldItems, additionalFields = []) {
    this._setXFields(this._createXFields(fieldItems), additionalFields);
  }

  /**
   * X-Fields用データをリクエストヘッダにセットします。
   * @param fieldItems 指定項目データ
   */
  protected _setXFields(xFields: any[], additionalFields = []) {
    const fields = _.concat(xFields, additionalFields);
    this.requestHeaderParams['X-Fields'] = _.join(fields, ',');
  }

  /**
   * 取得した検索条件データを検索欄にセットする
   *
   * @param searchItems 検索条件データ
   */
  protected _setSearchCondition(searchItems: SearchItems): void {
    _.each(searchItems, item => {
      const valueStr = _.join(item.value, ',');
      _.set(this.params, item.path, valueStr);
    });
  }

  /**
   * 検索欄データから検索条件更新APIのパラメータを作成
   *
   * 検索欄データと検索条件データの対応付けは変換用テーブルを使用する。
   *
   * @param params 検索欄データ
   */
  protected _createSearchCondition(params: any, nestedKeys): SearchItems {
    const result = [];
    _.each(nestedKeys, key => {
      let value = _.get(params, key);
      if (!_.isEmpty(value)) {
        if (!_.isArray(value)) {
          value = [value];
        }
        result.push({ path: key, value: value });
      }
    });

    return result.filter(
      condition =>
        condition.path !== 'common.service_distributor.organization_codes' &&
        condition.path !== 'common.support_distributor.organization_codes'
    );
  }

  /**
   * 検索欄データの値を配列形式に変換する
   * @param 検索欄データ
   */
  protected _transrateSearchParams(params, nestedKeys: string[]) {
    const result = {};
    let value;
    _.each(nestedKeys, path => {
      if ((value = _.get(params, path))) {
        if (_.includes(this.commaSeparated, path)) {
          _.set(result, path, _.split(value, ','));
        } else if (_.includes(this.stringParamList, path)) {
          _.set(result, path, value);
        } else {
          _.set(result, path, [value]);
        }
      }
    });
    return result;
  }

  /**
   * ネストしているパラメータオブジェクトからキーを取得する
   * @param params パラメータオブジェクト
   * @param nestedKey ネストキー
   * @return ネストキーの配列
   */
  protected _getNestedKeys(params: any, nestedKey = null): string[] {
    if (_.isArray(params) || !_.isObject(params)) {
      return nestedKey;
    }
    return _.flatten(
      _.map(_.keys(params), key => {
        return this._getNestedKeys(
          params[key],
          _.join(_.compact([nestedKey, key]), '.')
        );
      })
    );
  }

  /**
   * API から取得したデータをテーブルで表示できる形に成形して返す。
   *
   * ネストしたオブジェクトをデータを指定項目のパス（ネスト関係をドット区切りの文字列で表現したもの）を
   * キーとしたオブジェクトに成形する。
   *
   * @param listBody APIから取得したリストデータ
   * @param thList テーブルヘッダ情報
   */
  protected _formatList(listBody: any[], thList: any[]) {
    return listBody.map(data => {
      this._formatListAdditional(data);
      return _.reduce(
        thList,
        (result, th) => {
          if (!th.optional) {
            result[th.name] = this._listDisplayData(data, th);
          }
          return result;
        },
        {}
      );
    });
  }

  protected _listDisplayData(data, th) {
    return _.get(data, th.formatKey);
  }

  /**
   * リストデータ成形の追加処理
   *
   * 各行のデータについて追加処理を行う必要があれば、各コンポーネントでオーバーライドをする
   *
   * @param data 行データ
   */
  protected _formatListAdditional(data) {}

  /**
   * 一括操作結果モーダルのオープン
   *
   * 一括操作系では、確認モーダルOK後のAPIリクエストに対するレスポンス内容を一括操作結果モーダルで表示する。
   *
   * @param title モーダルのタイトル
   * @param desc 確認モーダルのヘッダ情報
   * @param requestData リクエストデータ詳細（確認モーダルの内容）
   * @param responseData レスポンスデータ
   * @param closeCallback 一括操作結果モーダルを閉じた時のコールバック
   * @param modalOption NgbModalに渡すオプション
   */
  protected _resultModalOpen(
    title: string,
    desc: TableHeader[],
    requestData: any[],
    responseData: any[],
    closeCallback: () => void,
    modalOption = {}
  ) {
    if (!this.resultModalContent) {
      return;
    }

    [
      this.resultDesc,
      this.resultVal,
      this.resultCountMessage,
    ] = this.modalService.createResultModalResource(
      this.labels,
      desc,
      requestData,
      responseData,
      this.resource
    );
    this.modalService.open(
      {
        title: title,
        labels: this.labels,
        content: this.resultModalContent,
        close: closeCallback,
      },
      modalOption
    );
  }

  protected _afterFetchList(arg?: any) {
    const tbody = document.querySelector('.KBA-table-tbody');

    if (tbody) {
      tbody.scrollTop = 0;
    }
  }

  /**
   * 検索条件パラメータを取得する
   * @param params パラメータ
   */
  protected _getSearchParams(params) {
    return _.clone(params);
  }

  /**
   * レスポンスヘッダーからソートラベルを設定するキーを取得する
   */
  protected _getSortLabelKey(xSort: any): string {
    if (!!this.sortingParams['sort'] || !this.requestHeaderParams['X-Fields']) {
      return this.sortingParams['sort'];
    }

    const sortKeys = xSort.split(',');
    let fields;
    if (this.displayableFields && this.displayableFields.length > 0) {
      fields = this.displayableFields;
    } else {
      fields = this.requestHeaderParams['X-Fields'].split(',');
    }
    const sortKey =
      sortKeys.find(key =>
        fields.includes(key.replace(/^-/, '').replace(/:.*$/, ''))
      ) || '';

    return this.notSortingColumns.includes(
      sortKey.replace(/^-/, '').replace(/:.*$/, '')
    )
      ? ''
      : sortKey;
  }
}
