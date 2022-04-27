import * as _ from 'lodash';
import { Title } from '@angular/platform-browser';
import { Component, ViewChild, TemplateRef } from '@angular/core';

import { ModalDescItem } from '../../../../types/common';

import { ScreenCode } from '../../../../constants/opa/screen-codes/business-type-management';
import { KbaMimeType } from '../../../../constants/mime-types';
import { ProcessingType } from '../../../../constants/download';

import { KbaAbstractBaseComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-base-compoenent';
import { KbaSelectTypeComponent } from '../../../shared/kba-select-type/kba-select-type.component';
import { BusinessTypeIndexParams } from '../../../../types/opa/business-type';

import { KbaFileUploadService } from '../../../../services/shared/kba-file-upload.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ApiService } from '../../../../services/api/api.service';
import { BusinessTypeService } from '../../../../services/opa/business-type/business-type.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { Apis } from '../../../../constants/apis';

@Component({
  selector: 'app-business-type-batch',
  templateUrl: './business-type-batch.component.html',
  styleUrls: ['./business-type-batch.component.scss'],
})
export class BusinessTypeBatchComponent extends KbaAbstractBaseComponent {
  @ViewChild('uploadResultModalContent', { static: false })
  uploadResultModalContent: TemplateRef<null>;
  @ViewChild('blockIdSelect', { static: false })
  blockIdSelect: KbaSelectTypeComponent;

  uploadPath = Apis.postBusinessTypesUpload;
  listVal: any[];
  thList: ModalDescItem[];
  resultCountMessage: string;
  params: BusinessTypeIndexParams = {
    block_id: '',
  };
  uploadJSON = JSON.stringify({
    file_upload_condition: {
      processing_type: ProcessingType.sync,
    },
  });

  constructor(
    nav: KbaNavigationService,
    title: Title,
    private header: CommonHeaderService,
    private api: ApiService,
    private fileUploadService: KbaFileUploadService,
    private modalService: KbaModalService,
    private alertService: KbaAlertService,
    private businessTypeService: BusinessTypeService
  ) {
    super(nav, title);

    this.api.currentScreenCode = ScreenCode.templateRegist;
    this.api
      .callApisForInitialize(ScreenCode.templateRegist, 'businessTypeBatch')
      .then(async (res: any) => {
        this.initialize(res);
        this.labels = res.label;
        this.resource = res.resource;
        this._setTitle();
        await this.header.setHeader(this.labels, this.resource, this.functions);
        this.onLoad();
      });
  }

  /**
   * アップロード開始時の処理
   */
  onUploadStart() {
    this._showLoadingSpinner();
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
    const params = {
      ...this.params,
      file_content_type: KbaMimeType.excel,
    };
    try {
      const res = await this.businessTypeService.requestBusinessTypeTemplateDownload(
        params
      );
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
    const compiledResultCountMessage = _.template(
      this.labels.result_count_message
    );
    this.resultCountMessage = compiledResultCountMessage({
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
    const list = res.map(r => {
      const result = { result: { type: 'result', success: true }, message: '' };

      ['business_type.block_label', 'business_type.item_names'].forEach(
        path => (result[path] = _.get(r.request, path))
      );

      if (r.error_data) {
        result.message = _.map(r.error_data, e => e.message);
        result.result = { type: 'result', success: false };
        result['css_class'] = 'warning';
        errorsLength++;
      }

      return result;
    });
    this.thList = this._getThList();

    return [list, errorsLength];
  }

  /**
   * リクエスト情報（アップロードしたExcel）をもとに結果モーダルのヘッダを作成
   */
  private _getThList() {
    return _.flatten([
      {
        label: this.labels.result,
        name: 'result',
        displayable: true,
      },
      this._createThListContent(),
      {
        label: this.labels.result_detail,
        name: 'message',
        displayable: true,
      },
    ]);
  }

  /**
   * 結果モーダルの入力項目部分の作成
   */
  private _createThListContent() {
    const thList = [
      {
        label: '',
        name: 'business_type.item_names',
        displayable: true,
      },
    ];

    if (_.has(this.resource, 'block_id')) {
      thList.unshift({
        label: this.resource.block_id.name,
        name: 'business_type.block_label',
        displayable: true,
      });
    }

    return thList;
  }
}
