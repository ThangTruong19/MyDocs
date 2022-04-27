import {
  throwError as observableThrowError,
  of as observableOf,
  forkJoin as observableForkJoin,
  Observable,
  from,
} from 'rxjs';

import { catchError, map, concatMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpResponse, HttpParams, HttpParameterCodec } from '@angular/common/http';
import { Router } from '@angular/router';

import { Api, ApiId, Resources, Labels, Fields } from '../../types/common';
import { ErrorData } from '../../types/error-data';
import { SettingParams } from '../../types/user-setting';
import { InitializeApiResult } from '../../types/common';

import { KbaMimeType } from '../../constants/mime-types';
import { StatusCodes } from '../../constants/status_codes';
import { AuthenticationStatus } from '../../constants/authentication-status';
import { ErrorCodes } from '../../constants/error_codes';
import { Apis } from '../../constants/apis';

import { ResourceService } from './resource.service';
import { KbaAlertService } from '../../services/shared/kba-alert.service';
import { UserSettingService } from './user-setting.service';
import { AuthenticationService } from '../shared/authentication.service';
import { EntranceService } from '../shared/entrance.service';

import { LogKind } from './log_kind';
import { environment } from '../../../environments/environment';
import { kmtMakerCode } from '../../constants/car';

interface CallableApi {
  api_id?: string;
  http_method?: string;
  method?: string;
  url?: string;
  opt?: any;
}

class QueryParamEncoder implements HttpParameterCodec {
  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }
  encodeValue(value: string): string {
    return encodeURIComponent(value);
  }
  decodeKey(key: string): string {
    return decodeURIComponent(key);
  }
  decodeValue(value: string): string {
    return decodeURIComponent(value);
  }
}

@Injectable()
export class ApiService {
  currentScreenCode: string;
  initialResouce: Resources;
  catalogApiCache: Api;
  labelsApiCache: { [screenCode: string]: Labels } = {};
  commonResouceCache: Resources;
  userSettingsApiCache: Api;

  private catalogGroups: any[];
  private settings = (window as any).settings;
  private appCode = this.settings.azureAdAuthenticationInfo.clientId;
  private queue: any = {};
  private callableApis: CallableApi[];

  constructor(
    private http: HttpClient,
    private resource: ResourceService,
    private router: Router,
    private alertService: KbaAlertService,
    private userSettingService: UserSettingService,
    private authService: AuthenticationService,
    private entranceService: EntranceService,
    @Inject(DOCUMENT) private document
  ) { }

  /*
   * ファイルアップロード処理
   */
  uploadFile(path: ApiId, file: File, json: string, screenCode?: string): Observable<Api> {
    const formData = new FormData();

    formData.append(
      'json',
      new Blob([json], {
        type: 'application/json',
      })
    );
    formData.append('file', file, file.name);
    const config = {
      method: 'POST',
      url: this._getApiUrl(path),
      params: formData,
    };

    const opt = { isUpload: true } as any;

    if (screenCode) {
      opt.screenCode = screenCode;
    }

    return this._call(config, opt);
  }

  /**
   * 各画面の初期化に必要な API をコールします。
   * @param screenCodeIndex 画面 ID
   * @param handler requestHandler() に渡すハンドラ名
   * @param apis 各画面で必要な API
   * @param opt オプション
   */
  async callApisForInitialize(
    screenCode: string,
    handler: string,
    apis?: { [name: string]: (() => Observable<any>) | ApiId },
    opt?: any
  ): Promise<InitializeApiResult> {
    await this._prepareForInitialize(opt);
    return this._initialize(screenCode, handler, apis, opt);
  }

  /**
   * 指定項目リソース取得 API
   * @param functionCode 機能コード
   * @param opt オプション
   */
  fetchFieldResources(functionCode: string, opt?: any): Observable<any> {
    return this.get(
      Apis.getApplicationsFieldsResources,
      { function_code: functionCode },
      opt
    ).pipe(
      map(res => {
        return res.result_data.field_resources[0].field_items;
      })
    );
  }

