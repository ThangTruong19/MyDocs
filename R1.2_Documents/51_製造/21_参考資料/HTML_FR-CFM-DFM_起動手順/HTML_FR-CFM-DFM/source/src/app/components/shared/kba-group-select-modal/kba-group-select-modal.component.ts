import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import {
  FormsModule,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: 'app-kba-group-select-modal',
  templateUrl: './kba-group-select-modal.component.html',
  styleUrls: ['./kba-group-select-modal.component.scss'],
})
export class KbaGroupSelectModalComponent implements OnInit {
  @Input() groups: any[];
  @Input() groupItems: any[];
  @Input() initGroupKind: string;
  @Input() selectAllGroupKind: string;
  @Input() labels: any;
  @Input() selectedGroup: string;
  @Input() selectedGroupItems: any[];
  @Input() disabledItems: string[] = [];
  @Output() check: EventEmitter<any> = new EventEmitter<any>();
  @Output() checkedAll: EventEmitter<any> = new EventEmitter<any>();
  @Output() selectedGroupKind: EventEmitter<any> = new EventEmitter<any>();

  checkAll = false;
  evacuateSelectedGroup = '';
  evacuateSelectedGroupItems: any[] = [];

  ngOnInit() {
    this.evacuateSelectedGroup = _.cloneDeep(this.selectedGroup);
    this.evacuateSelectedGroupItems = _.cloneDeep(this.selectedGroupItems);

    if (this.selectedGroupItems.length === this.groupItems.length) {
      this.checkAll = true;
    }

    if (!this.evacuateSelectedGroup) {
      this.evacuateSelectedGroup = this.initGroupKind;
      this.selectedGroupKind.emit(this.evacuateSelectedGroup);
    }
  }

  /**
   * 選択チェックボックス変更時コールバック
   * @param value 値
   */
  onCheckSelect(value) {
    this.checkAll =
      this.evacuateSelectedGroupItems.length >= this.groupItems.length;
    this.check.emit(value);
  }

  /**
   * チェックボックスの一括操作
   */
  toggleCheckAll() {
    const forceCheckedItems = _.intersection(
      this.disabledItems,
      this.evacuateSelectedGroupItems
    );

    this.evacuateSelectedGroupItems = forceCheckedItems;

    if (!this.checkAll) {
      _.each(this.groupItems, groupItem => {
        // 全て文字列で格納するため、空文字列を加算
        this.evacuateSelectedGroupItems.push(groupItem.value + '');
      });
      this.evacuateSelectedGroupItems = _.uniq(this.evacuateSelectedGroupItems);
    }

    this.checkAll = !this.checkAll;
    this.checkedAll.emit(this.evacuateSelectedGroupItems);
  }

  /*
   * リソースから必要な値を抜き出す。
   *
   * @param groupItem グループ項目
   * @return 抜き出したグループ項目
   */
  pickData(groupItem): object[] {
    return _.pick(groupItem, ['name', 'value']);
  }

  /**
   * 既に該当のチェックボックスがチェック済みかどうかを返却する。
   *
   * @param value 値
   * @return true: チェック済み / false: 未チェック
   */
  isChecked(value) {
    return _.includes(this.evacuateSelectedGroupItems, value);
  }

  /**
   * 小分類を選択しない種別かどうかを返却する。
   *
   * @return true: 小分類を選択しない種別 / false: 小分類を選択する種別
   */
  isSelectAllKind() {
    return (
      this.groups != null &&
      this.evacuateSelectedGroup === this.selectAllGroupKind
    );
  }

  /**
   * 親のonSelectGroupKind()を呼ぶために emitを実行する
   *
   * @param value 値
   */
  onSelectGroupKind(value) {
    this.selectedGroupKind.emit(value);
  }

  /**
   * 項目が選択不可であるかを判定する
   * @param value 値
   */
  isDisabled(value) {
    return this.disabledItems.includes(value);
  }
}
