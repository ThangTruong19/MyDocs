import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { chain, includes, cloneDeep, reduce, isEmpty } from 'lodash';
import { KbaModalService } from '../../../services/shared/kba-modal.service';

@Component({
  selector: 'app-kba-group-select',
  templateUrl: './kba-group-select.component.html',
  styleUrls: ['./kba-group-select.component.scss'],
})
export class KbaGroupSelectComponent {
  @ViewChild('groupSelectModalContent', { static: false })
  groupSelectModalContent: TemplateRef<null>;

  @Input() groups: any[];
  @Input() groupItems: any[];
  @Input() labels: any;
  @Input() selectedItemLabelHidden = true;
  @Input() selectAllGroupKind: string;
  @Input() initGroupKind: string;
  @Input() selectedGroup = '';
  @Input() customSelectButtons;
  @Input() customSelectedGroups;
  @Input() set selectedGroupItems(value: any[]) {
    this._selectedGroupItems = value;
    this.selectedGroupItemsChange.emit(value);
  }
  get selectedGroupItems() {
    return this._selectedGroupItems;
  }
  @Input() disabledItems: string[] = [];
  @Input() allowEmpty = false;

  @Output() close: EventEmitter<any> = new EventEmitter<any>();
  @Output() selectedGroupItemsChange: EventEmitter<any> = new EventEmitter<
    any
  >();

  evacuateSelectedGroup = '';
  evacuateSelectedGroupItems: any[] = [];
  _selectedGroupItems = [];

  constructor(private modalService: KbaModalService) {}

  groupItemChecked(value) {
    if (includes(this.evacuateSelectedGroupItems, value)) {
      this.evacuateSelectedGroupItems.splice(
        this.evacuateSelectedGroupItems.indexOf(value),
        1
      );
    } else {
      this.evacuateSelectedGroupItems.push(value);
    }
    this.modalService.enableOk = this.isValid();
  }

  toggleCheckAll(selectedGroupItems) {
    this.evacuateSelectedGroupItems = cloneDeep(selectedGroupItems);
    this.modalService.enableOk = this.isValid();
  }

  selectedGroupName() {
    return this.getItem(this.groups, this.selectedGroup).name;
  }

  /**
   * 選択ボタン押下時のコールバック
   */
  onClickSelect() {
    this.evacuateSelectedGroup = cloneDeep(this.selectedGroup);
    this.evacuateSelectedGroupItems = cloneDeep(this.selectedGroupItems);
    this.modalService.open(
      {
        title: this.labels.select_modal_title,
        labels: this.labels,
        content: this.groupSelectModalContent,
        okBtnLabel: this.labels.reflect_btn,
        enableOk: this.isValid(),
        ok: () => {
          this.selectedGroup = cloneDeep(this.evacuateSelectedGroup);
          this.selectedGroupItems = this.isSelectAllKind(
            this.evacuateSelectedGroup
          )
            ? []
            : this.getGroupItems(this.evacuateSelectedGroupItems).map(
                item => item.value
              );
          this.close.emit({
            group: this.selectedGroup,
            items: this.selectedGroupItems,
          });
        },
      },
      {
        size: 'lg',
      }
    );
  }

  onSelectGroupKind(groupKind) {
    this.evacuateSelectedGroup = groupKind;
    this.modalService.enableOk = this.isValid();
  }

  isSelectAllKind(groupKind): boolean {
    return this.groups != null && groupKind === this.selectAllGroupKind;
  }

  isValid(): boolean {
    return (
      this.isSelectAllKind(this.evacuateSelectedGroup) ||
      this.allowEmpty || !isEmpty(this.evacuateSelectedGroupItems)
    );
  }

  isGroupSelectOk(): boolean {
    return (
      this.isSelectAllKind(this.selectedGroup) ||
      !isEmpty(this.selectedGroupItems)
    );
  }

  /**
   * 選択済みタグの x ボタン押下時の処理
   * @param value 選択済みタグに紐づけられた 値
   */
  onClickRemoveTag(value) {
    this.selectedGroupItems = this.selectedGroupItems.filter(
      item => item !== value
    );
    this.evacuateSelectedGroupItems = cloneDeep(this.selectedGroupItems);
  }

  getItem(items: any[], value: string): any {
    const index = items.findIndex(i => i.value === value);
    const item = items[index];

    return {
      ...item,
      index,
    };
  }

  /**
   * セレクトボックスのリセット
   */
  reset() {
    this.selectedGroup = '';
    this.selectedGroupItems.length = 0;
    this.evacuateSelectedGroup = '';
    this.evacuateSelectedGroupItems.length = 0;
  }

  /**
   * グループ項目の名称取得
   *
   * 値に対応する名前を取得する。
   *
   * @param value 値
   */
  getGroupItems(values: string[]): any[] {
    return chain(values)
      .reduce((array, val) => {
        const { name, value, index } = this.getItem(this.groupItems, val);
        array.push({
          name,
          value,
          index,
        });
        return array;
      }, [])
      .orderBy('index')
      .value();
  }

  /**
   * 選択内容を params 用に整形して返します。
   */
  getSelectedParam(): object {
    const params = { kind_id: this.selectedGroup };
    if (!this.isSelectAllKind(this.selectedGroup)) {
      params['block_ids'] = this.selectedGroupItems;
    }
    return params;
  }
}