  /**
   * 指定項目取得 API
   * @param functionCode 機能コード
   * @param opt オプション
   * @param searchParameters 検索条件
   */
  fetchFields(
    functionCode: string,
    opt?: any,
    searchParameters?: string
  ): Observable<any> {
    const params = {
      function_code: functionCode,
      field_set_no: '1',
      search_parameter: searchParameters,
    };

    return this.get(Apis.getApplicationsFields, params, opt).pipe(
      map(res => {
        return res.result_data.field_sets[0]
          ? res.result_data.field_sets[0].field_items
          : [];
      })
    );
  }

  /**
   * 指定項目取得（改行対応）
   * @param functionCode 機能コード
   */
  fetchFieldsWithWordBreak(
    functionCode: string,
    opt?: any,
    searchParameters?: string
  ) {
    const wordBreakMark = /##/g;

    return this.fetchFields(functionCode, opt, searchParameters).pipe(map((fields: Fields) =>
      fields.map(field => ({
        ...field,
        name: field.name.replace(wordBreakMark, '\n'),
      }))
    ));
  }

  /*
   * 指定項目更新APIリクエスト
   *
   * @param functionCode 機能コード
   * @param fieldItems 更新内容
   * @param opt オプション
   */
  updateField(
    functionCode: string,
    fieldItems: any[],
    opt?: any
  ): Promise<any> {
    const params = {
      function_code: functionCode,
      field_set: {
        no: '1',
        label: functionCode,
        field_items: fieldItems,
      },
    };

    return new Promise((resolve, reject) => {
      this.requestHandler(
        'updateField',
        this.put(Apis.putApplicationsFields, params, opt).subscribe(res => {
          resolve(res);
        })
      );
    });
  }

  /**
   * 検索条件取得APIリクエスト
   * @param screenCode 画面コード
   * @param opt オプション
   */
  fetchSearchCondition(screenCode: string, opt?: any): Observable<any> {
    return this.get(
      Apis.getApplicationsSearchCondition,
      { screen_code: screenCode, search_set_no: '1' },
      opt
    ).pipe(
      map(res => {
        return res.result_data.search_set[0].search_items;
      })
    );
  }

  /**
   * 検索条件更新APIリクエスト
   * @param screenCode 画面コード
   * @param searchItems 更新内容
   * @param opt オプション
   */
  updateSearchCondition(
    screenCode: string,
    searchItems: any[],
    opt?: any
  ): Promise<any> {
    const params = {
      screen_code: screenCode,
      search_set_no: '1',
      search_items: searchItems,
    };

    return new Promise((resolve, reject) => {
      this.requestHandler(
        'updateSearchCondition',
        this.put(Apis.putApplicationsSearchCondition, params, opt).subscribe(
          res => resolve(res)
        )
      );
    });
  }

  /**
   * 検索条件初期化APIリクエスト
   * @param screenCode 画面コード
   * @param opt オプション
   */
  initSearchCondition(screenCode: string, opt?: any): Promise<any> {
    const params = { screen_code: screenCode, search_set_no: '1' };
    return new Promise((resolve, reject) => {
      this.requestHandler(
        'initSearchCondition',
        this.delete(
          Apis.deleteApplicationsSearchCondition,
          params,
          opt
        ).subscribe(res => resolve(res))
      );
    });
  }

  /*
   * APIリクエスト制御
   *
   * @param {String} name 呼び出し先となるユニークなメソッド名
   * @param {Object} func キューに追加する Observable オブジェクト
   */
  requestHandler(name: string, observable: any) {
    // 呼び出し先メソッド名のプロパティが存在していた場合はリクエストをキャンセルする
    if (this.queue[name]) {
      this.queue[name].unsubscribe();
    }

    this.queue[name] = observable;
  }

  /*
   * 共通のget処理
   *
   * @param {ApiId} apiId API の ID
   * @param {Object} params API パラメータ
   * @param {Object} opt リクエストオプション
   * @return {Object} Observable オブジェクト
   */
  get(apiId: ApiId, params?: any, opt?: any): Observable<Api> {
    const config = {
      method: 'GET',
      url: this._getApiUrl(apiId),
      search: params,
    };

    return this._call(config, opt);
  }

  /*
   * 共通のpost処理
   *
   * @param {ApiId} apiId API の ID
   * @param {Object} params API パラメータ
   * @param {Object} opt リクエストオプション
   * @return {Object} Observable オブジェクト
   */
  post(apiId: ApiId, params: any, opt?: any): Observable<Api> {
    const config = {
      method: 'POST',
      url: this._getApiUrl(apiId),
      params: params,
    };

    return this._call(config, opt);
  }

