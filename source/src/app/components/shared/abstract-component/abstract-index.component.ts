import {
    OnInit,
    ViewChild,
    ChangeDetectorRef,
    TemplateRef,
    Component,
} from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';
import { TableHeader, ModalValues, Fields } from 'app/types/common';
import { RequestHeaderParams } from 'app/types/request';
import { SearchItem, SearchItems } from 'app/types/search';
import { AbstractBaseComponent } from 'app/components/shared/abstract-component/abstract-base.component';
import { PaginationComponent } from 'app/components/shared/pagination/pagination.component';
import { NavigationService } from 'app/services/shared/navigation.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { ModalService } from 'app/services/shared/modal.service';
import { DisplayCode } from 'app/constants/display-code';

@Component({ template: '' })
export abstract class AbstractIndexComponent extends AbstractBaseComponent
    implements OnInit {

    @ViewChild(PaginationComponent, { static: false })
    public paginationComponent: PaginationComponent;

    @ViewChild('resultModalContent', { static: false })
    public resultModalContent: TemplateRef<null>;

    protected autoLoadCountOpen = (window as any).settings.autoLoadCount.open;
    protected autoLoadCountClose = (window as any).settings.autoLoadCount.close;

    // アコーディオン関連
    public collapsed = false;

    // 要素情報関連
    public selectable = true;
    public detailedly = true;
    public updatable = false;
    public deletable = false;
    public isFetching = false;

    // パラメータ関連
    public params: any = {};
    public searchParams: any;
    public requestHeaderParams: RequestHeaderParams = {};
    public sortingParams: { sort: string; sortLabel: string; } = {
        sort: '',
        sortLabel: ''
    };

    // ページネーション関連
    public count: number;

    public pageParams: {
        pageNo: number;
        dispPageNo: number;
        pageCount: number;
        autoLoadCount: any;
        lastIndexList: any;
    } = {
        pageNo: 1,
        dispPageNo: 1,
        pageCount: 10,
        autoLoadCount: this.autoLoadCountOpen,
        lastIndexList: this.autoLoadCountOpen
    };
    public pageCountEl: { pageCount: { values: string[] } };

    // 結果モーダル関連
    public resultVal: string[] = [];
    public resultDesc: string[] = [];
    public resultCountMessage: string;

    // 詳細・削除モーダル
    public detailModalValues: ModalValues;
    public deleteModalValues: ModalValues;

    public lists: { visibleList: string[]; originList: string[] } = {
        visibleList: [],
        originList: []
    };

    public thList: TableHeader[];
    public sortableThList: string[] = [];
    public fieldResources: Fields;
    protected displayableThList: string[] = [];
    protected displayableFields: string[] = [];

    // 検索欄入力項目保持関連
    protected commaSeparated: string[] = [];
    protected stringParamList: string[] = [];

    constructor(
        protected override navigationService: NavigationService,
        protected override title: Title,
        protected router: Router,
        protected ref: ChangeDetectorRef,
        protected header: CommonHeaderService,
        protected modalService: ModalService = null
    ) {
        super(navigationService, title);
    }

    ngOnInit(): void {
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
                if (this.paginationComponent) {
                    this.paginationComponent.initializePageCount();
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
                if (this.paginationComponent) {
                    this.paginationComponent.initOptions();
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
    public onClickSearch(): void {
        if (this.paginationComponent) {
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
    public onChangeSort(sort_key: string): void {
        if (this.paginationComponent) {
            this._reflectPageParams();
        } else {
            this._reflectAllPageParams();
        }

        this.fetchList(sort_key);
    }

    /**
     * ページネーションの onChange イベントで呼ばれる処理です。
     */
    public onPaginationChange(): void {
        this._reflectPageParams();
        this.fetchList(this.sortingParams['sort']);

        const tbody: Element = document.querySelector('.app-scroll-load');

        if (tbody != null) {
            tbody.scrollTop = 0;
        }
    }

    /**
     * アコーディオンの状態を変更します。
     * @param isCollapsed アコーディオンの開閉状態
     */
    public changePanelState(isCollapsed: boolean): void {
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
    public sortableThLists(thList: TableHeader[]): string[] {
        return _.reduce(
            thList,
            (array: any[], th: TableHeader) => {
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
    public dateFormat(dateTimeString: string): string {
        return (dateTimeString || '').replace(/T/g, ' ').split(' ')[0];
    }

    /**
     * DateTimeの文字列の年月日 および 時分部分を取得します。
     * @param dateTimeString DateTime文字列
     * @return 日時文字列
     */
    public dateTimeFormat(dateTimeString: string): string {
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
    public displayableThLists(thList: TableHeader[]): string[] {
        return _.reduce(
            thList,
            (array: any[], th: TableHeader) => {
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
    protected abstract fetchList(sort_key?: string): Promise<any>;

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
    protected _afterInitFetchList(): void {
    }

    /**
     * キーに対応するラベルを取得して返します。
     * @param labelKeys ラベルのキー配列
     */
    protected _labelMaps(thList: TableHeader[], labelKeys: string[]): string[] {
        return _.chain(labelKeys)
            .map((name: string) => {
                const t: TableHeader = _.find(thList, th => th.name === name);
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
        if (this.paginationComponent) {
            this.paginationComponent.buildOptions();
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
     * @param additionalFields
     */
    protected _reflectXFields(fieldItems: any, additionalFields: any = []) {
        this._setXFields(this._createXFields(fieldItems), additionalFields);
    }

    /**
     * X-Fields用データをリクエストヘッダにセットします。
     * @param xFields 指定項目データ
     * @param additionalFields
     */
    protected _setXFields(xFields: any[], additionalFields: any = []) {
        const fields: any[] = _.concat(xFields, additionalFields);
        this.requestHeaderParams['X-Fields'] = _.join(fields, ',');
    }

    /**
     * 取得した検索条件データを検索欄にセットする
     *
     * @param searchItems 検索条件データ
     */
    protected _setSearchCondition(searchItems: SearchItems): void {
        _.each(searchItems, (item: SearchItem) => {
            const valueStr: string = _.join(item.value, ',');
            _.set(this.params, item.path, valueStr);
        });
    }

    /**
     * 検索欄データから検索条件更新APIのパラメータを作成
     *
     * 検索欄データと検索条件データの対応付けは変換用テーブルを使用する。
     *
     * @param params 検索欄データ
     * @param nestedKeys
     */
    protected _createSearchCondition(params: any, nestedKeys: string[]): SearchItems {
        const result: SearchItems = [];
        _.each(nestedKeys, (key: string) => {
            let value = _.get(params, key);
            if (!_.isEmpty(value)) {
                if (!_.isArray(value)) {
                    value = [value];
                }
                result.push({ path: key, value: value });
            }
        });

        return result.filter(
            (condition: SearchItem) =>
                condition.path !== 'common.service_distributor.organization_codes' &&
                condition.path !== 'common.support_distributor.organization_codes'
        );
    }

    /**
     * 検索欄データの値を配列形式に変換する
     * @param params 検索欄データ
     * @param nestedKeys
     */
    protected _transrateSearchParams(params: any, nestedKeys: string[]) {
        const result = {};
        let value;
        _.each(nestedKeys, (path: string) => {
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
     * @param dataParams パラメータオブジェクト
     * @param nestedKey ネストキー
     * @return ネストキーの配列
     */
    protected _getNestedKeys(dataParams: { [key: string]: any }, nestedKey: any = null): string[] {
        if (_.isArray(dataParams) || !_.isObject(dataParams)) {
            return nestedKey;
        }

        let p: { [key: string]: any } = dataParams;

        return _.flatten(
            _.map(_.keys(p), (key: string) => {
                return this._getNestedKeys(
                    p[key],
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
    protected _formatList(listBody: any[], thList: TableHeader[]): any {
        return listBody.map(data => {
            this._formatListAdditional(data);
            return _.reduce(
                thList,
                (result: any, th: TableHeader) => {
                    if (!th.optional) {
                        result[th.name] = this._listDisplayData(data, th);
                    }
                    return result;
                },
                {}
            );
        });
    }

    protected _listDisplayData(data: any, th: TableHeader): any {
        return _.get(data, th.formatKey);
    }

    /**
     * リストデータ成形の追加処理
     *
     * 各行のデータについて追加処理を行う必要があれば、各コンポーネントでオーバーライドをする
     *
     * @param data 行データ
     */
    protected _formatListAdditional(data: any): void {
    }

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

    protected _afterFetchList(): void {
        const tbody: Element = document.querySelector('.app-table-tbody');

        if (tbody) {
            tbody.scrollTop = 0;
        }
    }

    /**
     * 検索条件パラメータを取得する
     * @param params パラメータ
     */
    protected _getSearchParams(params: any): any {
        return _.clone(params);
    }

    /**
     * レスポンスヘッダーからソートラベルを設定するキーを取得する
     */
    protected _getSortLabelKey(xSort: string): string {
        if (!!this.sortingParams['sort'] || !this.requestHeaderParams['X-Fields']) {
            return this.sortingParams['sort'];
        }

        const sortKeys: string[] = xSort.split(',');
        let fields: string[];
        if (this.displayableFields && this.displayableFields.length > 0) {
            fields = this.displayableFields;
        } else {
            fields = this.requestHeaderParams['X-Fields'].split(',');
        }
        const sortKey: string =
            sortKeys.find((key: string) =>
                fields.includes(key.replace(/^-/, '').replace(/:.*$/, ''))
            ) || '';

        return this.notSortingColumns.includes(
            sortKey.replace(/^-/, '').replace(/:.*$/, '')
        )
            ? ''
            : sortKey;
    }

}
