import { Component, Input } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-kba-tandem-confirm',
  templateUrl: './kba-tandem-confirm.component.html',
  styleUrls: ['./kba-tandem-confirm.component.scss'],
})
export class KbaTandemConfirmComponent {
  @Input() desc: any;
  @Input() val: any;
  @Input() customContent;
  @Input() valuesAtKey: string;
  @Input() wideHeader: boolean;

  /**
   * オブジェクトから値を取得する
   * @param data データ
   * @param desc ヘッダ情報
   */
  getValue(data: object, desc: object) {
    const key = desc[this.valuesAtKey] || desc['confirmKey'] || desc['name'];
    if (key instanceof Array) {
      return _.at(data, key);
    } else {
      return _.head(_.at(data, key));
    }
  }
}
