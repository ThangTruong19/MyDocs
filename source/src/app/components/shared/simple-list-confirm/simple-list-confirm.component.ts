import { Component, Input } from '@angular/core';
import * as _ from 'lodash';

@Component({
    selector: 'app-simple-list-confirm',
    templateUrl: './simple-list-confirm.component.html',
    styleUrls: ['./simple-list-confirm.component.scss'],
})
export class SimpleListConfirmComponent {

    @Input() public desc: any[];
    @Input() public val: any[];
    @Input() public identifier = 'name';
    @Input() public warningColumns: 'all' | string[] = [];
    @Input() public fixedColumns: string[] = [];
    @Input() public wideColumns: string[] = [];

    /**
     * 固定列対象のカラムかどうかを返却する
     * @param idx インデックス
     * @return true:対象/false:対象外
     */
    public isfixedColumn(idx: string): boolean {
        return _.includes(this.fixedColumns, idx);
    }

    /**
     * 固定列対象のカラムかどうかを返却する
     * @param idx インデックス
     * @return true:対象/false:対象外
     */
    public isWideColumn(idx: string): boolean {
        return _.includes(this.wideColumns, idx);
    }

    /**
     * Warningのカラムかどうかを返却する
     * @param column インデックス
     * @return true:Warning/false:Warningでない
     */
    public isWarningColumn(column: string): boolean {
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
    public displayType(val: any): string {
        if (_.isNull(val)) {
            return 'null';
        } else if (_.isString(val)) {
            return 'string';
        } else if (_.isArray(val)) {
            return 'array';
        } else if (_.isObject(val)) {
            return (<any>val).type;
        }
        return null;
    }

}
