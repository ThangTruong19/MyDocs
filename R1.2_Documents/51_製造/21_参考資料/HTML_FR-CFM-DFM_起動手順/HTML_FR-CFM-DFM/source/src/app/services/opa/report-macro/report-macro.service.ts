import { Injectable } from '@angular/core';

import { RequestHeaderParams } from '../../../types/request';

import { ScreenCode } from '../../../constants/opa/screen-codes/macro-report-management';
import { FunctionCode } from '../../../constants/opa/function-codes/macro-report-management';
import { Apis } from '../../../constants/apis';

import { ApiService } from '../../api/api.service';
import { Fields } from '../../../types/common';

@Injectable()
export class ReportMacroService {
  constructor(private api: ApiService) {}

  /**
   * レポートマクロ表示制御画面の初期化 API を呼び出す
   */
  fetchInitData() {
    this.api.currentScreenCode = ScreenCode.list;
    return this.api.callApisForInitialize(ScreenCode.list, 'fetchInitData', {
      fields: () => this.api.fetchFields(FunctionCode.listFunction),
    });
  }

  /**
   * レポートマクロ表示制御画面の一覧取得 API を呼び出す
   * @param params パラメータ
   * @param requestHeaderParams ヘッダ
   */
  fetchList(params, requestHeaderParams: RequestHeaderParams): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchList',
        this.api
          .get(Apis.getMacroReportsMacroSettings, params, {
            cache: false,
            request_header: requestHeaderParams,
          })
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * レポートマクロのファイル一覧取得 API を呼び出す
   * @param report_macro_code
   * @param params パラメータ
   */
  fetchMacroFiles(
    report_macro_code: string,
    params,
    requestHeaderParams: RequestHeaderParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'fetchMacroFiles',
        this.api
          .get(
            {
              apiId: Apis.getMacroReports_macroReportCode_MacroFiles,
              params: [report_macro_code],
            },
            params,
            { cache: false, request_header: requestHeaderParams }
          )
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  updateMacroSettings(params) {
    return new Promise((resolve, reject) => {
      this.api.requestHandler(
        'updateMacroSettings',
        this.api
          .put(Apis.putMacroReportsMacroSettings, params)
          .subscribe(res => {
            resolve(res);
          })
      );
    });
  }

  /**
   * 一覧/バージョン選択モーダル用指定項目取得
   */
  fetchIndexVersionFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchIndexVersionFields',
        this.api
          .fetchFields(FunctionCode.listVersionFunction)
          .subscribe(res => resolve(res))
      );
    });
  }

  /**
   * 一覧/確認モーダル用指定項目取得
   */
  fetchIndexConfirmFields() {
    return new Promise<Fields>((resolve) => {
      this.api.requestHandler(
        'fetchIndexConfirmFields',
        this.api
          .fetchFields(FunctionCode.listConfirmFunction)
          .subscribe(res => resolve(res))
      );
    });
  }
}
