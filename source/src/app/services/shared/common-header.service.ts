import { Injectable } from '@angular/core';
import { map, reduce, get } from 'lodash';
import {
    CommonConfig,
    ConfigItems,
    ConfigLabels,
    FormItem,
    HeaderItem,
    UserItems,
} from 'app/vendors/k-common-module/interfaces';
import { Labels, Resource, Resources } from 'app/types/common';
import { SettingParams } from 'app/types/user-setting';
import { Navigation } from 'app/types/navigation';
import { environment } from 'environments/environment';
import { RequestHeaderMap } from 'app/constants/request';
import { ApiService } from 'app/services/api/api.service';
import { UserSettingService } from 'app/services/api/user-setting.service';
import { AuthenticationService } from 'app/services/shared/authentication.service';
import { FunctionCodeConst } from 'app/constants/api/function-code-const';
import { AuthData } from 'app/types/auth-data';

@Injectable()
export class CommonHeaderService {

    public managementItems: HeaderItem[];
    public labels: Labels = {};
    public logoPath = '';
    public configItems: ConfigItems;
    public configValues: CommonConfig;
    public configLabels: ConfigLabels;
    public userItems: UserItems;
    public isLoggedIn = true;
    public links: {
        [id: string]: string;
    } = {};
    public homeIconLink: string;
    public signOutLink: string;
    private paramsMap: { [key: string]: string } = {
        temperatureUnit: 'temperature_unit_code',
        dateFormat: 'date_format_code',
        carDivision: 'division_display_kind',
        locale: 'lang_code',
        distanceUnit: 'distance_unit_code',
        initialScreen: 'default_page_url',
    };

    public get isHome(): boolean {
        return location.href.replace(location.search, '') === this.homeIconLink;
    }

    constructor(
        private api: ApiService,
        private userSettingService: UserSettingService,
        private authService: AuthenticationService
    ) {
    }

    /**
     * ラベル、リソースをヘッダの表示項目にセットする
     * @param labels ラベル
     * @param resource リソース
     */
    public async setHeader(labels: Labels, resource: Resources, functions: Navigation[]): Promise<void> {
        this.setLabels(labels);
        this.setConfigResource(labels, resource, functions);
        this.homeIconLink = this._getHomeIconLink(functions);
        this.signOutLink = this._getSignOutLink(functions);
        this.userItems = this._getUserItems(functions);
        const config: CommonConfig = this.userSettingService.getConfigValues();
        this.configValues = this._getShowConfigValues(resource, config);

        if (this.configItems.initialScreen && this.configItems.initialScreen.length > 0) {
            this.configValues.initialScreen =
                config.initialScreen || this.configItems.initialScreen[0].value;
        }
    }

    /**
     * ラベルをヘッダの表示項目にセットする
     * @param labels ラベル
     */
    public setLabels(labels: Labels): void {
        this.labels = labels;
        this.labels.managementDropdown = labels._common.management_drop_down_group;
        this.labels.configDropdown = labels._common.config_drop_down_group;
        this.labels.signOutDialogTitle = labels._common.signout_dialog_title;
        this.labels.signOutDialogNote = labels._common.signout_dialog_note;
        this.labels.signOutDialogButtonCancel =
            labels._common.signout_dialog_button_cancel;
        this.labels.signOutDialogButtonSignOut =
            labels._common.signout_dialog_button_signout;
        this.labels.logout = labels._common.signout_dialog_button_signout;
    }

    /**
     * 設定ダイアログの表示項目をセットする
     * @param labels ラベル
     * @param resource リソース
     */
    public setConfigResource(labels: Labels, resource: Resources, functions: Navigation[]): void {
        this.configLabels = this._createConfigLabels(labels, resource);
        this.configItems = this._createConfigItems(resource);
        const result: [FormItem[], string] = this._getInitialScreenResource(functions);

        if (result == null) {
            return;
        }

        const [initialScreenValues, initialScreenLabel] = result;
        this.configLabels.initialScreenHead = initialScreenLabel;
        this.configItems.initialScreen = initialScreenValues;
    }

