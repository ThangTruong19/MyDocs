/**
 * エラーコードとそれに対応するメッセージの定数定義。
 */
export class ErrorCodeMessageConst {

    public static readonly CODE: { [key: string]: { code: string; message: string } } = {
        E001: { code: 'APPCD-E001', message: 'Failed to save to local storage. Please contact our support center.' },
        E002: { code: 'APPCD-E002', message: 'The communication error with the system occurred.' },
        E003: { code: 'APPCD-E003', message: 'Failed to analyze implementation result.' },
        E004: { code: 'APPCD-E004', message: 'URI format invalid.' },
        E005: {
            code: 'APPCD-E005', message: ['Application execution failed. Please close the page and access again.',
                'If it does not improve please contact our support center.'].join('')
        },
        E006: { code: 'APPCD-E006', message: null },
        C001: { code: 'APPCD-C001', message: 'Processing can not be continued.' }
    };

}
