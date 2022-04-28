import { Injector, ErrorHandler, Injectable, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import * as _ from 'lodash';
import { environment } from 'environments/environment';
import { Error } from 'app/constants/error';
import { Resource, Resources } from 'app/types/common';
import { LogKindConst } from 'app/constants/api/log-kind-const';
import { AlertService } from 'app/services/shared/alert.service';
import { ApiService } from 'app/services/api/api.service';
import { ComponentRefService } from 'app/services/shared/component-ref.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

    private lastErrors: string[] = [];
    private errorsCount = 3;

    constructor(
        private injector: Injector,
        private ngZone: NgZone
    ) {
    }

    handleError(error: any): void {
        this.ngZone.run(() => {
            if (error.rejection != null) {
                return this.handleError(error.rejection);
            }

            if (error._type === 'ApiError') {
                return this._handleErrorResponse(error);
            }

            if (error._type === 'ParseError') {
                return this._handleError(error, Error.jsonParseError);
            }

            if (error instanceof URIError) {
                return this._handleError(error, Error.uriError);
            }

            if (error instanceof SyntaxError) {
                return this._handleError(error, Error.syntaxError);
            }

            if (error instanceof ReferenceError) {
                return this._handleError(error, Error.referenceError);
            }

            if (error instanceof TypeError) {
                return this._handleError(error, Error.typeError);
            }

            throw error;
        });
    }

    /**
     * アプリコードを取得
     * @param code エラーコード
     */
    protected _getAppCode(code: string) {
        const now: number = +new Date();
        const rand: string = _.padStart(Math.floor(Math.random() * 100000).toString(), 5, '0');
        return `APPCD-${code}_${now}_${rand}`;
    }

    /**
     * エラーを処理する
     * @param error エラー
     * @param errorConstant エラー定数
     * @param options オプション
     * @param additionalMessage 追加メッセージ（500系エラー用）
     */
    protected _handleError(
        error: any,
        errorConstant: any,
        options: { showAlert?: boolean; postLog?: boolean } = {
            showAlert: true,
            postLog: true,
        },
        additionalMessage: string = ''
    ): void {
        this.ngZone.run(() => {
            if (error.stack != null) {
                if (this.lastErrors.includes(error.stack)) {
                    return;
                }

                this.lastErrors.push(error.stack);

                if (this.lastErrors.length === this.errorsCount) {
                    this.lastErrors.shift();
                }
            }

            const alertService: AlertService = this.injector.get(AlertService);
            const apiService: ApiService  = this.injector.get(ApiService);
            const complied: _.TemplateExecutor = _.template(errorConstant.message + additionalMessage + '(${appCode})');
            const appCode: string = this._getAppCode(errorConstant.code);
            const message: string = _.truncate(
                (`${appCode} ${errorConstant.message}` + error.stack
                    ? `\n${error.stack}`
                    : ''
                )
                    .split('\n')
                    .map(line => line.trim())
                    .join('\n'),
                {
                    length: 800,
                    omission: '',
                }
            );
            const { componentRef } = this.injector.get(ComponentRefService);
            componentRef.isFetching = false;

            if (options.showAlert !== false) {
                const componentResource: Resources = componentRef.resource;
                const initialResource: Resources = apiService.initialResouce;
                let errorMessage: string | string[] = '';

                if (error.error_data) {
                    errorMessage = _.uniq(
                        error.error_data.map((errorData: any) => {
                            let mes: string = errorData.message;
                            const target: RegExpMatchArray = mes.match(/{{.+?}}/g) || [];
                            target.forEach(t => {
                                const key: string = t.slice(2, -2);
                                const resource: Resources & Resource =
                                    _.get(componentResource, key) || _.get(initialResource, key);

                                if (resource != null && resource.name != null) {
                                    mes = mes.replace(t, resource.name);
                                }
                            });

                            return `[${errorData.code}] ${mes}`;
                        })
                    );
                } else {
                    errorMessage = complied({ appCode });
                }
                alertService.show(errorMessage, true, 'danger');

                setTimeout(() => {
                    if (document.querySelector('.app-alert-messages') == null) {
                        alert(errorMessage);
                        alertService.close();
                    }
                }, 1000);

                const spinner: Element = document.querySelector('.app-spinner-upload')
                if (spinner) {
                    spinner.remove();
                }
            }

            if (options.postLog !== false) {
                apiService.requestHandler(
                    'handleError',
                    apiService
                        .postLog(apiService.currentScreenCode, LogKindConst.system_log, message)
                        .subscribe()
                );
            }

            if (!environment.production) {
                console.error(error);
            }
        });
    }

    /**
     * APIのエラーレスポンスを処理する
     * @param res エラー
     */
    private async _handleErrorResponse(res: HttpErrorResponse): Promise<void> {

        const { url, status } = res;

        if (!url) {
            throw res;
        }

        let error_data: any[];
        const { error } = res;

        if (error == null) {
            error_data = null;
        } else if (error instanceof Blob) {
            const json: string = await new Promise<string>((resolve) => {
                const reader: FileReader = new FileReader();
                reader.onload = () => {
                    setTimeout(() => {
                        resolve(reader.result as string);
                    });
                };
                reader.readAsText(error, 'utf8');
            });
            error_data = JSON.parse(json).error_data;
        } else {
            error_data = error.error_data;
        }

        const apiService: ApiService = this.injector.get(ApiService);
        const catalogApiUrl: string = apiService.getCatalogApiUrl();
        const logApiUrl: string = apiService.getLogApiUrl();
        const errorObj: {
            error_data: any[];
            status: number;
        } = {
            error_data,
            status,
        };
        const additionalMessage: string = Error.apiErrorMessages[status] || '';

        switch (url) {
            case catalogApiUrl:
                this._handleError(errorObj, Error.catalogApiError, { postLog: false }, additionalMessage);
                break;
            case logApiUrl:
                this._handleError(errorObj, Error.logApiError, {
                    postLog: false,
                    showAlert: false,
                }, additionalMessage);
                break;
            default:
                this._handleError(errorObj, Error.apiError, { postLog: false }, additionalMessage);
                break;
        }
    }

}