    /**
     * ホームアイコンクリック時の処理
     */
    public onClickHome(): void {
        if (this.isHome || !this.homeIconLink) {
            return;
        }

        location.href = this.homeIconLink;
    }

    public onClickManagementUser(): void { }

    /**
     * 管理のリスト項目押下時の処理
     * @param id 選択したリストの機能コード
     */
    public handleClickLink(id: string) {
        const link: string = this.links[id];
        if (!link) {
            return;
        }

        if (['cdms_faq_link'].includes(id)) {
            window.open(link, '_blank');
        } else {
            location.href = link;
        }
    }

    /**
     * ログアウトボタンクリック時の処理
     */
    public handleClickSignout(): void {
        const appCode: string = (window as any).settings.azureAdAuthenticationInfo.clientId;
        const groupIdKey: string = `group_id.${appCode}`;

        this.authService.clearCache();
        localStorage.removeItem(groupIdKey);
        location.href = this.signOutLink;
    }

    /**
     * 環境設定の OK ボタンクリック時の処理
     * @param $event 環境設定の内容
     */
    public async onSubmitConfig($event: ConfigItems): Promise<void> {
        const params: SettingParams = reduce(
            $event,
            (result, value, key) => {
                if (value) {
                    result.user_settings.push({ key: this.paramsMap[key], value: value });
                }
                return result;
            },
            { user_settings: [] }
        );

        await this.api.updateUserSettings(params);
        location.reload();
    }

    /**
     * 環境設定のラベルを生成する
     * @param labels ラベル
     * @param resource リソース
     */
    private _createConfigLabels(labels: Labels, resource: any): ConfigLabels {
        const base: {
            submit: string;
            cancel: string;
        } = {
            submit: labels._common.ok,
            cancel: labels._common.cancel,
        };

        return reduce(
            RequestHeaderMap,
            (result: any, v: any, k: any) => {
                if (resource[v]) {
                    result[k + 'Head'] = resource[v].name;
                }
                return result;
            },
            base
        );
    }

    /**
     * 環境設定の選択項目を生成する
     * @param resource リソース
     */
    private _createConfigItems(resource: any): ConfigItems {
        return reduce(
            RequestHeaderMap,
            (result: any, v: any, k: any) => {
                if (resource[v]) {
                    result[k] = this._getConfigItemValues(resource[v]);
                }
                return result;
            },
            {}
        );
    }

    /**
     * 環境設定の選択肢データを取得する
     * @param resourceItem リソース項目
     */
    private _getConfigItemValues(resourceItem: any): FormItem[] {
        return map(resourceItem.values, v => ({ label: v.name, value: v.value }));
    }

    /**
     * ヘッダのユーザのタブの内容を取得する
     * @param functions アプリケーション機能
     */
    private _getUserItems(functions: Navigation[]) {
        const headerUserFunction = functions.find(
            fn => fn.code === FunctionCodeConst.USER_MENU_FUNCTION
        );
        let nextUrl =
            localStorage.getItem(environment.settings.appPrefix + '-entrance-next') ||
            location.href;
        const appCode: string = (window as any).settings.azureAdAuthenticationInfo.clientId;
        const groupId: string = localStorage.getItem(`group_id.${appCode}`);
        const match: RegExpMatchArray = nextUrl.match(/\?[\w=&]+/);
        const search: string = match ? match[0] : null;
        nextUrl = search ? nextUrl.replace(search, '') : nextUrl;
        if (search != null) {
            const paramList = search
                .replace('?', '')
                .split('&')
                .filter(p => !p.startsWith('group_id='));
            nextUrl =
                paramList.length > 0 ? `${nextUrl}?${paramList.join('&')}` : nextUrl;
        }

        const links: { id: string; label: string; isEnabled: boolean; }[] =
            headerUserFunction
            ? headerUserFunction.functions.map(fn => {
                if (fn.code === 'cdsm_group_switch_link') {
                    nextUrl = this.homeIconLink;
                }

                if (fn.options[0]) {
                    const url = fn.options[0].value;
                    let query = '';

                    // フルパス形式で返却されないリンクに限りクエリを付ける
                    if (!this._isFQDN(url)) {
                        query = `?next=${encodeURIComponent(nextUrl)}&app_code=${appCode}`;

                        if (groupId) {
                            query += `&group_id=${groupId}`;
                        }
                    }

                    this.links[fn.code] = url + query;
                }

                return {
                    id: fn.code,
                    label: fn.name,
                    isEnabled: true,
                };
            })
            : [];

        const group: { [key: string]: any; } = this.api.getCurrentGroup();
        const groupName: string = group ? group.label : '';

        const authData: AuthData = this.authService.getAuthData();

        return {
            groupName,
            links,
            name: authData.userName,
            email: authData.userId
        };
    }

