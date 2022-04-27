import * as _ from 'lodash';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-kba-simple-list-confirm',
  templateUrl: './kba-simple-list-confirm.component.html',
  styleUrls: ['./kba-simple-list-confirm.component.scss'],
})
export class KbaSimpleListConfirmComponent {
  @Input() desc: any[];
  @Input() val: any[];
  @Input() identifier = 'name';
  @Input() warningColumns: 'all' | string[] = [];
  @Input() fixedColumns: string[] = [];
  @Input() wideColumns: string[] = [];

  /**
   * 固定列対象のカラムかどうかを返却する
   * @param idx インデックス
   * @return true:対象/false:対象外
   */
  isfixedColumn(idx): boolean {
    return _.includes(this.fixedColumns, idx);
  }

  /**
   * 固定列対象のカラムかどうかを返却する
   * @param idx インデックス
   * @return true:対象/false:対象外
   */
  isWideColumn(idx): boolean {
    return _.includes(this.wideColumns, idx);
  }

  /**
   * Warningのカラムかどうかを返却する
   * @param idx インデックス
   * @return true:Warning/false:Warningでない
   */
  isWarningColumn(column: string): boolean {
    if (this.warningColumns === 'all') {
      return true;
    }

    return _.includes(this.warningColumns, column);
  }

  /**
   * データの表示タイプを返却する
   * @param val データ
   * @return 表示タイプ
   */
  displayType(val): string {
    if (_.isNull(val)) {
      return 'null';
    } else if (_.isString(val)) {
      return 'string';
    } else if (_.isArray(val)) {
      return 'array';
    } else if (_.isObject(val)) {
      return val.type;
    }
  }
}
