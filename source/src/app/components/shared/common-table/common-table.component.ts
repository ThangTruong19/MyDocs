import {
    OnInit,
    OnChanges,
    SimpleChanges,
    Component,
    Input,
    Output,
    EventEmitter,
    TemplateRef,
    ElementRef,
    ViewChild,
    OnDestroy,
} from '@angular/core';
import * as _ from 'lodash';
import { Labels, TableHeader, TableMergeColumn } from 'app/types/common';
import { CommonTableService } from 'app/services/shared/common-table.service';
import { isArray } from 'lodash';

@Component({
    selector: 'app-common-table',
    templateUrl: './common-table.component.html',
    styleUrls: ['./common-table.component.scss'],
})
export class AppCommonTableComponent implements OnInit, OnChanges, OnDestroy {

    private static readonly MERGE_GROUP_KEY_SEPARATOR = '|@@@|';
    private static readonly MERGE_FIXED_COLUMN_KEY = 'fixedColumn';

    @Input() public customTableRowContent: TemplateRef<any>;
    @Input() public customTableBtnContent: TemplateRef<any>;
    @Input() public customTableThBtnContent: TemplateRef<any>;
    @Input() public customTableThContent: TemplateRef<any>;
    @Input() public customFixedTableThContent: TemplateRef<any>;
    @Input() public customFixedTableRowContent: TemplateRef<any>;
    @Input() public params: any;
    @Input() public pageParams: any;
    @Input() public requestHeaderParams: any;
    @Input() public sortingParams: any;
    @Input() public labels: Labels;
    @Input() public lists: { visibleList: any[]; originList: any[] } = {
        visibleList: [],
        originList: []
    };
    @Input() public thList: TableHeader[];
    @Input() public selectedList: any[];
    @Input() public sortableThList: any[];
    @Input() public emptyListMessage: string;
    @Input() public thClass: string;
    @Input() public tbodyElement: HTMLElement | null;
    @Input() public mergeColumns: TableMergeColumn[] = [];

    // 横スクロール可能テーブルで使用
    @Input() set fixedThList(val: TableHeader[]) {
        if (val) {
            this.isCarTableReady = false;

            setTimeout(() => {
                this._initializeCarTable();
            });
        }

        this._fixedThList = val;
    }
    public get fixedThList(): TableHeader[] {
        return this._fixedThList;
    }
    @Input() public scrollableThList: TableHeader[];
    @Input() public collapsed: boolean;
    @Input() public selectable: boolean;
    @Input() public detailedly: boolean;
    @Input() public updatable: boolean;
    @Input() public deletable: boolean;
    @Input() public set checkAll(val) {
        this._checkAll = val;
        const check: HTMLInputElement = <HTMLInputElement>(
            document.getElementById('check-icon-all')
        );
        if (check) {
            check.checked = val;
        }
    }
    public get checkAll(): boolean {
        return this._checkAll;
    }
    @Input() public isFetching: boolean;
    @Input() public checkedItems: { [key: string]: boolean } = {};
    @Input() public checkIdName: string;
    @Input() public checkIdFunction: (data: any) => string;

    // 車両テーブル用 複数行の（1行に収まらない）表示となる列のnameを指定する
    @Input() public multiLineColumns: string[] = [];
    @Input() public hiddenItemStyles: { [key: string]: string } = {};

    @Input() public checkBoxHiddenFunction: Function;
    @Input() public checkBoxDefaultHiddenFunction: Function;
    @Input() public editIconHiddenFunction: Function;
    @Input() public deleteIconHiddenFunction: Function;

    @Output() public detail: EventEmitter<any> = new EventEmitter<any>();
    @Output() public delete: EventEmitter<any> = new EventEmitter<any>();
    @Output() public edit: EventEmitter<any> = new EventEmitter<any>();
    @Output() public sort: EventEmitter<any> = new EventEmitter<any>();
    @Output() public unlink: EventEmitter<any> = new EventEmitter<any>();
    @Output() public scroll: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('fixedHeader', { static: false }) public fixedHeader: ElementRef;
    @ViewChild('scrollableHeader', { static: false }) public scrollableHeader: ElementRef;
    @ViewChild('fixedBody', { static: false }) public fixedBody: ElementRef;
    @ViewChild('scrollableBody', { static: false }) public scrollableBody: ElementRef;
    @ViewChild('fixedScrollArea', { static: false }) public fixedScrollArea: ElementRef;
    @ViewChild('scrollableScrollArea', { static: false }) public scrollableScrollArea: ElementRef;
    @ViewChild('scrollableTableWrapper', { static: false }) public scrollableTableWrapper: ElementRef;

