import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import * as _ from 'lodash';
import timeout from '../../../util/timeout';

import { ResourceKind } from '../../../constants/resource-type';
import { SelectItem } from '../../../types/select-item';
import { Resources } from '../../../types/common';

@Component({
  selector: '[app-kba-form-table-select]',
  styleUrls: ['./kba-form-table-select.component.scss'],
  templateUrl: './kba-form-table-select.component.html',
})
export class KbaFormTableSelectComponent implements OnInit {
  @ViewChild(NgSelectComponent, { static: false }) select: NgSelectComponent;
  @Input() kbaName: string;
  @Input() display: string;
  @Input() kbaParams: any = {};
  @Input() notEditable: boolean;
  @Input() required: boolean;
  @Input() colspan: number;
  @Output() onChange = new EventEmitter();
  @Output() open = new EventEmitter();
  @Input() emitInitialRefresh = true;
  @Input() kbaResource: Resources;

  get isVisible() {
    return this.items.length > 0;
  }

  items: SelectItem[];
  initialItem: SelectItem;
  viewVal: SelectItem[] = [];
  hasSearchResult = true;
  dropdownWidth: number | null = null;
  dropdownActualWidth: number | null = null;

  constructor(private ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.refresh(false);

    this.initialItem = this._getInitialItem();

    if (this.initialItem == null) {
      return;
    }

    this.viewVal = [this.initialItem];
    this.kbaParams[this.kbaName] = this.initialItem.id;

    if (this.emitInitialRefresh) {
      this.onChange.emit(this.kbaParams[this.kbaName]);
    }
  }

  /**
   * 表示用のデータを返す
   *
   * @return 表示用データ
   */
  viewData(): string {
    return this.display == null
      ? this.kbaParams[this.kbaName]
      : this.kbaParams[this.display];
  }

  /**
   * 選択項目変更コールバック
   *
   * @param value 選択項目
   */
  onSelectItem(value: SelectItem): void {
    this.viewVal = [value];
    this.onChange.emit(value.id);
  }

  handleSearch(searchResult: { term: string; items: SelectItem[] }) {
    this.hasSearchResult = searchResult.items.length > 0;
  }

  async handleOpen() {
    const scrollBarWidth = 17;
    this.hasSearchResult = true;

    this.ref.detectChanges();
    const panel = this.select.dropdownPanel;
    const {
      width,
      actualWidth,
      position,
    } = this._getDropdownStyles();

    const dropdown = document.querySelector('ng-dropdown-panel') as HTMLElement;

    if (panel.appendTo != null) {
      await timeout();
    }

    const { left: parentLeft, width: parentWidth } = this.select.element.getBoundingClientRect();

    switch (position) {
      case 'right':
        dropdown.style.left = 'auto';
        dropdown.style.right = '0';
        break;

      case 'center':
        if (this.select.appendTo === 'body') {
          // テーブル内のドロップダウン要素の場合
          dropdown.style.left = '50%';
          dropdown.style.transform = 'translateX(-50%)';
        } else {
          // その他の場合
          const margin = Math.max(0, document.body.clientWidth - width) / 2;

          dropdown.style.left = `-${parentLeft - margin}px`;
        }

        break;

      default:
        break;
    }

    if (panel.virtualScroll && (actualWidth + scrollBarWidth) > parentWidth) {
      dropdown.style.width = `${actualWidth + scrollBarWidth}px`;
    }
  }

  /**
   * セレクトボックスのリセット
   */
  reset() {
    if (!this.isVisible) {
      return;
    }

    const item =
      this.initialItem != null && this.items.includes(this.initialItem)
        ? this.initialItem
        : this.items[0];

    if (item != null) {
      this.viewVal = [item];
      this.kbaParams[this.kbaName] = item.id;
      return;
    }

    this.kbaParams[this.kbaName] = this.initialItem.id;
  }

  /**
   * セレクトボックスをリセットし、変更イベントを発火
   */
  resetAndEmit() {
    this.reset();
    this.onChange.emit(this.kbaParams[this.kbaName]);
  }

  /**
   * 項目をリフレッシュする
   */
  async refresh(emitChangeEvent = true) {
    this.items = this._getItems();
    this.dropdownWidth = null;

    if (this.kbaParams == null) {
      await timeout();
    }

    if (
      !this.items.map(item => item.id).includes(this.kbaParams[this.kbaName])
    ) {
      this.kbaParams[this.kbaName] = this.items[0] ? this.items[0].id : (this.kbaParams[this.kbaName] || null);
    }
    this.viewVal = [this.items.find(item => item.id === this.kbaParams[this.kbaName])];

    if (emitChangeEvent) {
      this.onChange.emit(this.kbaParams[this.kbaName]);
    }
  }

  /**
   * 初期選択項目取得
   *
   * セレクトボックスの初期選択オプションを取得
   *
   * @return 初期選択項目
   */
  private _getInitialItem() {
    return (
      this.items.find(item => item.id === this.kbaParams[this.kbaName]) ||
      this.items.find(item => item.isHighlightItem) ||
      this.items[0]
    );
  }

  private _getItems(): SelectItem[] {
    const target = this.kbaResource ? this.kbaResource[this.kbaName] : null;

    if (target == null) {
      return [];
    }

    return target.values.map(val => ({
      id: val.value || val.name,
      name: val.name,
      isHighlightItem: val.kind === ResourceKind.highlight,
    }));
  }

  /**
   * ドロップダウンのスタイルを取得する
   */
  private _getDropdownStyles() {
    const [width, actualWidth] = this._getDropdownWidth();

    return {
      width,
      actualWidth,
      position: this._getDropdownPosition(),
    };
  }

  /**
   * ドロップダウンの幅を取得する
   */
  private _getDropdownWidth() {
    if (this.dropdownWidth != null) {
      return [this.dropdownWidth, this.dropdownActualWidth];
    }

    const nameList = this.items.map(({ name }) => name).join('\n');
    const mesureItem = document.createElement('div');
    mesureItem.style.padding = '8px 10px 8px 16px';
    mesureItem.style.visibility = 'hidden';
    mesureItem.style.position = 'fixed';
    mesureItem.style.whiteSpace = 'pre-line';
    mesureItem.innerHTML = nameList;
    document.body.appendChild(mesureItem);
    const width = mesureItem.clientWidth;
    document.body.removeChild(mesureItem);

    this.dropdownActualWidth = width;
    this.dropdownWidth = Math.max(width, this.select.element.clientWidth);

    return [this.dropdownWidth, this.dropdownActualWidth];
  }

  /**
   * ドロップダウンの位置を取得する
   */
  private _getDropdownPosition() {
    let position = 'left';
    const screenWidth = document.body.clientWidth;
    const { left: parentLeft, right: parentRight } = this.select.element.getBoundingClientRect();

    if (screenWidth - (parentLeft + this._getDropdownWidth()[0]) < 0) {
      position = 'right';

      if ((parentRight - this._getDropdownWidth()[0]) < 0) {
        position = 'center';
      }
    }

    return position;
  }
}