  /*
   * 共通のupdate処理
   *
   * @param {ApiId} apiId API の ID
   * @param {Object} params API パラメータ
   * @param {Object} opt リクエストオプション
   * @return {Object} Observable オブジェクト
   */
  put(apiId: ApiId, params: any, opt?: any): Observable<Api> {
    const config = {
      method: 'PUT',
      url: this._getApiUrl(apiId),
      params: params,
    };

    return this._call(config, opt);
  }

  /*
   * 共通のdelete処理
   *
   * @param {ApiId} apiId API の ID
   * @param {Object} opt リクエストオプション
   * @return {Object} Observable オブジェクト
   */
  delete(apiId: ApiId, params?: any, opt?: any): Observable<Api> {
    const config = {
      method: 'DELETE',
      url: this._getApiUrl(apiId),
      search: params,
    };

    return this._call(config, opt);
  }

  /**
   * 車両種別情報取得 API
   * @param params API パラメータ
   */
  fetchDivisionList(params: any) {
    return new Promise((resolve, reject) => {
      this.requestHandler(
        'fetchDivisionList',
        this.get(Apis.getApplicationsModelTypes, {
          ...params,
          maker_code: params.maker_code || kmtMakerCode,
        }).subscribe(res => {
          resolve(res);
        })
      );
    });
  }

  /**
   * ユーザ一覧取得(共通認証) API
   * @param params API パラメータ
   * @param opt オプション
   */
  fetchCommonAuthenticationUsers(params, opt: any = {}) {
    return new Promise<Api>((resolve, reject) => {
      this.requestHandler(
        'fetchCommonAuthenticationUsers',
        this.get(Apis.getCommonAuthenticationUsers, params, opt).subscribe(
          res => resolve(res),
          err => reject(err)
        )
      );
    });
  }

  /**
   * ユーザ一覧取得(共通認証) API
   * @param {Object} params API パラメータ
   * @param opt オプション
   */
  fetchCommonAuthenticationCompanies(params, opt?: any) {
    return new Promise<Api>((resolve, reject) => {
      this.requestHandler(
        'fetchCommonAuthenticationCompanies',
        this.get(Apis.getCommonAuthenticationCompanies, params).subscribe(
          res => {
            resolve(res);
          }
        )
      );
    });
  }

  /**
   * ユーザ設定更新API
   * @param params API パラメータ
   */
  updateUserSettings(params: SettingParams): Promise<any> {
    return new Promise((resolve, reject) => {
      this.requestHandler(
        'updateUserSettings',
        this.put(Apis.putUserSettings, params).subscribe(res => {
          this.userSettingService.updateUserConfigValues(params.user_settings);
          resolve(res);
        })
      );
    });
  }

  /**
   * ファイルダウンロード API
   * @param fileID ファイル ID
   * @param contentType ファイル形式
   * @param opt オプション
   */
  downloadFile(fileId: string, contentType: string, opt?: any) {
    const options = {
      responseType: 'blob',
      request_header: {
        Accept: `application/json,${contentType}`,
        'Content-Type': '',
      },
    };

    return new Promise((resolve, reject) => {
      this.requestHandler(
        'dowloadFile',
        this.get(
          {
            apiId: Apis.getApplicationsFiles_fileId_,
            params: [fileId],
          },
          {},
          options
        ).subscribe(
          (res: any) => {
            this._saveFile(res.file, res.fileName);
            resolve();
          },
          error => reject(error)
        )
      );
    });
  }

  /**
   * 要素情報取得 API
   * @param screenCode 画面 ID
   * @param opt オプション
   */
  fetchResource(
    screenCode: string,
    searchParameters?: any,
    opt?: any
  ): Observable<any> {
    const params: any = {
      screen_code: screenCode,
    };
    if (!_.isEmpty(searchParameters)) {
      params.search_parameters = searchParameters;
    }
    return this.post(
      Apis.postApplicationsViewsResourcesSearch,
      params,
      opt
    ).pipe(
      map(res => {
        const result = this.resource.parse(res.result_data);

        // 検索条件なしのリソース取得
        if (
          _.get(searchParameters, '[0].condition_sets[0].condition') == null
        ) {
          this.initialResouce = _.merge(this.initialResouce, result);
        }

        return this.resource.parse(res.result_data);
      })
    );
  }

