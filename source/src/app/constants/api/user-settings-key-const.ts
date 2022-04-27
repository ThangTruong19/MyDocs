/**
 * ユーザ設定の列挙体
 *
 * ユーザ設定取得API [API_ID：KOM-00200031]、
 * ユーザ設定更新API [API_ID：KOM-00200032]
 * で使用するkeyの値。
 * 値が文字列なのでクラスとして定義。
 */
export class UserSettingsKeyConst {

    /** 環境設定情報  設定区分:group */
    public static readonly GROUP: { [key: string]: string } = {

        /**
         * 時差
         */
        TIME_DIFFERENCE: 'time_difference',

        /**
         * 週開始日
         */
        FIRST_DAY_OF_WEEK_KIND: 'first_day_of_week_kind',

        /**
         * 表示件数
         */
        DISPLAY_COUNT: 'display_count'
    };

    /** 環境設定情報  設定区分:user */
    public static readonly USER: { [key: string]: string } = {

        /**
         * 言語コード
         */
        LANG_CODE: 'lang_code',

        /**
         * 日時形式コード
         */
        DATE_FORMAT_CODE: 'date_format_code',

        /**
         * 距離表示単位コード
         */
        DISTANCE_UNIT_CODE: 'distance_unit_code',

        /**
         * 温度表示単位コード
         */
        TEMPERATURE_UNIT_CODE: 'temperature_unit_code',

        /**
         * 車種表示区分
         */
        DIVISION_DISPLAY_KIND: 'division_display_kind',

        /**
         * 初期表示ページURL
         */
        DEFAULT_PAGE_URL: 'default_page_url'

    };


}
