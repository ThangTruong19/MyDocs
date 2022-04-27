import { Component, Input } from '@angular/core';
import * as _ from 'lodash';

@Component({
    selector: 'app-tandem-confirm',
    templateUrl: './tandem-confirm.component.html',
    styleUrls: ['./tandem-confirm.component.scss'],
})
export class TandemConfirmComponent {

    @Input() public desc: any;
    @Input() public val: any;
    @Input() public customContent: any;
    @Input() public valuesAtKey: string;
    @Input() public wideHeader: boolean;

    /**
     * オブジェクトから値を取得する
     * @param data データ
     * @param desc ヘッダ情報
     */
    public getValue(data: object, desc: object): object {
        const obj: any = <any>desc;
        const key: any = obj[this.valuesAtKey] || obj['confirmKey'] || obj['name'];
        if (key instanceof Array) {
            return _.at(obj, key);
        } else {
            return _.head(_.at(obj, key));
        }
    }

}