  /**
   * 共通系リソース取得（キャッシュ対応）
   */
  fetchCommonResouce(screenCode: string, opt?: any): Observable<any> {
    if (this.commonResouceCache != null) {
      return observableOf(this.commonResouceCache);
    }

    return this.fetchResource(screenCode, {}, opt).pipe(
      map(res => this.commonResouceCache = res)
    );
  }

  /**
   * ラベル情報取得 API
   * @param screenCode 画面コード
   * @param opt オプション
   */
  fetchLabels(screenCode: string, opt?: any): Observable<any> {
    const cache = this.labelsApiCache[screenCode];

    if (cache != null) {
      return observableOf(cache);
    }

    return this.get(
      Apis.getApplicationsViewsLabels,
      { screen_code: screenCode },
      opt
    ).pipe(
      map(res => {
        const result = _.reduce(
          res.result_data.labels,
          (temp, item) => {
            temp[item.code] = item.name;
            return temp;
          }, {}
        );
        this.labelsApiCache[screenCode] = result;
        return result;
      })
    );
  }

  /**
   * 外部アプリ連携ログ出力 API
   * @param screenCode 画面コード
   */
  postLog(
    screenCode: string,
    logKind: string,
    message?: string,
    opt?: any
  ): Observable<Api> {
    return this.post(
      Apis.postApplicationsExtapplog,
      {
        message,
        screen_code: screenCode,
        log_kind: logKind,
        url: this.document.location.href,
      },
      opt
    );
  }

  /**
   * 実行可能API取得API
   * @param opt オプション
   */
  fetchCatalog(opt?: any): Promise<Api> {
    return new Promise((resolve, reject) => {
      this.requestHandler(
        'fetchCatalog',
        this._getCatalog(opt).subscribe(
          res => resolve(res),
          error => reject(error)
        )
      );
    });
  }

  /**
   * 実行可能API取得API
   * @param opt オプション
   */
  fetchUserSettings(opt?: any): Promise<Api> {
    return new Promise((resolve, reject) => {
      this.requestHandler(
        'fetchUserSettings',
        this._getUserSetting(opt).subscribe(
          res => resolve(res),
          error => reject(error)
        )
      );
    });
  }

  getCatalogApiUrl() {
    return `${this.settings.protocol}://${this.settings.hostname}/catalog`;
  }

  getLogApiUrl() {
    return this._getApiUrl(Apis.postApplicationsExtapplog);
  }

  getUserSettingsApiUrl() {
    return `${this.settings.userSettingsEndpoint}`;
  }

  getGroupId() {
    return localStorage.getItem(`group_id.${this.appCode}`);
  }

  getCurrentGroup() {
    return this.catalogGroups.find(group => group.id === this.getGroupId());
  }

  /**
   * 実行可能APIで取得したグループを保存する
   * @param groups グループ
   */
  setGroups(groups: any[]) {
    this.catalogGroups = groups;
  }

  /**
   * NTC サポート対応
   * @param apis APIリスト
   */
  setCallableApis(apis: CallableApi[]) {
    this.callableApis = apis;
  }

  /**
   * 画面の初期化の前処理として、実行可能API一覧取得APIと未取得の場合にユーザ設定取得APIをコールします。
   * @param opt オプション
   */
  private _prepareForInitialize(opt?: any) {
    return Promise.all([
      this.fetchCatalog(),
      this.fetchUserSettings(),
    ]).then(([res1, res2]) => {
      const { apis, groups } = res1.result_data.user;
      this.callableApis = apis;
      this.catalogGroups = groups;

      if (res2) {
        this.userSettingService.updateConfigValues(res2.result_data);
      }
    });
  }

  /**
   * ApiIdからAPIのURLを逆引きする
   */
  private _getApiUrl(apiId: ApiId) {
    if (this.callableApis == null) {
      return null;
    }

    const api = this.callableApis.find(_api =>
      typeof apiId === 'string'
        ? apiId === _api.api_id
        : apiId.apiId === _api.api_id
    );

    if (api == null) {
      return null;
    }

    if (typeof apiId === 'string') {
      return api.url;
    }

    let i = 0;
    return api.url.replace(/{.+?}/g, () => apiId.params[i++]);
  }