    public get checkAllDisabled(): boolean {
        return (
            this.lists.originList.filter((item: any) => !this.checkBoxHidden(item))
                .length === 0
        );
    }

    public get tblFunctions(): { [key: string]: Function } {
        return this.commonTableFunctions;
    }

    public isMergeRows = false;
    public isCarTableReady = true;
    public multiLineThList: TableHeader[] = [];
    public emptyListMessageStr: string;
    private observer: MutationObserver;
    private _checkAll: boolean;
    private scrollLsiteners: {
        fixed: {
            timeout: NodeJS.Timeout,
            listener: (e: Event) => void
        } | null,
        scrollable: {
            timeout: NodeJS.Timeout,
            listener: (e: Event) => void
        } | null,
    } = { fixed: null, scrollable: null };
    private scrollTimeout = 100;
    private cellWidthMap: {
        fixed: {
            [cssClass: string]: number,
        };
        scrollable: {
            [cssClass: string]: number,
        };
    } = {
            fixed: {},
            scrollable: {},
        };

    // ngOnInitのタイミングで捕捉できなくなったためsetterで監視を行う
    private _fixedThList: TableHeader[];

    private commonTableFunctions: { [key: string]: Function } = {
        isDisplayDataRow: (tableHeader: TableHeader, listData: any) =>
            this.commonTableService.isDisplayDataRow(tableHeader, listData, this.isMergeRows),
        getDataRowspan: (tableHeader: TableHeader, listData: any) =>
            this.commonTableService.getDataRowspan(tableHeader, listData, this.isMergeRows),
        getColumnStyle: (tableHeader: TableHeader) =>
            this.commonTableService.getColumnStyle(tableHeader),
        isDisplayFixedDataRow: (listData: any) =>
            this.commonTableService.isDisplayFixedDataRow(listData, this.isMergeRows),
        getFixedDataRowspan: (listData: any) =>
            this.commonTableService.getFixedDataRowspan(listData, this.isMergeRows),
        getSimpleTableDataColumnCss: () =>
            this.commonTableService.getSimpleTableDataColumnCss(this.isMergeRows),
        getArrayColumnData: (data: any, pathName: string) =>
            this.commonTableService.getArrayColumnData(data, pathName),
        getLastColumnPathName: (pathName: string) =>
            this.commonTableService.getLastColumnPathName(pathName)
    }

    constructor(
        private elRef: ElementRef,
        private commonTableService: CommonTableService
    ) {
    }

    ngOnInit(): void {
        if (this.emptyListMessage) {
            this.emptyListMessageStr = this.emptyListMessage.toString();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.isFetching && changes.isFetching.currentValue === false) {
            // リストの更新が終わったタイミング（isFetchingをfalseに変更した時）
            if (this.selectable) {
                this.updateCheckAll();
            }

            this.isMergeRows = false;
            if (this.lists.originList.length === 0) {
                this.isCarTableReady = true;
            } else if (this.mergeColumns
                && this.mergeColumns.length > 0
                && this.lists.visibleList
                && this.lists.visibleList.length > 0) {

                this.isMergeRows = true;
                this.setMergeColumns();
            }
        }
    }

    ngOnDestroy(): void {
        if (this.observer != null) {
            this.observer.disconnect();
        }
    }

    /**
     * チェックボックスのキーとなる値を取得する
     * @param item 項目
     */
    public checkId(item: any): string {
        return this.checkIdFunction
            ? this.checkIdFunction(item)
            : _.get(item, this.checkIdName);
    }

    /**
     * 選択チェックボックス変更時コールバック
     * @param value 値
     */
    public onCheckSelect(value: string): void {
        this.checkedItems[value] = !this.checkedItems[value];

        this.updateCheckAll();
    }

