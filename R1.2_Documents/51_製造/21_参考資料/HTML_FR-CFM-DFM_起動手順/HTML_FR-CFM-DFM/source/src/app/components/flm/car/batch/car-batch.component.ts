import { Component, ViewChild, TemplateRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import { CarTemplateCreateParams } from '../../../../types/flm/car';

import { ScreenCode } from '../../../../constants/flm/screen-codes/car-management';
import { KbaMimeType } from '../../../../constants/mime-types';
import { ProcessingType } from '../../../../constants/download';

import { KbaAbstractBaseComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-base-compoenent';
import { KbaSelectTypeComponent } from '../../../shared/kba-select-type/kba-select-type.component';

import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ApiService } from '../../../../services/api/api.service';
import { KbaFileUploadService } from '../../../../services/shared/kba-file-upload.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { CarService } from '../../../../services/flm/car/car.service';
import { Apis } from '../../../../constants/apis';

@Component({
  selector: 'app-car-batch',
  templateUrl: './car-batch.component.html',
  styleUrls: ['./car-batch.component.scss'],
})
export class CarBatchComponent extends KbaAbstractBaseComponent {
  @ViewChild('uploadResultModalContent', { static: false })
  uploadResultModalContent: TemplateRef<null>;
  @ViewChild('supportDistributorSelect', { static: false })
  supportDistributorSelect: KbaSelectTypeComponent;

  uploadPath = Apis.postCarsManagementUpload;
  listVal;
  thList;
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

  constructor(
    nav: KbaNavigationService,
    title: Title,
    private header: CommonHeaderService,
    private api: ApiService,
    private alertService: KbaAlertService,
    private fileUploadService: KbaFileUploadService,
    private modalService: KbaModalService,
    private carService: CarService
  ) {
    super(nav, title);

    this.api.currentScreenCode = ScreenCode.templateRegist;
    this.api
      .callApisForInitialize(ScreenCode.templateRegist, 'carBatch')
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
  async onClickDownload(): Promise<void> {
    this._showLoadingSpinner();
    try {
      const fieldItems = await this.carService.fetchCarBatchDownloadFields();
      const xFields = this._createXFields(fieldItems);

      const res = await this.carService.templateCreate(
        this._createTemplateCreateParams(),
        xFields
      );
      await this.api.downloadFile(res.result_data.file_id, KbaMimeType.excel);
    } finally {
      this._hideLoadingSpinner();
    }
  }

  /**
   * 車両一括登録テンプレートファイル作成APIリクエストパラメータ作成
   */
  private _createTemplateCreateParams(): CarTemplateCreateParams {
    if (this.supportDistributorSelect) {
      return {
        file_content_type: KbaMimeType.excel,
        support_distributor_id: this.supportDistributorSelect.getSelectedParam(),
      };
    } else {
      return {
        file_content_type: KbaMimeType.excel,
      };
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
    let result;

    const list = res.map(r => {
      result = { result: { type: 'result', success: true }, message: '' };

      [
        'car.car_identification.maker_name',
        'car.car_identification.model',
        'car.car_identification.type_rev',
        'car.car_identification.serial',
      ].forEach(path => (result[path] = _.get(r.request, path)));

      if (r.error_data) {
        result.message = _.map(r.error_data, e => e.message);
        result.result = { type: 'result', success: false };
        result['css_class'] = 'warning';
        errorsLength++;
      } else if (r.result_data && r.result_data.warning_data && r.result_data.warning_data.length > 0) {
        result.result = { type: 'result', success: true, warning: true };
        result.message = _.map(r.result_data.warning_data, e => e.message);
        result['css_class'] = 'has-warning-data';
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
    return [
      {
        label: this.labels.maker_name,
        name: 'car.car_identification.maker_name',
        displayable: true,
      },
      {
        label: this.labels.model,
        name: 'car.car_identification.model',
        displayable: true,
      },
      {
        label: this.labels.type,
        name: 'car.car_identification.type_rev',
        displayable: true,
      },
      {
        label: this.labels.serial,
        name: 'car.car_identification.serial',
        displayable: true,
      },
    ];
  }
}