  /**
   * API から取得したファイルをダウンロード
   * @param file ファイルの内容（バイナリ）
   * @param fileName ファイル名
   */
  private _saveFile(file: Blob, fileName: string) {
    // 参考 http://qiita.com/wadahiro/items/eb50ac6bbe2e18cf8813
    if (window.navigator && window.navigator.msSaveBlob) {
      window.navigator.msSaveOrOpenBlob(file, fileName);
    } else {
      const anchor = document.createElement('a');
      anchor.href = URL.createObjectURL(file);
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      URL.revokeObjectURL(anchor.href);
      anchor.remove();
    }
  }

  /**
   * アプリケーション機能取得 API
   * @param screenCode 画面コード
   * @param opt オプション
   */
  private _fetchFunctions(screenCode: string, opt?: any): Observable<Api> {
    return this.post(
      Apis.postApplicationsFunctionsSearch,
      { screen_code: screenCode },
      opt
    );
  }

  /**
   * 実行可能 API 一覧取得 API
   * @param opt オプション
   */
  private _getCatalog(opt?: any): Observable<Api> {
    if (this.catalogApiCache != null) {
      return observableOf(this.catalogApiCache);
    }

    const config = {
      method: 'GET',
      url: this.getCatalogApiUrl(),
    };

    return this._call(config, opt).pipe(
      map(res => {
        this.catalogApiCache = res;
        return res;
      })
    );
  }

  /**
   * ユーザ設定取得API
   */
  private _getUserSetting(opt?: any): Observable<Api> {
    if (this.userSettingsApiCache != null) {
      return observableOf(this.userSettingsApiCache);
    }

    const config = {
      method: 'GET',
      url: this.getUserSettingsApiUrl(),
    };

    return this._call(config, opt).pipe(
      map(res => {
        this.userSettingsApiCache = res;
        return res;
      })
    );
  }

  /**
   * 実行可能 API 一覧取得 API 実行後、初期化の処理を移譲するためのメソッドです。
   * @param screenCodeIndex 画面 ID
   * @param handler ハンドラ名
   * @param apis 実行するAPI
   * @param opt オプション
   */
  private _initialize(
    screenCodeIndex: string,
    handler: string,
    apis?: { [name: string]: (() => Observable<Api>) | ApiId },
    opt?: any
  ): Promise<InitializeApiResult> {
    const promise = new Promise<InitializeApiResult>((resolve, reject) => {
      if (apis == null) {
        apis = {};
      }

      let searchParameters = null;

      if (_.has(opt, 'search_parameters')) {
        searchParameters = opt.search_parameters;
        opt = _.omit(opt, 'search_parameters');
      }
      // 引数のオブジェクトをキーの配列とすることでパラメータの順番を固定化する
      const commonApiCallers = [
        this.fetchResource(screenCodeIndex, searchParameters, opt),
        this.fetchCommonResouce(
          environment.settings.commonHeaderScreenCode,
          opt
        ),
        this.fetchLabels(screenCodeIndex, opt),
        this.fetchLabels(environment.settings.commonHeaderScreenCode, opt),
        this._fetchFunctions(screenCodeIndex, opt),
      ];
      const [observables, flags] = Object.keys(apis).reduce(
        (temp, key) => {
          if (typeof apis[key] === 'function') {
            temp[0][key] = apis[key];
          } else {
            temp[1][key] = apis[key];
          }
          return temp;
        },
        [{}, {}]
      );
      const keys = Object.keys(observables);

      this.requestHandler(
        handler,
        observableForkJoin(
          commonApiCallers.concat(keys.map(key => observables[key]()))
        ).subscribe(res => {
          let index = commonApiCallers.length;
          const result = {
            resource: _.merge({}, res[1], res[0]),
            label: _.merge({}, res[2], {
              _common: res[3],
            }),
            functions: res[4],
          };

          keys.forEach(_key => (result[_key] = res[index++]));
          _.forEach(flags, (v, k) => {
            result[k] = !!this.callableApis.find(api => api.api_id === v);
          });
          resolve(result);
        })
      );
    });

    promise.then(() => {
      this.requestHandler(
        handler + 'AccessLog',
        this.postLog(screenCodeIndex, LogKind.access_log, '').subscribe()
      );
    });

    return promise;
  }