    private updateCheckAll(): void {
        const targetItems: any = this.lists.originList.filter(
            (item: any) => !this.checkBoxHidden(item)
        );
        this.checkAll =
            targetItems.length > 0 &&
            targetItems.every((item: any) => this.checkedItems[this.checkId(item)]);

        let repCheckAll: HTMLInputElement | null;
        if (
            (repCheckAll = this.elRef.nativeElement.querySelector(
                '#check-icon-all-rep'
            )) != null
        ) {
            repCheckAll.disabled = this.checkAllDisabled;
        }
    }

    private setMergeColumns(): void {

        this.mergeColumns.forEach((merge: TableMergeColumn) => {

            const mergeRowData: { [key: string]: number } = {};
            let rowIndex = 0;
            const groupByRows: _.Dictionary<any> = _.groupBy(this.lists.visibleList, (data: any) => {

                let groupValue: string = null;
                if (merge.groupByColumns && merge.groupByColumns.length > 0) {
                    merge.groupByColumns.forEach((groupByColumn: string) => {
                        let columnVal: string = data[groupByColumn];
                        if (!columnVal || (isArray(columnVal) && columnVal.length === 0)) {
                            columnVal = 'null';
                        }
                        if (!groupValue) {
                            groupValue = columnVal;
                        } else {
                            groupValue += AppCommonTableComponent.MERGE_GROUP_KEY_SEPARATOR + columnVal;
                        }
                    });
                }

                if (!groupValue) {
                    groupValue = data[merge.targetColumn];
                } else {
                    groupValue += AppCommonTableComponent.MERGE_GROUP_KEY_SEPARATOR + data[merge.targetColumn];
                }
                if (!data.view) {
                    data.view = {};
                }
                if (!data.view.displayNoneRow) {
                    data.view.displayNoneRow = {};
                }
                data.view.displayNoneRow[merge.targetColumn] = true;

                if (merge.isFixedColumnMerge) {
                    data.view.displayNoneRow[AppCommonTableComponent.MERGE_FIXED_COLUMN_KEY] = true;
                }

                if (!(groupValue in mergeRowData)) {
                    mergeRowData[groupValue] = rowIndex;
                }

                rowIndex++;

                return groupValue;
            });

            Object.keys(groupByRows).forEach((groupByKey: string) => {
                const index: number = mergeRowData[groupByKey];
                const dt: any = this.lists.visibleList[index];
                if (!dt.view) {
                    dt.view = {};
                }

                if (!dt.view.rowspan) {
                    dt.view.rowspan = {};
                }
                const groupRow: any = groupByRows[groupByKey];
                dt.view.rowspan[merge.targetColumn] = groupRow.length;

                if (!dt.view.displayNoneRow) {
                    dt.view.displayNoneRow = {};
                }
                dt.view.displayNoneRow[merge.targetColumn] = false;

                if (merge.isFixedColumnMerge) {
                    dt.view.displayNoneRow[AppCommonTableComponent.MERGE_FIXED_COLUMN_KEY] = false;
                    dt.view.rowspan[AppCommonTableComponent.MERGE_FIXED_COLUMN_KEY] = groupRow.length;
                }
            });

        });

    }

    public getSimpleTableRowCss(): string {
        return this.commonTableService.getSimpleTableRowCss(this.isMergeRows);
    }

    /**
     * 親側の onClickDetail() を呼ぶための emit を実行する
     *
     * @param data データのオブジェクト
     */
    public onClickDetail(data: any): void {
        this.detail.emit(data);
    }

    /**
     * 親側の onClickEdit() を呼ぶための emit を実行する
     *
     * @param data データのオブジェクト
     */
    public onClickEdit(data: any): void {
        if (this.editIconHidden(data)) {
            return;
        }

        this.edit.emit(data);
    }

    /**
     * 親側の onClickDelete() を呼ぶための emit を実行する
     *
     * @param data データのオブジェクト
     */
    public onClickDelete(data: any): void {
        if (this.deleteIconHidden(data)) {
            return;
        }

        this.delete.emit(data);
    }

    /**
     * 親側の fetchList() を呼ぶための emit を実行する
     */
    public onClickSortingLabel(sortKey: string): void {
        this.sort.emit(sortKey);
    }

    /**
     * 親側の onClickUnlink() を呼ぶための emit を実行する
     *
     * @param data データのオブジェクト
     */
    public onClickUnlink(data: any): void {
        this.unlink.emit(data);
    }

