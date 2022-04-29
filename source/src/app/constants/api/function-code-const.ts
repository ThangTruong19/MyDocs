/**
 * 機能コードの定数を保持するクラス
 *
 * 指定項目リソース取得API [API_ID：KOM-00600131]に引き渡す「function_code」の値。
 */
export class FunctionCodeConst {

    /**  */
    public static readonly USER_MENU_FUNCTION = 'cdsm_user_menu';
    public static readonly ENV_SETTING_MENU_FUNCTION = 'cdsm_env_setting_menu';
    public static readonly HOME_LINK_FUNCTION = 'cdsm_back_to_home_link';
    public static readonly SIGN_OUT_FUNCTION = 'cdsm_signout_link';
    public static readonly START_PAGE_FUNCTION = 'cdsm_start_page_function';
    public static readonly HISTORY_MGT_LIST_FUNCTION = 'cdsm_history_mgt_list_function';
    public static readonly HISTORY_MGT_LIST_DOWNLOAD_FUNCTION = 'cdsm_history_mgt_list_download_function';
    public static readonly AUTHORITY_MGT_LIST_FUNCTION = 'cdsm_authority_mgt_list_function';
    public static readonly AUTHORITY_MGT_LIST_DOWNLOAD_FUNCTION = 'cdsm_authority_mgt_list_download_function';
    public static readonly CUSTOMIZE_REQUEST_STATUS_LIST_FUNCTION = 'cdsm_customize_request_status_list_function';
    public static readonly CAR_LIST_FUNCTION = 'cdsm_car_mgt_list_function';
    public static readonly CAR_MGT_DETAIL_FUNCTION = 'cdsm_car_mgt_detail_function';

    /** 想定通信量確認 */
    public static CS_EXPECTED_TRAFFIC_CONFIRM_LISTFUNCTION = 'flm_car_mgt_list_function';
    public static CS_EXPECTED_TRAFFIC_CONFIRM_LISTDOWNLOADFUNCTION = 'flm_car_mgt_list_download_function';

    /** 送信要求（期間単位）タブ */
    public static CDSM_CUSTOMIZE_DATA_REQUEST_PERIOD_TAB = 'cdsm_customize_data_request_period_tab';

    /** 送信番号一覧要求タブ */
    public static CDSM_CUSTOMIZE_DATA_NUMBER_LIST_REQUEST_TAB = 'cdsm_customize_data_number_list_request_tab';

}