  /**
   * API呼出処理
   *
   * @param {Object} config リクエストパラメータ
   * @return {Object} Observable オブジェクト
   */
  private _call(config: any, opt?: any): Observable<Api> {
    if (!this._isCallable(config)) {
      // TODO: 実行可能ではないAPI呼び出しの場合の動きは確認中 shimizu
      console.log(config);
      console.log('実行不可能なAPIです。');
    }

    return from(this.authService.authentication()).pipe(
      concatMap(() => {
        const headers = this._requestHeaders(opt || {});

        const exclusionKeys = _.has(opt, 'exclusionKeys')
          ? opt['exclusionKeys']
          : [];
        const responseType = (opt && opt.responseType) || 'json';
        const observe: 'response' = 'response';
        const params = new HttpParams({
          fromObject: this._pickAvailableParams(config.search, exclusionKeys),
          encoder: new QueryParamEncoder(),
        });
        const requestOptions = {
          headers,
          observe,
          responseType,
          params,
        };
        const body = this._pickAvailableParams(config.params, exclusionKeys);

        return (() => {
          switch (config.method) {
            case 'GET':
              return this.http.get<Api>(config.url, requestOptions);
            case 'POST':
              return this.http.post<Api>(config.url, body, requestOptions);
            case 'PUT':
              return this.http.put<Api>(config.url, body, requestOptions);
            case 'DELETE':
              return this.http.delete<Api>(config.url, requestOptions);
          }
        })().pipe(
          map(
            res =>
              this.extractData(res as HttpResponse<any>, responseType) as Api
          ),
          catchError(err => {
            if (err.json == null && err.name === 'SyntaxError') {
              err._type = 'ParseError';
              throw err;
            }

            // 実行可能APIがエラーの場合はエラーを握り潰す
            if (err.url === this.getLogApiUrl()) {
              return observableOf(err);
            }

            const errorData = err.error_data;
            if (err.status === StatusCodes.fatalError) {
              const url = new URL(config.url);
              err.url = url.pathname;
              throw err;
            } else if (err.status === StatusCodes.unauthorized) {
              // 利用規約再許諾のため、エントランス画面に遷移
              if (errorData[0].code === ErrorCodes.updatedPolicy) {
                this.entranceService.transitionEntrance(
                  this.getGroupId(),
                  true
                );
              } else {
                this.authService.azureAdAuthentication
                  .run()
                  .then((res: { status: number }) => {
                    if (res.status !== AuthenticationStatus.hasNotYetAcquired) {
                      location.href = localStorage.getItem(
                        environment.settings.appPrefix + '-entrance-next'
                      );
                    }
                  });
              }
            } else {
              err._type = 'ApiError';

              return this._handleError(err);
            }
          })
        );
      })
    );
  }

  private extractData(res: HttpResponse<Api>, responseType: string) {
    const header = {
      result_header: {
        'X-From': res.headers.get('X-From'),
        'X-TotalCount': res.headers.get('X-TotalCount'),
        'X-Count': res.headers.get('X-Count'),
        'X-Sort': res.headers.get('X-Sort'),
      },
    };

    const contentType = res.headers.get('Content-Type');
    if (
      contentType &&
      (contentType.match(new RegExp(KbaMimeType.excel)) ||
        contentType.match(new RegExp(KbaMimeType.csv)) ||
        contentType.match(new RegExp(KbaMimeType.tsv)) ||
        contentType.match(new RegExp(KbaMimeType.octetStream)))
    ) {
      const response: any = {
        status: res.status,
      };

      if (responseType === 'blob') {
        response.file = res.body;
        response.fileName =
          this._parseContentDisposition(
            res.headers.get('Content-Disposition')
          ) || 'data.' + this._getFileExtension(contentType);
      }

      return response;
    }
    const body = res.body;
    const status = {
      status: res.status,
    };
    return _.merge(header, body, status);
  }

  private _handleError(error: ErrorData): Observable<any> {
    return observableThrowError(error);
  }

