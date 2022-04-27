import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import * as _ from 'lodash';
import { NgSelectComponent } from '@ng-select/ng-select';
import { SelectItem } from '../../../types/select-item';
import { Resources, Labels, Resource } from '../../../types/common';
import { ResourceKind } from '../../../constants/resource-type';
import timeout from '../../../util/timeout';
import { UserGroupKinds } from '../../../constants/flm/user-group-kind';
import { UserService } from '../../../services/flm/user/user.service';

@Component({
  selector: '[app-kba-belonging-form-table-select]',
  templateUrl: './kba-belonging-form-table-select.component.html',
})
export class KbaBelongingFormTableSelectComponent implements OnInit {
  @ViewChild(NgSelectComponent, { static: false }) select: NgSelectComponent;
  @Input() kbaName: string;
  @Input() display: string;
  @Input() kbaParams: any;
  @Input() kbaResource: Resources;
  @Input() notEditable: boolean;
  @Input() required: boolean;
  @Input() colspan: number;
  @Input() emitInitialRefresh = true;
  @Input() belongingName: string;
  @Input() belongingNameColor: string;
  @Input() labels: Labels;
  @Input() groupKindResource: Resource;
  @Input() showGroupKindName: boolean;
  @Output() belongingNameChange: EventEmitter<string> = new EventEmitter();
  @Output() belongingNameColorChange: EventEmitter<string> = new EventEmitter();
  @Output() onChange = new EventEmitter();

  items: SelectItem[];
  initialItem: SelectItem;
  viewVal: SelectItem[] = [];
  groupColorMap: { [kind: string]: string };
  hasSearchResult = true;
  _isVisible = false;
  dropdownWidth: number | null = null;
  dropdownActualWidth: number | null = null;

  constructor(public userService: UserService, private ref: ChangeDetectorRef) {
    this.groupColorMap = UserGroupKinds.reduce((temp, { kind, color }) => {
      temp[kind] = color;
      return temp;
    }, {});
  }

  @Input() set isVisible(value) {
    this._isVisible = value;
  }

  get isVisible() {
    return this.items.length > 0 || this._isVisible;
  }

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

    this.belongingName = this.initialItem.belongingAttribute.name;
    this.belongingNameColor = this.initialItem.belongingAttribute.color;

    setTimeout(() => {
      this.belongingNameChange.emit(this.belongingName);
      this.belongingNameColorChange.emit(this.belongingNameColor);
    });
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
    const currentItem = this.items.find(({ id }) => this.kbaParams[this.kbaName] === id);
    this.belongingName = currentItem ? currentItem.belongingAttribute.name : '';
    this.belongingNameColor = currentItem ? currentItem.belongingAttribute.color : '';

    await Promise.resolve();

    this.belongingNameChange.emit(this.belongingName);
    this.belongingNameColorChange.emit(this.belongingNameColor);

    if (emitChangeEvent) {
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
    this.belongingName = value.belongingAttribute.name;
    this.belongingNameColor = value.belongingAttribute.color;
    this.belongingNameChange.emit(this.belongingName);
    this.belongingNameColorChange.emit(this.belongingNameColor);
    this.onChange.emit(value.id);
  }

  handleSearch(searchResult: { term: string; items: SelectItem[] }) {
    this.hasSearchResult = searchResult.items.length > 0;
  }

  /**
   * セレクトボックスのリセット
   */
  reset() {
    if (!this.isVisible) {
      return;
    }

    if (this.initialItem != null) {
      this.viewVal = [this.initialItem];
      this.kbaParams[this.kbaName] = this.initialItem.id;
    }
  }

  /**
   * セレクトボックスをリセットし、変更イベントを発火
   */
  resetAndEmit() {
    this.reset();
    this.onChange.emit(this.kbaParams[this.kbaName]);
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
   * 初期選択項目取得
   *
   * セレクトボックスの初期選択オプションを取得
   *
   * @return 初期選択項目
   */
  private _getInitialItem(): SelectItem {
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
      belongingAttribute: this._getBelongingAttribute(val.kind),
    }));
  }

  /**
   * 所属選択プルダウンの属性を取得する
   * @param resourceKind リソース種別
   */
  private _getBelongingAttribute(resourceKind: string) {
    return {
      name: this._getGroupKindName(resourceKind),
      color: this.groupColorMap[resourceKind],
    };
  }

  /**
   * グループ種別名称を取得する
   * @param resourceKind リソース種別
   */
  private _getGroupKindName(resourceKind: string) {
    if (this.groupKindResource == null) {
      return '';
    }

    const target = this.groupKindResource.values.find(({ value }) => resourceKind === value );
    return target ? target.name : '';
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
