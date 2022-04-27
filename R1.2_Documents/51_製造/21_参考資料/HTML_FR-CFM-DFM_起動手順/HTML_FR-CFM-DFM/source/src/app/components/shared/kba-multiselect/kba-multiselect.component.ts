import { Component, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SelectItem } from '../../../types/select-item';
import { NgSelectComponent } from '@ng-select/ng-select';
import * as _ from 'lodash';
import timeout from '../../../util/timeout';

@Component({
  selector: 'app-kba-multiselect',
  templateUrl: './kba-multiselect.component.html',
})
export class KbaMultiselectComponent {
  @Input() title: string;
  @Input() options: SelectItem[];
  @Input() selectedItems: SelectItem[];
  @Output() selectedItemsChange: EventEmitter<
    SelectItem[]
  > = new EventEmitter();
  @Output() changeItems: EventEmitter<never> = new EventEmitter();
  @ViewChild(NgSelectComponent, {static: false}) select: NgSelectComponent;

  hasSearchResult = true;

  constructor(private ref: ChangeDetectorRef) {}

  handleChangeSelection(items: SelectItem[]) {
    this.selectedItemsChange.emit(items.sort((a, b) => (a.id > b.id ? 1 : -1)));
    this.changeItems.emit();
  }

  handleSearch(searchResult: { term: string; items: SelectItem[] }) {
    this.hasSearchResult = searchResult.items.length > 0;
  }

  async handleOpen() {
    this.hasSearchResult = true;

    this.ref.detectChanges();
    const panel = this.select.dropdownPanel;
    const {
      width,
      position,
    } = this._getDropdownStyles();

    const dropdown = document.querySelector('ng-dropdown-panel') as HTMLElement;

    if (panel.appendTo != null) {
      await timeout();
    }

    const { left: parentLeft, width: partentWidth } = this.select.element.getBoundingClientRect();

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

    if (panel.virtualScroll && (width + 3) > partentWidth) {
      dropdown.style.width = `${width + 3}px`;
    }
  }

  /**
   * ドロップダウンのスタイルを取得する
   */
  private _getDropdownStyles() {
    return {
      width: this._getDropdownWidth(),
      position: this._getDropdownPosition(),
    };
  }

  /**
   * ドロップダウンの幅を取得する
   */
  private _getDropdownWidth() {
    const maxItem = _.maxBy(this.options, (item: SelectItem) => item.name.length);
    const mesureItem = document.createElement('div');
    mesureItem.style.padding = '8px 10px';
    mesureItem.style.visibility = 'hidden';
    mesureItem.style.position = 'fixed';
    mesureItem.innerHTML = maxItem.name;
    document.body.appendChild(mesureItem);
    const width = mesureItem.clientWidth;
    document.body.removeChild(mesureItem);

    return Math.max(width, this.select.element.clientWidth);
  }

  /**
   * ドロップダウンの位置を取得する
   */
  private _getDropdownPosition() {
    let position = 'left';
    const screenWidth = document.body.clientWidth;
    const { left: parentLeft, right: parentRight } = this.select.element.getBoundingClientRect();

    if (screenWidth - (parentLeft + this._getDropdownWidth()) < 0) {
      position = 'right';

      if ((parentRight - this._getDropdownWidth()) < 0) {
        position = 'center';
      }
    }

    return position;
  }
}