  private _parseContentDisposition(contentDisposition?: string) {
    if (contentDisposition == null) {
      return null;
    }

    const fileNameMatch = contentDisposition.match(/filename\*=utf-8''(.+)/);
    const uriFileName = fileNameMatch && fileNameMatch[1];

    if (uriFileName == null) {
      return null;
    }

    const fileName = decodeURIComponent(uriFileName);

    return fileName.replace(/tsv$/, 'csv');
  }

  /**
   * API をコール可能であるか判定します。
   * @param url API の url
   */
  private _isCallable(config): boolean {
    if (this.callableApis == null) {
      return true;
    }

    const anchorBase = document.createElement('a');
    const anchorCompare = document.createElement('a');
    anchorBase.href = config.url;

    const placeholder = 'PARAM_PLACEHOLDER';
    const target = anchorBase.pathname
      .split('/')
      .map(p => {
        if (/^\d+$/.test(p)) {
          return placeholder;
        }
        return p;
      })
      .filter(p => p !== '');

    let compare;
    const result =
      this.callableApis.find(el => {
        anchorCompare.href = el.url.replace(/{\w+}/g, placeholder);
        compare = anchorCompare.pathname.split('/').filter(p => p !== '');
        return config.method === el.http_method && _.isEqual(target, compare);
      }) != null;

    return result;
  }

  /**
   * API へのリクエスト時のパラメータのうち、値が空でない有効なパラメータのみを選択し返します。
   * @param params リクエストパラメータ
   * @param exclusionKey 除外対象キー
   */
  private _pickAvailableParams(
    params,
    exclusionKey: string[],
    keys: string = '',
    isArray: boolean = false
  ) {
    const initValue = _.isArray(params) ? [] : {};

    // ファイルアップロード：パラメータとして FormData が渡された場合そのまま通す
    if (Object.prototype.toString.call(params) === '[object FormData]') {
      return params;
    }

    return _.reduce(
      params,
      (obj, value, key) => {
        // キーが添え字でない場合
        if (!_.isNumber(key)) {
          keys += _.isEmpty(keys) ? key : `.${key}`;
        }
        // Array以外のObjectの場合
        if (_.isPlainObject(value)) {
          obj[key] = this._pickAvailableParams(value, exclusionKey, keys);
        } else if (_.isArray(value)) {
          obj[key] = this._pickAvailableParams(
            value,
            exclusionKey,
            keys,
            true
          ).filter(val => val === 0 || !!val);
        } else {
          if (
            _.includes(exclusionKey, keys) ||
            (value != null && value !== '')
          ) {
            obj[key] = value;
          }
        }

        if (!isArray) {
          // 除外パラメタのキー比較用のキーより「.」の最後の要素を取り除く
          // 例. id_keys.current_operator.code => id_keys.current_operator
          keys = _.chain(keys)
            .split('.')
            .dropRight()
            .join('.')
            .value();
        }

        return obj;
      },
      initValue
    );
  }

  /**
   * 共通のリクエストヘッダを設定します。
   * @param opt リクエストオプション
   */
  private _requestHeaders(opt): { [key: string]: string } {
    const headers = _.merge(
      {
        Accept: 'application/json',
        'X-AppCode': this.appCode,
        'X-ScreenCode': (opt && opt.screenCode) || this.currentScreenCode || '',
      },
      !opt.isUpload ? { 'Content-Type': 'application/json' } : null,
      this.userSettingService.getRequestHeaders()
    );

    const xGroupId = this.getGroupId();
    if (xGroupId) {
      headers['X-GroupId'] = xGroupId;
    }

    headers['Authorization'] = `Bearer ${this.authService.token}`;

    if (_.has(opt, 'request_header')) {
      _.each(opt.request_header, (value, key) => {
        if (value == null) {
          return;
        }

        headers[key] = '' + value;
      });
    }

    return headers;
  }

  /**
   * Content-Typeヘッダからファイルの拡張子を取得する
   */
  private _getFileExtension(contentType: string) {
    switch (contentType) {
      case KbaMimeType.csv:
      case KbaMimeType.tsv:
        return 'csv';

      case KbaMimeType.excel:
      default:
        return 'xlsx';
    }
  }
}
