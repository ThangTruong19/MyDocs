import { Injectable } from '@angular/core';

/**
 * 文字列に関する処理を行うサービス。
 */
@Injectable()
export class StringService {

    /**
     * 値の存在チェックを行う。
     * ※文字列がundefined・null・空文字の場合、trueを返却する。
     * @param val 対象の文字列
     */
    public isEmpty(val: string): boolean {
        if (val === undefined || val === null || val === '') {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 文字列がundefined・null・空文字の場合、空文字を返却する。
     * その他の場合、引数の値をそのまま返却する。
     * @param val 対象の文字列
     */
    public defaultString(val: string): string {
        if (this.isEmpty(val)) {
            return '';
        } else {
            return val;
        }
    }

}
