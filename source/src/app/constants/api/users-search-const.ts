/**
 * ユーザ一覧取得API [API_ID：KOM-00200011]に関する定数。
 */
export class UsersSearchConst {

    // ユーザ区分
    public static readonly USER_KIND: { ADMINISTRATOR: string, GENERAL: string } = {
        ADMINISTRATOR: '1', // 管理者
        GENERAL: '2' // 一般
    };

}
