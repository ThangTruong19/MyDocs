/**
 * 画面コード設定
 *
 * リソース取得API [API_ID：KOM-00600150]、ラベル取得API [API_ID：KOM-00600101]、
 * アプリケーション機能取得API[KOM-00600050]に引き渡す
 * 「screen_code」（画面コード）の値と、それに関連する設定を紐づける設定
 */
export class ScreenCodeConst {

    // 画面コードの定義
    public static readonly CDSM_COMMON_CODE = 'cdsm_common';
    public static readonly MENU_CODE = 'cdsm_mgt_menu';
    public static readonly HISTORY_MGT_LIST_CODE = 'cdsm_history_mgt_list';
    public static readonly AUTHORITY_MGT_LIST_CODE = 'cdsm_authority_mgt_list';
    public static readonly CUSTOMIZE_REQUEST_STATUS_LIST_CODE = 'cdsm_customize_request_status_list';
    public static readonly CUSTOMIZE_SETTING_UPLOAD_CODE = 'cdsm_customize_setting_upload_list';
    public static readonly CAR_MGT_LIST_CODE = 'cdsm_car_mgt_list';
    public static readonly CAR_MGT_DETAIL = 'cdsm_car_mgt_detail';

    public static readonly APP_HOME_URL = '/';

    // 想定通信量確認
    public static readonly CS_EXPECTED_TRAFFIC_CONFIRM_LIST = 'flm_car_mgt_list';

    public static readonly CDSM_CUSTOMIZE_DATA_REQUEST_DETAIL = 'cdsm_customize_data_request_detail';
}
