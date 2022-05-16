import * as _ from 'lodash';
import { Component, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { DatePickerParams } from 'app/types/calendar';
import { Fields, Labels } from 'app/types/common';

import { DateFormat } from 'app/constants/date-format';

import { AbstractIndexComponent } from 'app/components/shared/abstract-component/abstract-index.component';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { ModalService } from 'app/services/shared/modal.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { AlertService } from 'app/services/shared/alert.service';
import { ApiService } from 'app/services/api/api.service';
import { CsUploadService } from 'app/services/cs-upload/cs-upload.service';
import { DatePickerService } from 'app/services/shared//date-picker.service';
import { UserSettingService } from 'app/services/api/user-setting.service';

import { MimeType } from 'app/constants/mime-types';
import { CustomizeSettingUploadService } from 'app/services/customize-setting-upload/customize-setting-upload.service';
import { CarTemplateCreateParams } from 'app/types/car';
import { Apis } from 'app/constants/apis';

@Component({
  selector: 'cdsm_customize_setting_upload',
  templateUrl: './cs-upload.component.html',
  styleUrls: ['./cs-upload.component.scss'],
})
export class CsUploadComponent extends AbstractIndexComponent {

  @ViewChild('uploadResultModalContent', { static: false })
  uploadResultModalContent: TemplateRef<null>;

  datePickerParams: DatePickerParams;
  fields: Fields;
  downloadFields: Fields;
  downloadFieldResources: Fields;
  fieldSelectPopoverVisible = false;
  downloadPopoverVisible = false;
  _dateFormat = '';
  timeZone = '';
  enableDateRange: string[] = [];
  beginningWday: number;
  excludeSearchParams: string[] = ['date_from_formatted', 'date_to_formatted'];
  datePickerLabels: Labels;
  override commaSeparated: string[] = ['serials'];

  uploadPath = Apis.postOperatorsUpload;
  listVal: any;
  compiledResultCountMessage: (src: {
    total: number;
    success: number;
    fail: number;
  }) => string;

  constructor(
    navigationService: NavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    protected csUploadService: CsUploadService,
    protected api: ApiService,
    protected override modalService: ModalService,
    protected alertService: AlertService,
    protected datePickerService: DatePickerService,
    protected userSettingService: UserSettingService,

    private uploadService: CustomizeSettingUploadService
  ) {
    super(navigationService, title, router, ref, header);
  }

  /**
   * 現在のパラメータを一覧取得APIに引き渡し、一覧画面に表示するリストを取得する
   * @param sort_key ソートキー
   */
  async fetchList(sort_key?: string): Promise<void> {
    this.isFetching = true;
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    // const params: HistoryMgtListIndexParams = {
    //   customize_operation_history: _.omit(
    //     this.searchParams,
    //     this.excludeSearchParams
    //   )
    // };
    // const res = await this.csUploadService.fetchIndexList(
    //   params,
    //   this.requestHeaderParams
    // );
    // if (res.result_data.customize_operation_histories) {
    //   const list = this._formatList(
    //     res.result_data.customize_operation_histories,
    //     this.thList
    //   );
    //   this._fillLists(res.result_header, list);
    // }
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * 初期化 API を呼ぶ
   */
  protected async _fetchDataForInitialize(): Promise<void> {
    const res: any = await this.csUploadService.fetchIndexInitData();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this.updatable = res.updatable;
    this.deletable = res.deletable;
    this._updateFields(res.fields);
    this.fieldResources = res.fieldResources;
    this.downloadFields = res.downloadFields;
    this.downloadFieldResources = res.downloadFieldResources;
    this._datePickerInitialize();
  }

  /**
   * 指定項目を更新
   * @param fields 指定項目
   */
  protected _updateFields(fields: any): void {
    this.fields = fields;
    this.thList = this._createThList(fields);
    this.sortableThList = this.sortableThLists(this.thList);
    this._reflectXFields(fields);
  }

  /**
   * デートピッカーの初期化
   */
  private async _datePickerInitialize(): Promise<any> {
    const datePickerConfig = this.userSettingService.getDatePickerConfig();
    this.beginningWday = datePickerConfig.first_day_of_week_kind;
    const _window = window as any;
    this.enableDateRange = _window.settings.datePickerRange.other;
    this._dateFormat = datePickerConfig.date_format_code;
    this.timeZone = datePickerConfig.time_difference;

    this.datePickerParams = {
      timeZone: this.timeZone,
      dateFormat: this._dateFormat,
    };

    this.datePickerService.initialize(this.datePickerParams);

    const today = this.datePickerService.toMoment();

    _.set(
      this.params,
      'date_from',
      today.clone().subtract(1, 'month').format(DateFormat.hyphen)
    );
    _.set(
      this.params,
      'date_from_formatted',
      today
        .clone()
        .subtract(1, 'month')
        .format(this.datePickerService.inputDateFormat(this._dateFormat))
    );
    _.set(this.params, 'date_to', today.format(DateFormat.hyphen));
    _.set(
      this.params,
      'date_to_formatted',
      today.format(this.datePickerService.inputDateFormat(this._dateFormat))
    );
  }









    /**
     * ダウンロードボタン押下時の処理
     */
    async onClickDownload(): Promise<void> {
      this._showLoadingSpinner();
      try {
        const fieldItems = await this.uploadService.fetchCarBatchDownloadFields();
        const xFields = this._createXFields(fieldItems);

        const res = await this.uploadService.templateCreate(
          this._createTemplateCreateParams(),
          xFields
        );
        await this.api.downloadFile(res.result_data.file_id, MimeType.excel);
      } finally {
        this._hideLoadingSpinner();
      }
    }

    /**
     * 車両一括登録テンプレートファイル作成APIリクエストパラメータ作成
     */
    private _createTemplateCreateParams(): CarTemplateCreateParams {
      // if (this.supportDistributorSelect) {
      //   return {
      //     file_content_type: MimeType.excel,
      //     support_distributor_id: this.supportDistributorSelect.getSelectedParam(),
      //   };
      // } else {
        return {
          file_content_type: MimeType.excel,
        };
      // }
    }

    /**
     * アップロード後の処理
     * @param res API のレスポンス
     */
    onUploadEnd(res: any) {
      this._hideLoadingSpinner();
      this._updateResultModalData(res);
      this.modalService.open(
        {
          title: this.labels.result_modal_title,
          labels: this.labels,
          content: this.uploadResultModalContent,
        },
        {
          size: 'lg',
        }
      );
    }

    /**
     * アップロード失敗時の処理
     * @param error エラー
     */
    onUploadFail(error: any) {
      this._hideLoadingSpinner();
    }

    /**
   * アップロード結果モーダルのデータを更新
   * @param res API レスポンス
   */
  private _updateResultModalData(res: any) {
    let errorsLength;
    [this.listVal, errorsLength] = this._formatUploadResultData(res.responses);
    // this.resultCountMessage = this.compiledResultCountMessage({
    //   total: this.listVal.length,
    //   success: this.listVal.length - errorsLength,
    //   fail: errorsLength,
    // });
  }

  /**
   * アップロード結果を整形する
   * @param res API レスポンス
   */
   private _formatUploadResultData(res: any) {
    let errorsLength = 0;
    let result: any,
      isError = false;

    const list = res.map((r: any) => {
      result = { result: { type: 'result', success: true }, message: '' };

      [
        'response_code',
        'change_type',
        'brand',
        'type',
        'model',
        'serial_number',
        'customize_usage_definition_label',
        'version',
        'priority',
        'start_day',
        'end_day',
        'time_before_effect',
        'error_msg',

        /* 'customer_label',
        'operator.code',
        'operator.current_label.label',*/
      ].forEach(path => {
        const value = _.get(r.request, path);
        // if (
        //   path === 'operator.current_label.label' &&
        //   value &&
        //   _.get(this.resource, 'operator_label')
        // ) {
        //   showLabel = true;
        // }

        if (path === 'response_code' && value == '400') {
          isError = true;
        }
        result[path] = value;
      });

      if (isError) {
        result.result = { type: 'result', success: false };
        result['css_class'] = 'warning';
      }

      return result;
    });
    this.thList = this._getThList(isError);

    return [list, errorsLength];
  }

    /**
   * リクエスト情報（アップロードしたExcel）をもとに結果モーダルのヘッダを作成
   */
     private _getThList(isError: boolean) {

      if (isError) {
        return [{
          label: this.labels.error_msg,
          name: 'error_msg',
          displayable: true,
        }];
      }

      return _.flatten([
        /*{
          label: this.labels.result,
          name: 'result',
          displayable: true,
        },*/
        {
          label: this.labels.change_type,
          name: 'change_type',
          displayable: true,
        },
        {
          label: this.labels.brand,
          name: 'brand',
          displayable: true,
        },
        {
          label: this.labels.type,
          name: 'type',
          displayable: true,
        },
        {
          label: this.labels.model,
          name: 'model',
          displayable: true,
        },
        {
          label: this.labels.serial_number,
          name: 'serial_number',
          displayable: true,
        },
        {
          label: this.labels.customize_usage_definition_label,
          name: 'customize_usage_definition_label',
          displayable: true,
        },
        {
          label: this.labels.version,
          name: 'version',
          displayable: true,
        },
        {
          label: this.labels.priority,
          name: 'priority',
          displayable: true,
        },
        {
          label: this.labels.start_day,
          name: 'start_day',
          displayable: true,
        },
        {
          label: this.labels.end_day,
          name: 'end_day',
          displayable: true,
        },
        {
          label: this.labels.time_before_effect,
          name: 'time_before_effect',
          displayable: true,
        },
        // this._createThListContent(showLabel),
        // {
        //   label: this.labels.result_detail,
        //   name: 'message',
        //   displayable: true,
        // },
      ]);
    }
}
