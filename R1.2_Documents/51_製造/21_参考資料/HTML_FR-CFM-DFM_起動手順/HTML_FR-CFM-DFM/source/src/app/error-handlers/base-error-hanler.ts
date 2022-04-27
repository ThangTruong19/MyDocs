import { Injector, ErrorHandler, Injectable, NgZone } from '@angular/core';
import * as _ from 'lodash';

import { KbaAlertService } from '../services/shared/kba-alert.service';
import { ApiService } from '../services/api/api.service';
import { LogKind } from '../services/api/log_kind';

import { Error } from '../constants/error';
import { environment } from '../../environments/environment';
import { ComponentRefService } from '../services/shared/component-ref.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class BaseErrorHandler implements ErrorHandler {
  lastErrors: string[] = [];
  errorsCount = 3;

  constructor(private injector: Injector, private ngZone: NgZone) { }

  handleError(error) {
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
    const now = +new Date();
    const rand = _.padStart(Math.floor(Math.random() * 100000), 5, '0');
    return `APPCD-${code}_${now}_${rand}`;
  }

  /**
   * エラーを処理する
   * @param error エラー
   * @param errorConstant エラー定数
   * @param potions オプション
   * @param additionalMessage 追加メッセージ（500系エラー用）
   */
  protected _handleError(
    error,
    errorConstant,
    options: { showAlert?: boolean; postLog?: boolean } = {
      showAlert: true,
      postLog: true,
    },
    additionalMessage: string = ''
  ) {
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

      const alertService = this.injector.get(KbaAlertService);
      const apiService = this.injector.get(ApiService);
      const complied = _.template(errorConstant.message + additionalMessage + '(${appCode})');
      const appCode = this._getAppCode(errorConstant.code);
      const message = _.truncate(
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
        const componentResource = componentRef.resource;
        const initialResource = apiService.initialResouce;
        let errorMessage: string | string[] = '';

        if (error.error_data) {
          errorMessage = _.uniq(
            error.error_data.map(errorData => {
              let mes: string = errorData.message;
              const target = mes.match(/{{.+?}}/g) || [];
              target.forEach(t => {
                const key = t.slice(2, -2);
                const resource =
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
          if (document.querySelector('.KBA-alert-messages') == null) {
            alert(errorMessage);
            alertService.close();
          }
        }, 1000);

        const spinner = document.querySelector('.KBA-spinner-upload')
        if (spinner) {
          spinner.remove();
        }
      }

      if (options.postLog !== false) {
        apiService.requestHandler(
          'handleError',
          apiService
            .postLog(apiService.currentScreenCode, LogKind.system_log, message)
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
  private async _handleErrorResponse(res: HttpErrorResponse) {
    const { url, status } = res;

    if (!url) {
      throw res;
    }

    let error_data: any[];
    const { error } = res;

    if (error == null) {
      error_data = null;
    } else if (error instanceof Blob) {
      const json = await new Promise<string>((resolve) => {
        const reader = new FileReader();
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

    const apiService = this.injector.get(ApiService);
    const catalogApiUrl = apiService.getCatalogApiUrl();
    const logApiUrl = apiService.getLogApiUrl();
    const errorObj = {
      error_data,
      status,
    };
    const additionalMessage = Error.apiErrorMessages[status] || '';

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