    /**
     * チェックボックスの一括操作
     */
    public toggleCheckAll(): void {
        _.each(this.lists.originList, item => {
            if (!this.checkBoxHidden(item)) {
                // 全て文字列で格納するため、空文字列を加算
                const val: string = this.checkId(item) + '';
                if (!this.checkAll) {
                    this.checkedItems[val] = true;
                } else {
                    this.checkedItems[val] = false;
                }
            }
        });
        this.updateCheckAll();
    }

    /**
     * 親側の onScrolled() を呼ぶための emit を実行する
     */
    public onScrolled(scrollObj: object): void {
        this.scroll.emit(scrollObj);
    }

    public getData(data: any, key: string): void {
        return _.get(data, key);
    }

    public formatMultiLineData(data: string | string[]): string | string[] {
        if (data == null) {
            return [];
        }

        return !Array.isArray(data) ? data.split('\n') : data;
    }

    /**
     * 親側の checkBoxHidden() を呼び出す
     */
    public checkBoxHidden(data: any): boolean {
        if (this.isFunction(this.checkBoxHiddenFunction)) {
            return this.checkBoxHiddenFunction(data);
        } else {
            return false;
        }
    }

    /**
     * 親側の checkBoxDefaultHidden() を呼び出す
     */
    public checkBoxDefaultHidden(data: any): boolean {
        if (this.isFunction(this.checkBoxDefaultHiddenFunction)) {
            return this.checkBoxDefaultHiddenFunction(data);
        } else {
            return true;
        }
    }

    /**
     * 親側の editIconHidden() を呼び出す
     */
    public editIconHidden(data: any): boolean {
        if (this.isFunction(this.editIconHiddenFunction)) {
            return this.editIconHiddenFunction(data);
        } else {
            return false;
        }
    }

    /**
     * 親側の deleteIconHidden() を呼び出す
     */
    public deleteIconHidden(data: any): boolean {
        if (this.isFunction(this.deleteIconHiddenFunction)) {
            return this.deleteIconHiddenFunction(data);
        } else {
            return false;
        }
    }

