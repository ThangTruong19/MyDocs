/**
 * 指定項目取得API [API_ID：KOM-00600121]に関する定数。
 */
export class FieldsConst {

    // 画面表示有無
    public static readonly DISPLAY_CODE: { HIDDEN: string; DISPLAY: string; DISPLAY_AND_DISABLED: string }
        = {
            HIDDEN: '0', // 非表示
            DISPLAY: '1', // 表示
            DISPLAY_AND_DISABLED: '2' // 表示かつ非活性
        };

}
