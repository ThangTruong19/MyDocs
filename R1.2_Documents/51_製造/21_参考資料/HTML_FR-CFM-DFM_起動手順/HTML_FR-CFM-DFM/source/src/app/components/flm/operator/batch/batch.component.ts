import { Component, ViewChild, TemplateRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import { ResultData } from '../../../../types/result-data';

import { ScreenCode } from '../../../../constants/flm/screen-codes/operator-management';
import { KbaMimeType } from '../../../../constants/mime-types';
import { ProcessingType } from '../../../../constants/download';

import { KbaAbstractBaseComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-base-compoenent';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ApiService } from '../../../../services/api/api.service';
import { KbaFileUploadService } from '../../../../services/shared/kba-file-upload.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { OperatorService } from '../../../../services/flm/operator/operator.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { Apis } from '../../../../constants/apis';
import { Fields } from '../../../../types/common';
import { FunctionCode } from '../../../../constants/flm/function-codes/operator-management';

@Component({
  selector: 'app-operator-id-batch',
  templateUrl: './batch.component.html',
  styleUrls: ['./batch.scss'],
})
export class OperatorIdBatchComponent extends KbaAbstractBaseComponent {
  @ViewChild('uploadResultModalContent', { static: false })
  uploadResultModalContent: TemplateRef<null>;
  uploadPath = Apis.postOperatorsUpload;
  listVal;
  thList;
  params = {
    file_content_type: KbaMimeType.excel,
  };
  resultCountMessage: string;
  uploadJSON = JSON.stringify({
    file_upload_condition: {
      processing_type: ProcessingType.sync,
    },
  });
  compiledResultCountMessage: (src: {
    total: number;
    success: number;
    fail: number;
  }) => string;
  downloadFields: string[];

  constructor(
    nav: KbaNavigationService,
    title: Title,
    private header: CommonHeaderService,
    private api: ApiService,
    private fileUploadService: KbaFileUploadService,
    private modalService: KbaModalService,
    private alertService: KbaAlertService,
    private operatorService: OperatorService
  ) {
    super(nav, title);

    this.api.currentScreenCode = ScreenCode.templateRegist;
    this.api
      .callApisForInitialize(ScreenCode.templateRegist, 'operatorBatch')
      .then(async (res: any) => {
        this.initialize(res);
        this.labels = res.label;
        this.resource = res.resource;
        this.compiledResultCountMessage = _.template(
          this.labels.result_count_message
        );
        this._setTitle();
        await this.header.setHeader(this.labels, this.resource, this.functions);
        this.onLoad();
      });
  }

  /**
   * アップロード後の処理
   * @param res API のレスポンス
   */
  onUploadEnd(res) {
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
  onUploadFail(error) {
    this._hideLoadingSpinner();
  }

  /**
   * ダウンロードボタン押下時の処理
   */
  async onClickDownload() {
    this._showLoadingSpinner();

    if (this.downloadFields == null) {
      const fieldItems =
        await this.api.fetchFields(FunctionCode.templateRegistDownloadFunction).toPromise();
      this.downloadFields = this._createXFields(fieldItems);
    }

    try {
      const res: any = await this.operatorService.templateCreate(this.params, this.downloadFields);
      await this.api.downloadFile(res.result_data.file_id, KbaMimeType.excel);
    } finally {
      this._hideLoadingSpinner();
    }
  }

  /**
   * アップロード結果モーダルのデータを更新
   * @param res API レスポンス
   */
  private _updateResultModalData(res) {
    let errorsLength;
    [this.listVal, errorsLength] = this._formatUploadResultData(res.responses);
    this.resultCountMessage = this.compiledResultCountMessage({
      total: this.listVal.length,
      success: this.listVal.length - errorsLength,
      fail: errorsLength,
    });
  }

  /**
   * アップロード結果を整形する
   * @param res API レスポンス
   */
  private _formatUploadResultData(res) {
    let errorsLength = 0;
    let result,
      showLabel = false;

    const list = res.map(r => {
      result = { result: { type: 'result', success: true }, message: '' };

      [
        'customer_label',
        'operator.code',
        'operator.current_label.label',
      ].forEach(path => {
        const value = _.get(r.request, path);
        if (
          path === 'operator.current_label.label' &&
          value &&
          _.get(this.resource, 'operator_label')
        ) {
          showLabel = true;
        }
        result[path] = value;
      });

      if (r.error_data) {
        result.message = _.map(r.error_data, e => e.message);
        result.result = { type: 'result', success: false };
        result['css_class'] = 'warning';
        errorsLength++;
      }

      return result;
    });
    this.thList = this._getThList(showLabel);

    return [list, errorsLength];
  }

  /**
   * リクエスト情報（アップロードしたExcel）をもとに結果モーダルのヘッダを作成
   */
  private _getThList(showLabel) {
    return _.flatten([
      {
        label: this.labels.result,
        name: 'result',
        displayable: true,
      },
      this._createThListContent(showLabel),
      {
        label: this.labels.result_detail,
        name: 'message',
        displayable: true,
      },
    ]);
  }

  private _createThListContent(showLabel) {
    const thList = [
      {
        label: this.labels.customer_label,
        name: 'customer_label',
        displayable: true,
      },
      {
        label: this.labels.operator_id,
        name: 'operator.code',
        displayable: true,
      },
    ];

    if (showLabel) {
      thList.push({
        label: this.resource.operator_label.name,
        name: 'operator.current_label.label',
        displayable: true,
      });
    }

    return thList;
  }
}
