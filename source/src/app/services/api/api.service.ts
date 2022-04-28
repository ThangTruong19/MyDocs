import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpResponse, HttpParams, HttpParameterCodec } from '@angular/common/http';
import {
    throwError as observableThrowError,
    of as observableOf,
    forkJoin as observableForkJoin,
    Observable,
    from,
    Subscription,
} from 'rxjs';
import { catchError, map, concatMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { Api, ApiId, Resources, Labels, Fields, Field } from 'app/types/common';
import { Apis } from 'app/constants/apis';
import { ErrorData } from 'app/types/error-data';
import { SettingParams } from 'app/types/user-setting';
import { InitializeApiResult } from 'app/types/common';
import { MimeType } from 'app/constants/mime-types';
import { StatusCodes } from 'app/constants/status_codes';
import { AuthenticationStatus } from 'app/constants/authentication-status';
import { ErrorCodes } from 'app/constants/error_codes';
import { ResourceService } from 'app/services/api/resource.service';
import { UserSettingService } from 'app/services/api/user-setting.service';
import { AuthenticationService } from 'app/services/shared/authentication.service';
import { EntranceService } from 'app/services/shared/entrance.service';
import { LogKindConst } from 'app/constants/api/log-kind-const';
import { environment } from 'environments/environment';
import { kmtMakerCode } from 'app/constants/car';
import { AuthData } from 'app/types/auth-data';
import { SearchItems } from 'app/types/search';

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

    public currentScreenCode: string;
    public initialResouce: Resources;
    private catalogApiCache: Api;
    private labelsApiCache: { [screenCode: string]: Labels } = {};
    private commonResouceCache: Resources;
    private userSettingsApiCache: Api;
    private catalogGroups: { [key: string]: any }[];
    private settings = (window as any).settings;
    private appCode = this.settings.azureAdAuthenticationInfo.clientId;
    private queue: { [key: string]: Subscription } = {};
    private callableApis: CallableApi[];

    constructor(
        private http: HttpClient,
        private resource: ResourceService,
        private userSettingService: UserSettingService,
        private authService: AuthenticationService,
        private entranceService: EntranceService,
        @Inject(DOCUMENT) private document: any
    ) { }

    /*
     * ファイルアップロード処理
     */
    public uploadFile(path: ApiId, file: File, json: string, screenCode?: string): Observable<Api> {
        const formData: FormData = new FormData();

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
     * @param screenCode 画面 ID
     * @param handler requestHandler() に渡すハンドラ名
     * @param apis 各画面で必要な API
     * @param opt オプション
     */
    public async callApisForInitialize(
        screenCode: string,
        handler: string,
        apis?: { [name: string]: (() => Observable<any>) | ApiId },
        opt?: any
    ): Promise<InitializeApiResult> {
        await this._prepareForInitialize();
        return this._initialize(screenCode, handler, apis, opt);
    }

    /**
     * 指定項目リソース取得 API
     * @param functionCode 機能コード
     * @param opt オプション
     */
    public fetchFieldResources(functionCode: string, opt?: any): Observable<Fields> {
        return this.get(
            Apis.getApplicationsFieldsResources,
            { function_code: functionCode },
            opt
        ).pipe(
            map((res: Api) => {
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
    public fetchFields(
        functionCode: string,
        opt?: any,
        searchParameters?: string
    ): Observable<Fields> {
        const params = {
            function_code: functionCode,
            field_set_no: '1',
            search_parameter: searchParameters,
        };

        return this.get(Apis.getApplicationsFields, params, opt).pipe(
            map((res: Api) => {
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
    public fetchFieldsWithWordBreak(
        functionCode: string,
        opt?: any,
        searchParameters?: string
    ): Observable<Fields> {
        const wordBreakMark = /##/g;

        return this.fetchFields(functionCode, opt, searchParameters).pipe(map((fields: Fields) =>
            fields.map((field: Field) => ({
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
    public updateField(
        functionCode: string,
        fieldItems: any[],
        opt?: any
    ): Promise<Api> {
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
                this.put(Apis.putApplicationsFields, params, opt).subscribe((res: Api) => {
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
    public fetchSearchCondition(screenCode: string, opt?: any): Observable<SearchItems> {
        return this.get(
            Apis.getApplicationsSearchCondition,
            { screen_code: screenCode, search_set_no: '1' },
            opt
        ).pipe(
            map((res: Api) => {
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
    public updateSearchCondition(
        screenCode: string,
        searchItems: SearchItems,
        opt?: any
    ): Promise<Api> {
        const params = {
            screen_code: screenCode,
            search_set_no: '1',
            search_items: searchItems,
        };

        return new Promise((resolve, reject) => {
            this.requestHandler(
                'updateSearchCondition',
                this.put(Apis.putApplicationsSearchCondition, params, opt).subscribe(
                    (res: Api) => resolve(res)
                )
            );
        });
    }

    /**
     * 検索条件初期化APIリクエスト
     * @param screenCode 画面コード
     * @param opt オプション
     */
    public initSearchCondition(screenCode: string, opt?: any): Promise<Api> {
        const params = { screen_code: screenCode, search_set_no: '1' };
        return new Promise((resolve, reject) => {
            this.requestHandler(
                'initSearchCondition',
                this.delete(
                    Apis.deleteApplicationsSearchCondition,
                    params,
                    opt
                ).subscribe((res: Api) => resolve(res))
            );
        });
    }

    /**
     * APIリクエスト制御
     *
     * @param queueName 呼び出し先となるユニークなメソッド名
     * @param observable キューに追加する Observable オブジェクト
     */
    public requestHandler(queueName: string, observable: Subscription): void {
        // 呼び出し先メソッド名のプロパティが存在していた場合はリクエストをキャンセルする
        if (this.queue[queueName]) {
            this.queue[queueName].unsubscribe();
        }

        this.queue[queueName] = observable;
    }

    /**
     * 共通のget処理
     *
     * @param apiId API の ID
     * @param params API パラメータ
     * @param opt リクエストオプション
     * @return Observable オブジェクト
     */
    public get(apiId: ApiId, params?: any, opt?: any): Observable<Api> {
        const config = {
            method: 'GET',
            url: this._getApiUrl(apiId),
            search: params,
        };

        return this._call(config, opt);
    }

    /**
     * 共通のpost処理
     *
     * @param apiId API の ID
     * @param params API パラメータ
     * @param opt リクエストオプション
     * @return Observable オブジェクト
     */
    public post(apiId: ApiId, params: any, opt?: any): Observable<Api> {
        const config = {
            method: 'POST',
            url: this._getApiUrl(apiId),
            params: params,
        };

        return this._call(config, opt);
    }

    /**
     * 共通のupdate処理
     *
     * @param apiId API の ID
     * @param params API パラメータ
     * @param opt リクエストオプション
     * @return Observable オブジェクト
     */
    public put(apiId: ApiId, params: any, opt?: any): Observable<Api> {
        const config = {
            method: 'PUT',
            url: this._getApiUrl(apiId),
            params: params,
        };

        return this._call(config, opt);
    }

    /**
     * 共通のdelete処理
     *
     * @param apiId API の ID
     * @param opt リクエストオプション
     * @return Observable オブジェクト
     */
    public delete(apiId: ApiId, params?: any, opt?: any): Observable<Api> {
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
    public fetchDivisionList(params: any): Promise<Api> {
        return new Promise((resolve, reject) => {
            this.requestHandler(
                'fetchDivisionList',
                this.get(Apis.getApplicationsModelTypes, {
                    ...params,
                    maker_code: params.maker_code || kmtMakerCode,
                }).subscribe((res: Api) => {
                    resolve(res);
                })
            );
        });
    }

    /**
     * ユーザ設定更新API
     * @param params API パラメータ
     */
    public updateUserSettings(params: SettingParams): Promise<Api> {
        return new Promise((resolve, reject) => {
            this.requestHandler(
                'updateUserSettings',
                this.put(Apis.putUserSettings, params).subscribe((res: Api) => {
                    this.userSettingService.updateUserConfigValues(params.user_settings);
                    resolve(res);
                })
            );
        });
    }

    /**
     * ファイルダウンロード API
     * @param fileId ファイル ID
     * @param contentType ファイル形式
     * @param opt オプション
     */
    public downloadFile(fileId: string, contentType: string, opt?: any): Promise<void> {
        const options = {
            responseType: 'blob',
            request_header: {
                Accept: `application/json,${contentType}`,
                'Content-Type': '',
            },
        };

        return new Promise<void>((resolve, reject) => {
            this.requestHandler(
                'dowloadFile',
                this.get(
                    {
                        apiId: Apis.getApplicationsFiles_fileId_,
                        params: [fileId],
                    },
                    {},
                    options
                ).subscribe({
                    next: (res: any) => {
                        this._saveFile(res.file, res.fileName);
                        resolve();
                    },
                    error: (e) => reject(e)
                })
            );
        });
    }

    /**
     * リソース情報取得 API
     * @param screenCode 画面 ID
     * @param opt オプション
     */
    public fetchResource(
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
            map((res: Api) => {
                const result = this.resource.parse(res.result_data);
                // 検索条件なしのリソース取得
                if (
                    _.get(searchParameters, '[0].condition_sets[0].condition') == null
                ) {
                    this.initialResouce = _.merge(this.initialResouce, result);
                }

                return this.resource.parse(res.result_data);
            }
            )
        );
    }

    /**
     * 共通系リソース取得（キャッシュ対応）
     */
    public fetchCommonResouce(screenCode: string, opt?: any): Observable<any> {
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
    public fetchLabels(screenCode: string, opt?: any): Observable<Labels> {
        const cache: Labels = this.labelsApiCache[screenCode];

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
                    (temp: any, item: any) => {
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
    public postLog(
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
    public fetchCatalog(opt?: any): Promise<Api> {
        return new Promise((resolve, reject) => {
            this.requestHandler(
                'fetchCatalog',
                this._getCatalog(opt).subscribe({
                    next: (res) => resolve(res),
                    error: (e) => reject(e)
                })
            );
        });
    }

    /**
     * 実行可能API取得API
     * @param opt オプション
     */
    public fetchUserSettings(opt?: any): Promise<Api> {
        return new Promise((resolve, reject) => {
            this.requestHandler(
                'fetchUserSettings',
                this._getUserSetting(opt).subscribe({
                    next: (res) => resolve(res),
                    error: (e) => reject(e)
                })
            );
        });
    }

    public getCatalogApiUrl(): string {
        return `${this.settings.protocol}://${this.settings.hostname}/catalog`;
    }

    public getLogApiUrl(): string {
        return this._getApiUrl(Apis.postApplicationsExtapplog);
    }

    public getUserSettingsApiUrl(): string {
        return `${this.settings.userSettingsEndpoint}`;
    }

    public getGroupId(): string {
        return localStorage.getItem(`group_id.${this.appCode}`);
    }

    public getCurrentGroup(): { [key: string]: any } {
        const groupId: string = this.getGroupId();
        return this.catalogGroups.find((group: { [key: string]: any }) => group.id === groupId);
    }

    /**
     * 実行可能APIで取得したグループを保存する
     * @param groups グループ
     */
    public setGroups(groups: { [key: string]: any }[]): void {
        this.catalogGroups = groups;
    }

    /**
     * @param apis APIリスト
     */
    public setCallableApis(apis: CallableApi[]): void {
        this.callableApis = apis;
    }

    /**
     * 画面の初期化の前処理として、実行可能API一覧取得APIと未取得の場合にユーザ設定取得APIをコールします。
     */
    private async _prepareForInitialize(): Promise<void> {
        const [res1, res2] = await Promise.all([
            this.fetchCatalog(),
            this.fetchUserSettings(),
        ]);
        const { apis, groups } = res1.result_data.user;
        this.callableApis = apis;
        this.catalogGroups = groups;
        if (res2) {
            this.userSettingService.updateConfigValues(res2.result_data);
        }
    }

    /**
     * ApiIdからAPIのURLを逆引きする
     */
    private _getApiUrl(apiId: ApiId): string {
        if (this.callableApis == null) {
            return null;
        }

        const api: CallableApi = this.callableApis.find((_api: CallableApi) =>
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
    private _saveFile(file: Blob, fileName: string): void {
        // 参考 http://qiita.com/wadahiro/items/eb50ac6bbe2e18cf8813
        const nav = window.navigator as any;
        if (nav && nav.msSaveBlob) {
            nav.msSaveOrOpenBlob(file, fileName);
        } else {
            const anchor: HTMLAnchorElement = document.createElement('a');
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
            map((res: Api) => {
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
            map((res: Api) => {
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
        const promise: Promise<InitializeApiResult> = new Promise<InitializeApiResult>((resolve, reject) => {
            if (apis == null) {
                apis = {};
            }

            let searchParameters = null;

            if (_.has(opt, 'search_parameters')) {
                searchParameters = opt.search_parameters;
                opt = _.omit(opt, 'search_parameters');
            }
            // 引数のオブジェクトをキーの配列とすることでパラメータの順番を固定化する
            const commonApiCallers: Observable<any>[] = [
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
                (temp: any, key: any) => {
                    if (typeof apis[key] === 'function') {
                        temp[0][key] = apis[key];
                    } else {
                        temp[1][key] = apis[key];
                    }
                    return temp;
                },
                [{}, {}]
            );
            const keys: string[] = Object.keys(observables);

            this.requestHandler(
                handler,
                observableForkJoin(
                    commonApiCallers.concat(keys.map((key: string) => observables[key]()))
                ).subscribe((res: any) => {
                    let index = commonApiCallers.length;
                    const result: InitializeApiResult = <InitializeApiResult>{
                        resource: _.merge({}, res[1], res[0]),
                        label: _.merge({}, res[2], {
                            _common: res[3],
                        }),
                        functions: res[4],
                    };

                    keys.forEach((_key: string) => (result[_key] = res[index++]));
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
                this.postLog(screenCodeIndex, LogKindConst.access_log, '').subscribe()
            );
        });

        return promise;
    }

    /**
     * API呼出処理
     *
     * @param config リクエストパラメータ
     * @return Observable オブジェクト
     */
    private _call(config: any, opt?: any): Observable<Api> {
        if (!this._isCallable(config)) {
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
                const params: HttpParams = new HttpParams({
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
                        default:
                            return null;
                    }
                })().pipe(
                    map(
                        (res: HttpResponse<Api>) =>
                            this.extractData(res as HttpResponse<any>, responseType) as Api
                    ),
                    catchError((err: any) => {
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

                                this.authService.auth()
                                    .run()
                                    .then((res: { status: number }) => {
                                        if (res.status !== AuthenticationStatus.hasNotYetAcquired) {
                                            location.href = localStorage.getItem(
                                                environment.settings.appPrefix + '-entrance-next'
                                            );
                                        }
                                    });
                            }

                            return observableOf(err);
                        } else {
                            err._type = 'ApiError';

                            return this._handleError(err);
                        }
                    })
                );
            })
        );
    }

    private extractData(res: HttpResponse<Api>, responseType: string): any {
        const header = {
            result_header: {
                'X-From': res.headers.get('X-From'),
                'X-TotalCount': res.headers.get('X-TotalCount'),
                'X-Count': res.headers.get('X-Count'),
                'X-Sort': res.headers.get('X-Sort'),
            },
        };

        const contentType: string = res.headers.get('Content-Type');
        if (
            contentType &&
            (contentType.match(new RegExp(MimeType.excel)) ||
                contentType.match(new RegExp(MimeType.csv)) ||
                contentType.match(new RegExp(MimeType.tsv)) ||
                contentType.match(new RegExp(MimeType.octetStream)))
        ) {

            const response: { status: number; file?: any; fileName?: string } = {
                status: res.status
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
        const body: any = res.body;
        const status: { status: number } = {
            status: res.status,
        };
        return _.merge(header, body, status);
    }

    private _handleError(error: ErrorData): Observable<any> {
        return observableThrowError(() => error);
    }

    private _parseContentDisposition(contentDisposition?: string): string {
        if (contentDisposition == null) {
            return null;
        }

        const fileNameMatch: RegExpMatchArray = contentDisposition.match(/filename\*=utf-8''(.+)/);
        const uriFileName: string = fileNameMatch && fileNameMatch[1];

        if (uriFileName == null) {
            return null;
        }

        const fileName: string = decodeURIComponent(uriFileName);

        return fileName.replace(/tsv$/, 'csv');
    }

    /**
     * API をコール可能であるか判定する。
     * @param config API の url
     */
    private _isCallable(config: any): boolean {
        if (this.callableApis == null) {
            return true;
        }

        const anchorBase: HTMLAnchorElement = document.createElement('a');
        const anchorCompare: HTMLAnchorElement = document.createElement('a');
        anchorBase.href = config.url;

        const placeholder = 'PARAM_PLACEHOLDER';
        const target: string[] = anchorBase.pathname
            .split('/')
            .map((p: string) => {
                if (/^\d+$/.test(p)) {
                    return placeholder;
                }
                return p;
            })
            .filter((p: string) => p !== '');

        let compare;
        const result: boolean =
            this.callableApis.find((el: CallableApi) => {
                anchorCompare.href = el.url.replace(/{\w+}/g, placeholder);
                compare = anchorCompare.pathname.split('/').filter((p: string) => p !== '');
                return config.method === el.http_method && _.isEqual(target, compare);
            }) != null;

        return result;
    }

    /**
     * API へのリクエスト時のパラメータのうち、値が空でない有効なパラメータのみを選択し返す。
     * @param params リクエストパラメータ
     * @param exclusionKey 除外対象キー
     */
    private _pickAvailableParams(
        params: any,
        exclusionKey: string[],
        keys: string = '',
        isArray: boolean = false
    ): any {
        const initValue: {} | [] = _.isArray(params) ? [] : {};

        // ファイルアップロード：パラメータとして FormData が渡された場合そのまま通す
        if (Object.prototype.toString.call(params) === '[object FormData]') {
            return params;
        }

        return _.reduce(
            params,
            (obj: any, value: any, key: string) => {
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
                    ).filter((val: number) => val === 0 || !!val);
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
     * 共通のリクエストヘッダを設定する。
     * @param opt リクエストオプション
     */
    private _requestHeaders(opt: any): { [key: string]: string } {
        const headers: { [key: string]: any } = _.merge(
            {
                Accept: 'application/json',
                'X-AppCode': this.appCode,
                'X-ScreenCode': (opt && opt.screenCode) || this.currentScreenCode || '',
            },
            !opt.isUpload ? { 'Content-Type': 'application/json' } : null,
            this.userSettingService.getRequestHeaders()
        );

        const xGroupId: string = this.getGroupId();
        if (xGroupId) {
            headers['X-GroupId'] = xGroupId;
        }

        const authData: AuthData = this.authService.getAuthData();
        headers['Authorization'] = `Bearer ${authData.accessToken}`;

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
    private _getFileExtension(contentType: string): string {
        switch (contentType) {
            case MimeType.csv:
            case MimeType.tsv:
                return 'csv';

            case MimeType.excel:
            default:
                return 'xlsx';
        }
    }

}