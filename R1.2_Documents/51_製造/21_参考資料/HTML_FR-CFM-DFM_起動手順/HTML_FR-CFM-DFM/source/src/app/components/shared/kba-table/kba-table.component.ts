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
  ViewContainerRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import * as _ from 'lodash';

import { TableHeader } from '../../../types/common';

@Component({
  selector: 'app-kba-table',
  templateUrl: './kba-table.component.html',
  styleUrls: ['./kba-table.component.scss'],
})
export class KbaTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() customTableRowContent: TemplateRef<any>;
  @Input() customTableBtnContent: TemplateRef<any>;
  @Input() customTableThBtnContent: TemplateRef<any>;
  @Input() customTableThContent: TemplateRef<any>;
  @Input() customFixedTableThContent: TemplateRef<any>;
  @Input() customFixedTableRowContent: TemplateRef<any>;

  @Input() params: any;
  @Input() pageParams: any;
  @Input() requestHeaderParams: any;
  @Input() sortingParams: any;
  @Input() labels: any;
  @Input() lists: any;
  @Input() thList: any[];
  @Input() selectedList: any[];
  @Input() sortableThList: any[];
  @Input() emptyListMessage: string;
  @Input() thClass: string;
  @Input() tbodyElement: HTMLElement | null;
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
  get fixedThList() {
    return this._fixedThList;
  }
  @Input() scrollableThList: TableHeader[];

  @Input() collapsed: boolean;
  @Input() selectable: boolean;
  @Input() detailedly: boolean;
  @Input() updatable: boolean;
  @Input() deletable: boolean;
  @Input() set checkAll(val) {
    this._checkAll = val;
    const check = <HTMLInputElement>(
      document.getElementById('check-icon-all')
    );
    if (check) {
      check.checked = val;
    }
  }
  get checkAll() {
    return this._checkAll;
  }
  @Input() isFetching: boolean;
  @Input() checkedItems: { [key: string]: boolean } = {};
  @Input() checkIdName: string;
  @Input() checkIdFunction: (data: any) => string;

  // 車両テーブル用 複数行の（1行に収まらない）表示となる列のnameを指定する
  @Input() multiLineColumns: string[] = [];
  @Input() hiddenItemStyles: { [key: string]: string } = {};

  @Output() detail: EventEmitter<any> = new EventEmitter<any>();
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();
  @Output() edit: EventEmitter<any> = new EventEmitter<any>();
  @Output() sort: EventEmitter<any> = new EventEmitter<any>();
  @Output() unlink: EventEmitter<any> = new EventEmitter<any>();
  @Output() scroll: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('fixedHeader', { static: false }) fixedHeader: ElementRef;
  @ViewChild('scrollableHeader', { static: false }) scrollableHeader: ElementRef;
  @ViewChild('fixedBody', { static: false }) fixedBody: ElementRef;
  @ViewChild('scrollableBody', { static: false }) scrollableBody: ElementRef;
  @ViewChild('fixedScrollArea', { static: false }) fixedScrollArea: ElementRef;
  @ViewChild('scrollableScrollArea', { static: false }) scrollableScrollArea: ElementRef;
  @ViewChild('scrollableTableWrapper', { static: false }) scrollableTableWrapper: ElementRef;

  get checkAllDisabled() {
    return (
      this.lists.originList.filter(item => !this.checkBoxHidden(item))
        .length === 0
    );
  }

  observer: MutationObserver;
  emptyListMessageStr: string;
  _checkAll: boolean;
  tempScrollTop = 0;
  listIndex = 0;
  scrollLsiteners: {
    fixed: {
      timeout: number | null,
      listener: (e: Event) => void
    } | null,
    scrollable: {
      timeout: number | null,
      listener: (e: Event) => void
    } | null,
  } = { fixed: null, scrollable: null };
  scrollTimeout = 100;
  parent: any;
  multiLineThList: TableHeader[] = [];
  cellWidthMap: {
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
  isCarTableReady = true;

  // ngOnInitのタイミングで捕捉できなくなったためsetterで監視を行う
  _fixedThList: TableHeader[];

  constructor(
    private elRef: ElementRef,
    private viewContainerRef: ViewContainerRef
  ) {
  }

  ngOnInit(): void {
    this.parent = this._getParentComponent();
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

      if (this.lists.originList.length === 0) {
        this.isCarTableReady = true;
      }
    }
  }

  ngOnDestroy() {
    if (this.observer != null) {
      this.observer.disconnect();
    }
  }

  /**
   * チェックボックスのキーとなる値を取得する
   * @param item 項目
   */
  checkId(item) {
    return this.checkIdFunction
      ? this.checkIdFunction(item)
      : _.get(item, this.checkIdName);
  }

  /**
   * 選択チェックボックス変更時コールバック
   * @param value 値
   */
  onCheckSelect(value) {
    this.checkedItems[value] = !this.checkedItems[value];

    this.updateCheckAll();
  }

  updateCheckAll() {
    const targetItems = this.lists.originList.filter(
      item => !this.checkBoxHidden(item)
    );
    this.checkAll =
      targetItems.length > 0 &&
      targetItems.every(item => this.checkedItems[this.checkId(item)]);

    let repCheckAll: HTMLInputElement | null;
    if (
      (repCheckAll = this.elRef.nativeElement.querySelector(
        '#check-icon-all-rep'
      )) != null
    ) {
      repCheckAll.disabled = this.checkAllDisabled;
    }
  }

  /**
   * 親側の onClickDetail() を呼ぶための emit を実行する
   *
   * @param {Object} data データのオブジェクト
   */
  onClickDetail(data: any): void {
    this.detail.emit(data);
  }

  /**
   * 親側の onClickEdit() を呼ぶための emit を実行する
   *
   * @param {Object} data データのオブジェクト
   */
  onClickEdit(data: any): void {
    if (this.editIconHidden(data)) {
      return;
    }

    this.edit.emit(data);
  }

  /**
   * 親側の onClickDelete() を呼ぶための emit を実行する
   *
   * @param {Object} data データのオブジェクト
   */
  onClickDelete(data: any): void {
    if (this.deleteIconHidden(data)) {
      return;
    }

    this.delete.emit(data);
  }

  /**
   * 親側の fetchList() を呼ぶための emit を実行する
   */
  onClickSortingLabel(sort_key: string): void {
    this.sort.emit(sort_key);
  }

  /*
   * 親側の onClickUnlink() を呼ぶための emit を実行する
   *
   * @param {Object} data データのオブジェクト
   */
  onClickUnlink(data: any): void {
    this.unlink.emit(data);
  }

  /**
   * チェックボックスの一括操作
   */
  toggleCheckAll() {
    _.each(this.lists.originList, item => {
      if (!this.checkBoxHidden(item)) {
        // 全て文字列で格納するため、空文字列を加算
        const val = this.checkId(item) + '';
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
  onScrolled(scrollObj: object) {
    this.scroll.emit(scrollObj);
  }

  getData(data, key) {
    return _.get(data, key);
  }

  /**
   * 親側の checkBoxHidden() を呼び出す
   */
  checkBoxHidden(data: any): boolean {
    if (!this.parent || typeof this.parent['checkBoxHidden'] !== 'function') {
      return false;
    }
    return this.parent['checkBoxHidden'](data);
  }

  /**
   * 親側の editIconHidden() を呼び出す
   */
  editIconHidden(data: any): boolean {
    if (!this.parent || typeof this.parent['editIconHidden'] !== 'function') {
      return false;
    }
    return this.parent['editIconHidden'](data);
  }

  /**
   * 親側の deleteIconHidden() を呼び出す
   */
  deleteIconHidden(data: any): boolean {
    if (!this.parent || typeof this.parent['deleteIconHidden'] !== 'function') {
      return false;
    }
    return this.parent['deleteIconHidden'](data);
  }

  formatMultiLineData(data: string | string[]) {
    if (data == null) {
      return [];
    }

    return !Array.isArray(data) ? data.split('\n') : data;
  }

  /**
   * MutationObserverを登録する
   */
  private _registerObserver() {
    this.observer = new MutationObserver(mutations => {
      const rowsAdded = mutations.some(mutation => mutation.addedNodes.length > 0);
      const rowsRemoved = mutations.some(mutation => mutation.removedNodes.length > 0);

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
  private _registerScrollListener() {
    const map = [
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

    map.forEach((item, index) => {
      const other = index === 0 ? map[1] : map[0];

      this.scrollLsiteners[item.identifier] = this._generateScrollListener(item, other);
      item.scrollElement.addEventListener('scroll', this.scrollLsiteners[item.identifier].listener);
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
  ) {
    const listener = (e: Event) => {
      const target = e.target as HTMLElement;
      const otherListener = this.scrollLsiteners[other.identifier];
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
   * 親コンポーネント取得
   * @return 親コンポーネント
   */
  private _getParentComponent() {
    if (this.viewContainerRef.parentInjector['view'].component) {
      return this.viewContainerRef.parentInjector['view'].component;
    } else {
      return null;
    }
  }

  /**
   * 横スクロールテーブルの初期化
   */
  private _initializeCarTable() {
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
    return columns.map(name => ({
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
  private _updateCellWidth({ refresh, clearCache } = { refresh: false, clearCache: false }) {
    [
      [this.fixedHeader, this.fixedBody, 'fixed'] as const,
      [this.scrollableHeader, this.scrollableBody, 'scrollable'] as const,
    ].forEach(([header, body, identifier]) => {
      const {
        headerCells,
        bodyCells,
      } = this._getCells(header, body);

      headerCells.forEach((headerCell, index) => {
        const headerCellClass = this._getHeaderCellClass(headerCell);
        const bodyCell = bodyCells[index];
        let cellWidth = this.cellWidthMap[identifier][headerCellClass];

        if (refresh) {
          cellWidth = Math.max(headerCell.clientWidth, bodyCell.clientWidth);
          this.cellWidthMap[identifier][headerCellClass] = cellWidth;
        } else if (clearCache) {
          this.isCarTableReady = false;
          this.cellWidthMap[identifier] = {};
          headerCell.style.minWidth = null;
          bodyCell.style.minWidth = null;
        }

        if (headerCell && cellWidth) { headerCell.style.minWidth = cellWidth + 'px'; }
        if (bodyCell && cellWidth) { bodyCell.style.minWidth = cellWidth + 'px'; }

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
  private _getCells(header: ElementRef, body: ElementRef) {
    const headerCells: HTMLElement[] = _.flatten(Array.from(
      header.nativeElement.querySelectorAll('th')
    ).map((headerCell: HTMLElement) => {
      if (headerCell.classList.contains('KBA-cell-space')) {
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
  private _getHeaderCellClass(headerCell: HTMLElement) {
    const match = headerCell.className.match(/th-[^\s]+/);
    if (match == null) {
      return;
    }

    const [className] = match;

    return className;
  }
}
