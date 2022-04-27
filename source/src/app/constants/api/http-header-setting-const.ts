import { HttpHeaderConst } from 'app/constants/api/http-header-const';

/**
 * APIのリクエストヘッダのkeyを保持するクラス（画面側のみで使用するパラメータ含む）
 */
export class HttpHeaderSettingConst extends HttpHeaderConst {

    /**
     * HTTP Headerの「X-Count」を利用して「X-From」の値を算出するための内部処理用の疑似パラメータ名
     * このパラメータはAPIへは送信はされない。
     */
    public static readonly XX_PAGE_NUMBER = 'XX-PageNumber';

}
