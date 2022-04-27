import { Injectable } from '@angular/core';

/**
 * booleanに関するサービス
 */
@Injectable()
export class BooleanService {
    private static readonly STRING_VALUE: { [key: string]: string } = { VALID: '1', INVALID: '0' };
    private static readonly BOOLEAN_VALUE: { [key: string]: boolean } = { TRUE: true, FALSE: false };

    public isTrueValue(value: string): boolean {
        if (value === BooleanService.STRING_VALUE.VALID) {
            return BooleanService.BOOLEAN_VALUE.TRUE;
        } else {
            return BooleanService.BOOLEAN_VALUE.FALSE;
        }
    }

    public toValue(bool: boolean): string {
        if (bool === BooleanService.BOOLEAN_VALUE.TRUE) {
            return BooleanService.STRING_VALUE.VALID;
        } else {
            return BooleanService.STRING_VALUE.INVALID;
        }
    }

}
