import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import {
  FormsModule,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AbstractBaseComponent } from 'app/components/shared/abstract-component/abstract-base.component';
import { SelectedComponent } from 'app/components/shared/selected/selected.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-authority-select-modal',
  templateUrl: './authority-select-modal.component.html',
  styleUrls: ['./authority-select-modal.component.scss'],
})
export class AuthoritySelectModalComponent implements OnInit {
  @Input() authorities: any[];
  @Input() labels: any;
  @Input() selectedAuthorities: any[];
  @Input() resource: any;
  @Output() check: EventEmitter<any> = new EventEmitter<any>();
  @Output() checkedAll: EventEmitter<any> = new EventEmitter<any>();


  checkAll = false;
  evacuateSelectedAuthorities: any[] = [];

  ngOnInit() {
    this.evacuateSelectedAuthorities = _.cloneDeep(this.selectedAuthorities);

    if (this.selectedAuthorities.length === this.authorities.length) {
      this.checkAll = true;
    }
  }

  /**
   * 選択チェックボックス変更時コールバック
   * @param value 値
   */
  onCheckSelect(value: any) {
    this.checkAll =
      this.evacuateSelectedAuthorities.length >= this.authorities.length;
    this.check.emit(value);
  }

  /**
   * チェックボックスの一括操作
   */
  toggleCheckAll() {
    this.evacuateSelectedAuthorities.length = 0;

    if (!this.checkAll) {
      _.each(this.authorities, authority => {
        // 全て文字列で格納するため、空文字列を加算
        this.evacuateSelectedAuthorities.push(authority.value + '');
      });
    }

    this.checkAll = !this.checkAll;
    this.checkedAll.emit(this.evacuateSelectedAuthorities);
  }

  /*
   * リソースから必要な値を抜き出す。
   *
   * @param authority グループ項目
   * @return 抜き出したグループ項目
   */
  // pickData(authority: any): object[] {
  //   return _.pick(authority, ['name', 'value']);
  // }

  /**
   * 既に該当のチェックボックスがチェック済みかどうかを返却する。
   *
   * @param value 値
   * @return true: チェック済み / false: 未チェック
   */
  isChecked(value: any) {
    return _.includes(this.evacuateSelectedAuthorities, value);
  }
}
