import { Injectable } from '@angular/core';
import { AppConst } from 'app/constants/app-const';

/**
 * 配列に関するサービス
 */
@Injectable()
export class ArrayService {

    /**
     * 配列がundefined、null、length=0であれば、trueを返却する。
     */
    public isEmpty(targetArray: any): boolean {
        if (targetArray === undefined
            || targetArray === null
            || targetArray.length === undefined
            || targetArray.length === 0) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 第一引数の配列内に第二引数の値が存在するかチェックを行う。
     */
    public hasValue<T>(targetArray: Array<T>, targetValue: T): boolean {
        if (this.isEmpty(targetArray)) {
            return false;
        } else {
            for (let i = 0; i < targetArray.length; i++) {
                if (targetArray[i] === targetValue) {
                    return true;
                }
            }
            return false;
        }
    }

    /**
     * 配列の長さを返却する。
     */
    public length(targetArray: any): number {
        if (targetArray !== undefined && targetArray !== null) {
            return targetArray.length;
        } else {
            return 0;
        }
    }

    /**
     * 引数の文字列を配列に変換して返却する。
     * @param targetValue
     */
    public convertArray(targetValue: string): Array<string> {
        if (targetValue !== undefined && targetValue !== null) {
            const arrayValue: Array<string> = new Array<string>();
            arrayValue.push(targetValue);
            return arrayValue;
        } else {
            return undefined;
        }
    }

    /**
     * 引数の文字列（カンマ区切り）を配列に変換して返却する。
     * @param targetValue
     */
    public splitComma(targetValue: string): Array<string> {
        if (targetValue !== undefined && targetValue !== null) {
            return targetValue.split(AppConst.COMMA);
        } else {
            return undefined;
        }
    }

    /**
     * 引数の配列とインデックスから値を取得する。
     * @param targetArray 対象の配列
     * @param index 対象のインデックス
     * @param defaultValue 配列から値が取得できない場合の返却値（省略可）
     */
    public getValue<T>(targetArray: Array<T>, index: number
        , defaultValue?: any): T {

        if (!this.isEmpty(targetArray)
            && targetArray[index] !== undefined) {
            return targetArray[index];
        } else if (defaultValue !== undefined) {
            return defaultValue;
        } else {
            return undefined;
        }
    }

    /**
     * 引数の配列の先頭の値を返却する。
     * @param targetArray 対象の配列
     * @param defaultValue 配列から値が取得できない場合の返却値（省略可）
     */
    public getArrayFirstValue<T>(targetArray: Array<T>, defaultValue?: any): T {
        if (!this.isEmpty(targetArray)) {
            return targetArray[0];
        } else if (defaultValue !== undefined) {
            return defaultValue;
        } else {
            return undefined;
        }
    }

    /**
     * 引数の配列（文字列の配列）の先頭の値を返却する。
     * @param targetArray 対象の配列（文字列の配列）
     */
    public getArrayFirstStringValue(targetArray: Array<string>): string {
        return this.getArrayFirstValue(targetArray, '');
    }

}
