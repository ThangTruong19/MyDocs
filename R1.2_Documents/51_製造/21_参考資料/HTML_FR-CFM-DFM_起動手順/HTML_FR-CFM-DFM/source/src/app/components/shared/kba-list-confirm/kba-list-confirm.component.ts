import { Component, Input } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-kba-list-confirm',
  templateUrl: './kba-list-confirm.component.html',
  styleUrls: ['./kba-list-confirm.component.scss'],
})
export class KbaListConfirmComponent {
  // TODO.a_inoue: KbaListConfirmComponentはKbaSimpleListConfirmComponentに移行し削除する
  @Input() desc: string[];
  @Input() val: any[];
  @Input() customContent;
  @Input() warningColumns: number[] | number | string = [];
  @Input() fixedColumns: number[] = [];
  @Input() wideColumns: number[] = [];

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
  isWarningColumn(idx): boolean {
    if (this.warningColumns === 'all') {
      return true;
    } else if (_.isArray(this.warningColumns)) {
      return _.includes(this.warningColumns, idx);
    } else {
      return idx === this.warningColumns;
    }
  }

  /**
   * データの表示タイプを返却する
   * @param val データ
   * @return 表示タイプ
   */
  displayType(val): string {
    if (_.isString(val)) {
      return 'string';
    } else if (_.isArray(val)) {
      return 'array';
    } else if (_.isObject(val)) {
      return val.type;
    }
  }

  /**
   * 表示用ヘッダを返す
   * @param desc ヘッダ情報
   */
  displayLabel(desc): string {
    return desc.label || desc;
  }
}
