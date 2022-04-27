import { Injectable } from '@angular/core';

@Injectable()
export class UrlService {

    private static readonly URL_PARAM_REG_EX: RegExp = new RegExp(/\?[\w=&]+/);

    /**
     * 再遷移先のURLを取得する。
     * ※現在の画面表示URLからgroup_idパラメータを除いたURLを返却する。
     * @returns 再遷移先のURL
     */
    public getNextUrl(): string {

        let nextUrl: string =  window.location.href;

        // URLからパラメータ部分を抽出する。
        const match: RegExpMatchArray = nextUrl.match(UrlService.URL_PARAM_REG_EX);
        const search: string = match ? match[0] : null;

        // パラメータ部分を除いたURLを抽出する。
        nextUrl = search ? nextUrl.replace(search, '') : nextUrl;

        if (search != null) {
            // group_idを除いたパラメータ部分を抽出する。
            const paramList: string[] = search
                .replace('?', '')
                .split('&')
                .filter(p => !p.startsWith('group_id='));

            // group_idパラメータを除いたURLを作成する。
            nextUrl = paramList.length > 0 ? `${nextUrl}?${paramList.join('&')}` : nextUrl;
        }

        return encodeURIComponent(nextUrl);
    }

}