    private isFunction(targetFunction: any): boolean {
        if (targetFunction && (typeof targetFunction === 'function')) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * MutationObserverを登録する
     */
    private _registerObserver(): void {
        this.observer = new MutationObserver(mutations => {
            const rowsAdded: boolean = mutations.some(mutation => mutation.addedNodes.length > 0);
            const rowsRemoved: boolean = mutations.some(mutation => mutation.removedNodes.length > 0);

            if (rowsAdded) {
                this._updateCellWidth({ refresh: false, clearCache: rowsRemoved });

                setTimeout(() => {
                    this._updateCellWidth({ refresh: true, clearCache: false });
                });
            }
        });

        this.observer.observe(this.fixedBody.nativeElement, {
            childList: true,
        });
    }

    /**
     * スクロールイベントを登録する
     */
    private _registerScrollListener(): void {
        const map: {
            identifier: string;
            scrollElement: HTMLElement;
            headerElement: HTMLElement;
        }[] = [
                {
                    identifier: 'fixed',
                    scrollElement: this.fixedScrollArea.nativeElement,
                    headerElement: this.fixedHeader.nativeElement,
                },
                {
                    identifier: 'scrollable',
                    scrollElement: this.scrollableScrollArea.nativeElement,
                    headerElement: this.scrollableHeader.nativeElement,
                },
            ];

        map.forEach((item: { identifier: string, scrollElement: HTMLElement, headerElement: HTMLElement }, index: number) => {
            const other: {
                identifier: string;
                scrollElement: HTMLElement;
                headerElement: HTMLElement;
            } = index === 0 ? map[1] : map[0];

            const scrollLsitenersKey: 'fixed' | 'scrollable' = item.identifier === 'fixed' ? 'fixed' : 'scrollable';
            this.scrollLsiteners[scrollLsitenersKey] = this._generateScrollListener(item, other);
            item.scrollElement.addEventListener('scroll', this.scrollLsiteners[scrollLsitenersKey].listener);
        });
    }

    /**
     * スクロールイベントのリスナーを生成する
     * @param self スクロール対象のテーブルの情報
     * @param other 対になるテーブルの情報
     */
    private _generateScrollListener(
        self: { identifier: string, scrollElement: HTMLElement, headerElement: HTMLElement },
        other: { identifier: string, scrollElement: HTMLElement, headerElement: HTMLElement }
    ): {
        listener: (e: Event) => void;
        timeout: any;
    } {
        const listener: (e: Event) => void = (e: Event) => {
            const target: HTMLElement = e.target as HTMLElement;
            const scrollLsitenersKey: 'fixed' | 'scrollable' = other.identifier === 'fixed' ? 'fixed' : 'scrollable';
            const otherListener: { timeout: NodeJS.Timeout, listener: (e: Event) => void } | null
                = this.scrollLsiteners[scrollLsitenersKey];
            other.scrollElement.removeEventListener('scroll', otherListener.listener);
            other.scrollElement.scrollTop = target.scrollTop;
            self.headerElement.scrollLeft = target.scrollLeft;

            clearTimeout(otherListener.timeout);
            otherListener.timeout = setTimeout(() => {
                other.scrollElement.addEventListener('scroll', otherListener.listener);
            }, this.scrollTimeout);
        };

        return {
            listener,
            timeout: null,
        };
    }

    /**
     * 横スクロールテーブルの初期化
     */
    private _initializeCarTable(): void {
        if (this.fixedHeader && this.fixedHeader.nativeElement) {
            this._registerScrollListener();
            this.multiLineThList = this._createMultiLineThList(this.multiLineColumns);
            this._registerObserver();
        }
    }

    /**
     * 複数行の表示となる列のヘッダーを生成する
     * @param columns 複数行の表示となる列
     */
    private _createMultiLineThList(columns: string[]): TableHeader[] {
        return columns.map((name: string) => ({
            name,
            label: name,
            sortable: false,
            displayable: true,
        }));
    }

    /**
     * 横スクロールテーブル用 セルの幅を設定する
     * @param refresh キャッシュを更新する
     */
    private _updateCellWidth({ refresh, clearCache } = { refresh: false, clearCache: false }): void {
        [
            [this.fixedHeader, this.fixedBody, 'fixed'] as const,
            [this.scrollableHeader, this.scrollableBody, 'scrollable'] as const,
        ].forEach(([header, body, identifier]) => {
            const {
                headerCells,
                bodyCells,
            } = this._getCells(header, body);

            headerCells.forEach((headerCell: HTMLElement, index: number) => {
                const headerCellClass: string = this._getHeaderCellClass(headerCell);
                const bodyCell: HTMLElement = bodyCells[index];
                let cellWidth: number = this.cellWidthMap[identifier][headerCellClass];

                if (refresh) {
                    cellWidth = Math.max(headerCell.clientWidth, bodyCell.clientWidth);
                    this.cellWidthMap[identifier][headerCellClass] = cellWidth;
                } else if (clearCache) {
                    this.isCarTableReady = false;
                    this.cellWidthMap[identifier] = {};
                    headerCell.style.minWidth = null;
                    bodyCell.style.minWidth = null;
                }

                if (headerCell && cellWidth) {
                    headerCell.style.minWidth = cellWidth + 'px';
                }

                if (bodyCell && cellWidth) {
                    bodyCell.style.minWidth = cellWidth + 'px';
                }

                if (refresh) {
                    this.isCarTableReady = true;
                }
            });
        });
    }

    /**
     * テーブルのセルの配列を取得する
     * @param header テーブルヘッダーの参照
     * @param body テーブルボディの参照
     */
    private _getCells(header: ElementRef, body: ElementRef
    ): { headerCells: HTMLElement[], bodyCells: HTMLElement[] } {
        const headerCells: HTMLElement[] = _.flatten(Array.from(
            header.nativeElement.querySelectorAll('th')
        ).map((headerCell: any) => {
            if (headerCell.classList.contains('app-cell-space')) {
                return Array.from(headerCell.querySelectorAll('li'));
            }
            return headerCell;
        }));
        const bodyCells: HTMLElement[] = Array.from(
            body.nativeElement.querySelector('tr').querySelectorAll('td')
        );

        return {
            headerCells,
            bodyCells,
        };
    }

    /**
     * テーブルヘッダーのクラスを取得する
     * @param headerCell ヘッダー要素
     */
    private _getHeaderCellClass(headerCell: HTMLElement): string {
        const match: RegExpMatchArray = headerCell.className.match(/th-[^\s]+/);
        if (match == null) {
            return null;
        }

        const [className] = match;

        return className;
    }

}
