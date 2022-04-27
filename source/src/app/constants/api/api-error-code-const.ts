/**
 * APIのリクエストヘッダのkeyを保持するクラス
 */
export class ApiErrorCodeConst {

    /** 共通 */
    public static readonly COMMON: { [key: string]: { code: string } } = {
        ACOM0263E: { code: 'ACOM0263E' } // 本サービスをご利用いただくには利用規約への同意が必要です。
    };

}
