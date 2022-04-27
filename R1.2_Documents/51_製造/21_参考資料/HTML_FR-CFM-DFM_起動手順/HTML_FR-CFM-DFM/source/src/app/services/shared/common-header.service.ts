import { map, reduce, get } from 'lodash';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import {
  CommonConfig,
  ConfigItems,
  ConfigLabels,
  FormItem,
  HeaderItem,
  UserItems,
} from '../../vendor/k-common-module/interfaces';

import { Labels, Resources } from '../../types/common';
import { SettingParams } from '../../types/user-setting';
import { Navigation } from '../../types/navigation';

import { FunctionCode as FlmFunctionCode } from '../../constants/flm/function-codes/common';
import { FunctionCode as OpaFunctionCode } from '../../constants/opa/function-codes/common';

import { environment } from '../../../environments/environment';

import { RequestHeaderMap } from '../../constants/request';

import { ApiService } from '../api/api.service';
import { UserSettingService } from '../api/user-setting.service';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class CommonHeaderService {
  managementItems: HeaderItem[];
  labels: Labels = {};
  paramsMap = {
    temperatureUnit: 'temperature_unit_code',
    dateFormat: 'date_format_code',
    carDivision: 'division_display_kind',
    locale: 'lang_code',
    distanceUnit: 'distance_unit_code',
    initialScreen: 'default_page_url',
  };
  logoPath = '';
  configItems: ConfigItems;
  configValues: CommonConfig;
  configLabels: ConfigLabels;
  userItems: UserItems;
  isLoggedIn = true;
  links: {
    [id: string]: string;
  } = {};
  FunctionCode: any;
  homeIconLink: string;
  signOutLink: string;

  get isHome() {
    return location.href.replace(location.search, '') === this.homeIconLink;
  }

  constructor(
    private router: Router,
    private api: ApiService,
    private userSettingService: UserSettingService,
    private authService: AuthenticationService
  ) {
    this.FunctionCode =
      environment.settings.appPrefix === 'flm'
        ? FlmFunctionCode
        : environment.settings.appPrefix === 'opa'
          ? OpaFunctionCode
          : {};
  }

  /**
   * ラベル、リソースをヘッダの表示項目にセットする
   * @param labels ラベル
   * @param resource リソース
   */
  async setHeader(labels: Labels, resource: Resources, functions: Navigation[]): Promise<void> {
    this.setLabels(labels);
    this.setConfigResource(labels, resource, functions);
    this._setHeaderFunctions(functions);
    this.homeIconLink = this._getHomeIconLink(functions);
    this.signOutLink = this._getSignOutLink(functions);
    this.userItems = this._getUserItems(functions);
    const config = this.userSettingService.getConfigValues();
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
  setLabels(labels: Labels): void {
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
  setConfigResource(labels: Labels, resource: Resources, functions: Navigation[]): void {
    this.configLabels = this._createConfigLabels(labels, resource);
    this.configItems = this._createConfigItems(resource);
    const result = this._getInitialScreenResource(functions);

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
  onClickHome(): void {
    if (this.isHome || this.homeIconLink == null) {
      return;
    }

    location.href = this.homeIconLink;
  }

  onClickManagementUser(): void { }

  /**
   * 管理のリスト項目押下時の処理
   * @param id 選択したリストの機能コード
   */
  handleClickLink(id) {
    const link = this.links[id];
    if (!link) {
      return;
    }

    if (['flm_faq_link', 'flm_faq_admin_link', 'opa_faq_link'].includes(id)) {
      window.open(link, '_blank');
    } else {
      location.href = link;
    }
  }

  /**
   * ログアウトボタンクリック時の処理
   */
  handleClickSignout(): void {
    const appCode = (window as any).settings.azureAdAuthenticationInfo.clientId;
    const groupIdKey = `group_id.${appCode}`;

    this.authService.azureAdAuthentication.clearCache();
    localStorage.removeItem(groupIdKey);
    location.href = this.signOutLink;
  }

  /**
   * 環境設定の OK ボタンクリック時の処理
   * @param $event 環境設定の内容
   */
  async onSubmitConfig($event: ConfigItems): Promise<void> {
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
  _createConfigLabels(labels: Labels, resource): ConfigLabels {
    const base = {
      submit: labels._common.ok,
      cancel: labels._common.cancel,
    };

    return reduce(
      RequestHeaderMap,
      (result, v, k) => {
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
  _createConfigItems(resource): ConfigItems {
    return reduce(
      RequestHeaderMap,
      (result, v, k) => {
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
  _getConfigItemValues(resourceItem): FormItem[] {
    return map(resourceItem.values, v => ({ label: v.name, value: v.value }));
  }

  /**
   * 管理の選択データを作成する
   * @param funcs 機能項目
   */
  private _setHeaderFunctions(funcs: Navigation[]): void {
    const headerFunctions: Navigation = funcs.find(
      func =>
        this.FunctionCode.adminMenu && func.code === this.FunctionCode.adminMenu
    );
    if (!headerFunctions || !headerFunctions.functions) {
      return;
    }
    this.managementItems = headerFunctions.functions
    .filter(el => el.code !== 'flm_admin_menu_link' ||  (el.functions && el.functions.length))
    .map(item => {
      const link = get(item, 'options[0].value');
      if (link) {
        this.links[item.code] = link;
      }
      return {
        id: item.code,
        label: item.name,
        isEnabled: true,
      };
    });
  }

  /**
   * ヘッダのユーザのタブの内容を取得する
   * @param functions アプリケーション機能
   */
  private _getUserItems(functions: Navigation[]) {
    const headerUserFunction = functions.find(
      fn => fn.code === this.FunctionCode.userMenu
    );
    let nextUrl =
      localStorage.getItem(environment.settings.appPrefix + '-entrance-next') ||
      location.href;
    const appCode = (window as any).settings.azureAdAuthenticationInfo.clientId;
    const groupId = localStorage.getItem(`group_id.${appCode}`);
    const match = nextUrl.match(/\?[\w=&]+/);
    const search = match ? match[0] : null;
    nextUrl = search ? nextUrl.replace(search, '') : nextUrl;
    if (search != null) {
      const paramList = search
        .replace('?', '')
        .split('&')
        .filter(p => !p.startsWith('group_id='));
      nextUrl =
        paramList.length > 0 ? `${nextUrl}?${paramList.join('&')}` : nextUrl;
    }

    const links = headerUserFunction
      ? headerUserFunction.functions.map(fn => {
        if (
          fn.code === 'flm_group_switch_link' ||
          fn.code === 'opa_group_switch_link'
        ) {
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

    const group = this.api.getCurrentGroup();
    const groupName = group ? group.label : '';

    return {
      groupName,
      links,
      name: this.authService.currentUserName,
      email: this.authService.currentUserId,
    };
  }

  /**
   * ホームアイコンのリンクを作成
   * @param functions アプリケーション機能
   */
  private _getHomeIconLink(functions: Navigation[]) {
    const homeLinkFunction = functions.find(
      fn => fn.code === this.FunctionCode.homeLink
    );
    return location.origin + get(homeLinkFunction, 'options[0].value');
  }

  /**
   * サインアウトのリンクを作成
   * @param functions アプリケーション機能
   */
  private _getSignOutLink(functions: Navigation[]) {
    const signoutLinkFunction = functions.find(
      fn => fn.code === this.FunctionCode.signOutLink
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
    return Object.keys(config).reduce((temp, key) => {
      if (!this._isConfigValueValid(config, resource, key)) {
        temp[key] = resource[RequestHeaderMap[key]].values[0].value;
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
  ) {
    const resourceItem = resource[RequestHeaderMap[key]];

    if (resourceItem == null) {
      return true;
    }

    return (
      config[key] != null &&
      resourceItem.values.some(value => value.value === config[key])
    );
  }

  private _getInitialScreenResource(functions: Navigation[]): [FormItem[], string] {
    if (environment.settings.appPrefix === 'opa') {
      return null;
    }

    const envSettingMenu =
      functions.find(func => func.code === FlmFunctionCode.envSettingMenu);
    const startPageFunction =
      envSettingMenu.functions.find(func => func.code === FlmFunctionCode.startPageFunction);

    return [
      startPageFunction.functions.map(func => ({
        label: func.name,
        value: func.options[0].value,
      })),
      startPageFunction.name,
    ];
  }

  /**
   * リンクがFQDN形式であるかを判定する IE対応
   * @param url URL
   */
  private _isFQDN(url: string) {
    return url.startsWith('http');
  }
}
