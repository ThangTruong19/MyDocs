import { Injectable } from '@angular/core';

/**
 * 数値型関連のサービス。
 */
@Injectable()
export class NumericService {

    /**
     * コンストラクタ
     */
    constructor(
    ) { }

    /**
     * 文字列を数値に変換する。
     */
    public parseInt(value: string): number {
        return parseInt(value, 10) || 0;
    }

}