    /**
     * ホームアイコンのリンクを作成
     * @param functions アプリケーション機能
     */
    private _getHomeIconLink(functions: Navigation[]): string {
        const homeLinkFunction: Navigation = functions.find(
            fn => fn.code === FunctionCodeConst.HOME_LINK_FUNCTION
        );
        return location.origin + get(homeLinkFunction, 'options[0].value');
    }

    /**
     * サインアウトのリンクを作成
     * @param functions アプリケーション機能
     */
    private _getSignOutLink(functions: Navigation[]): string {
        const signoutLinkFunction: Navigation = functions.find(
            fn => fn.code === FunctionCodeConst.SIGN_OUT_FUNCTION
        );
        const {
            settings: {
                azureAdAuthenticationInfo: { tenant, logoutRedirectUrl },
            },
        } = window as any;

        if (signoutLinkFunction == null) {
            return '';
        }

        return get(signoutLinkFunction, 'options[0].value').replace(
            '{tenant_id}',
            tenant
        ).replace(
            '{logout_redirect_url}',
            encodeURIComponent(logoutRedirectUrl)
        );
    }

    /**
     * 表示用のコンフィグを取得する
     * @param resource リソース
     * @param config ユーザ設定値
     */
    private _getShowConfigValues(resource: Resources, config: CommonConfig) {
        return Object.keys(config).reduce((temp: any, key: string) => {
            if (!this._isConfigValueValid(config, resource, key)) {
                if (key in resource) {
                    temp[key] = resource[<keyof RequestHeaderMap>key].values[0].value;
                }
            }

            return temp;
        }, config);
    }

    /**
     * ユーザ設定値に正常な値が入っているかを検査する
     * @param config ユーザ設定値
     * @param resource リソース
     * @param key ユーザ設定のキー
     */
    private _isConfigValueValid(
        config: CommonConfig,
        resource: Resources,
        key: string
    ): boolean {
        const resourceItem: Resources & Resource = resource[RequestHeaderMap[<keyof RequestHeaderMap>key]];

        if (resourceItem == null) {
            return true;
        }

        return (
            config[<keyof CommonConfig>key] != null &&
            resourceItem.values.some(value => value.value === config[<keyof CommonConfig>key])
        );
    }

    private _getInitialScreenResource(functions: Navigation[]): [FormItem[], string] {

        let startPageFunctionItems: [FormItem[], string] = null;

        const envSettingMenu: Navigation =
            functions.find((func: Navigation) => func.code === FunctionCodeConst.ENV_SETTING_MENU_FUNCTION);
        if (envSettingMenu) {
            const startPageFunction: Navigation =
                envSettingMenu.functions.find((func: Navigation) => func.code === FunctionCodeConst.START_PAGE_FUNCTION);
            if (startPageFunction) {
                startPageFunctionItems = [
                    startPageFunction.functions.map((func: Navigation) => ({
                        label: func.name,
                        value: func.options[0].value,
                    })),
                    startPageFunction.name,
                ];
            }
        }

        return startPageFunctionItems;
    }

    /**
     * リンクがFQDN形式であるかを判定する IE対応
     * @param url URL
     */
    private _isFQDN(url: string): boolean {
        return url.startsWith('http');
    }

}
