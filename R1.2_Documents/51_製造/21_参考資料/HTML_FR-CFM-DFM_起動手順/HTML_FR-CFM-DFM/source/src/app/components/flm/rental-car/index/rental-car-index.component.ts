import {
  Component,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import {
  Fields,
  ModalValues,
  TableHeader,
  Labels,
} from '../../../../types/common';

import { KbaMimeType } from '../../../../constants/mime-types';

import { KbaAbstractIndexComponent } from '../../../shared/kba-abstract-component/kba-abstract-index-component';
import { ProcessingType } from '../../../../constants/download';
import { DateFormat } from '../../../../constants/date-format';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { RentalCarService } from '../../../../services/flm/rental-car/rental-car.service';
import { ApiService } from '../../../../services/api/api.service';
import { KbaDatePickerService } from '../../../../services/shared/kba-date-picker.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { Apis } from '../../../../constants/apis';

@Component({
  selector: 'app-rental-car-index',
  templateUrl: './rental-car-index.component.html',
  styleUrls: ['./rental-car-index.component.scss'],
})
export class RentalCarIndexComponent extends KbaAbstractIndexComponent {
  @ViewChild('historyModalContent', { static: false })
  historyModalContent: TemplateRef<null>;
  @ViewChild('uploadResultModalContent', { static: false })
  uploadResultModalContent: TemplateRef<null>;

  historyModalValues: ModalValues;
  downloadFields: Fields;
  params = {
    common: {
      car_identification: {
        division_codes: '',
        maker_codes: '',
        models: '',
        type_revs: '',
        serials: '',
      },
      customer_attribute: {
        customer_car_no: '',
      },
    },
    rental: {
      customer_id: '',
      date_from: '',
      date_to: '',
    },
  };
  uploadResultThList: TableHeader[];
  uploadResultVal: any[];
  uploadJSON = JSON.stringify({
    file_upload_condition: {
      process_type: ProcessingType.sync,
    },
  });
  wideColumns: number[];
  fixedColumns: number[];
  datePickerLabels: Labels;

  // デートピッカー関連
  beginningWday;
  enableDateRange;
  _dateFormat;
  timeZone;
  uploadPath = Apis.postCarsRentalUpload;
  datePickerParams: any;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    modal: KbaModalService,
    private rentalCarService: RentalCarService,
    private api: ApiService,
    private datePickerService: KbaDatePickerService,
    private alertService: KbaAlertService,
    private userSettingService: UserSettingService
  ) {
    super(nav, title, router, ref, header, modal);
  }

  async fetchList(sort_key?: string) {
    this.isFetching = true;
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    const res = await this.rentalCarService.fetchRentalCars(
      this.searchParams,
      this.requestHeaderParams
    );
    const list = this._formatList(res.result_data.cars, this.thList);
    this._fillLists(res.result_header, list);
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * 検索ボタン押下時のコールバック
   * @override
   */
  onClickSearch() {
    super.onClickSearch();
    this.fetchList(this.sortingParams.sort);
  }

  /**
   * 変更ボタン押下時のコールバック
   * @param data データ
   */
  onClickEdit(data) {
    this.router.navigate([
      'rental_cars',
      data['cars.car_identification.id'],
      'edit',
    ]);
  }

  /**
   * ファイルアップロード終了時のコールバック
   * @param res レスポンス
   */
  onUploadEnd(res) {
    this._hideLoadingSpinner();
    this.uploadResultVal = this._formatUploadResult(res.responses);

    this.resultCountMessage = _.template(this.labels.result_count_message)({
      total: res.responses.length,
      success: res.responses.filter(response => response.result_data != null)
        .length,
      fail: res.responses.filter(response => response.error_data != null)
        .length,
    });

    this.modalService.open(
      {
        title: this.labels.upload_result_modal_title,
        labels: this.labels,
        content: this.uploadResultModalContent,
        close: () => this.fetchList(this.sortingParams.sort),
      },
      {
        windowClass: 'modal-xl',
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
   * テンプレートDLボタン押下時のコールバック
   */
  async downonClicDownloadTemplate() {
    const header = _.cloneDeep(this.requestHeaderParams);
    header['X-Sort'] = this.sortingParams['sort'];
    header['X-Fields'] = this._createXFields(this.downloadFields);

    this._showLoadingSpinner();

    try {
      const res = await this.rentalCarService.createFile(
        {
          ...this.searchParams,
          file_create_condition: {
            file_content_type: KbaMimeType.excel,
            processing_type: ProcessingType.sync,
          },
        },
        header
      );

      await this.api.downloadFile(res.result_data.file_id, KbaMimeType.excel);
    } finally {
      this._hideLoadingSpinner();
    }
  }

  /**
   * 履歴ボタン押下時のコールバック
   * @param data データ
   */
  async onClickHistory(data) {
    this.historyModalValues.listVal = (await this.rentalCarService.fetchRentalHistories(
      data['cars.car_identification.id'],
      this.historyModalValues.requestHeaderParams
    )).result_data;

    this.modalService.open({
      title: this.labels.history_modal_title,
      labels: this.labels,
      content: this.historyModalContent,
    });
  }

  protected async _fetchDataForInitialize() {
    const res = await this.rentalCarService.fetchIndexInitData();
    this.initialize(res);
    this.resource = res.resource;
    this.labels = res.label;
    this._setTitle();
    this.thList = this._createRentalCarThList(res.fields);
    this._reflectXFields(res.fields);
    this.updatable = res.updatable;
    this.downloadFields = res.downloadFields;
    this.historyModalValues = this._getHistoryModalValues(res.historyFields);
    this.uploadResultThList = this._createUploadResultThList();
    this.sortableThList = this.sortableThLists(this.thList);
    this._initializeDatePicker();
  }

  /**
   * 検索条件パラメータを作成する
   * @override
   * @param params パラメータ
   */
  protected _getSearchParams(params) {
    const {
      common: {
        car_identification: {
          division_codes,
          maker_codes,
          models,
          type_revs,
          serials,
        },
        customer_attribute: { customer_car_no },
      },
      rental,
    } = params;

    return {
      common: {
        car_identification: {
          division_codes: division_codes && division_codes.split(','),
          maker_codes: maker_codes && maker_codes.split(','),
          models: models && models.split(','),
          type_revs: type_revs && type_revs.split(','),
          serials: serials && serials.split(','),
        },
        customer_attribute: customer_car_no && {
          customer_car_no: customer_car_no && [customer_car_no],
        },
      },
      rental,
    };
  }

  /**
   * テーブルのヘッダを作成する
   * @override
   * @param fields 指定項目
   */
  private _createRentalCarThList(fields: Fields) {
    const thList: TableHeader[] = super._createThList(fields);

    return thList.concat([
      {
        name: 'cars.rental.reservation1.customer_label',
        formatKey: 'rental.reservation1.customer_label',
        label: this.labels.rental1,
        displayable: true,
        sortKey: 'cars.rental.reservation1.customer_label',
        sortable: true,
      },
      {
        name: 'cars.rental.reservation1.start_date',
        formatKey: 'rental.reservation1.start_date',
        label: this.labels.rental1_period,
        displayable: true,
        sortKey: 'cars.rental.reservation1.start_date',
        sortable: true,
      },
      {
        name: 'cars.rental.reservation1.end_date',
        formatKey: 'rental.reservation1.end_date',
        label: this.labels.rental1_period,
        displayable: false,
      },
      {
        name: 'cars.rental.reservation2.customer_label',
        formatKey: 'rental.reservation2.customer_label',
        label: this.labels.rental2,
        displayable: true,
        sortKey: 'cars.rental.reservation2.customer_label',
        sortable: true,
      },
      {
        name: 'cars.rental.reservation2.start_date',
        formatKey: 'rental.reservation2.start_date',
        label: this.labels.rental2_period,
        displayable: true,
        sortKey: 'cars.rental.reservation2.start_date',
        sortable: true,
      },
      {
        name: 'cars.rental.reservation2.end_date',
        formatKey: 'rental.reservation2.end_date',
        label: this.labels.rental2_period,
        displayable: false,
      },
    ]);
  }

  /**
   * 履歴モーダルのヘッダなどを取得
   * @param fields 指定項目
   */
  private _getHistoryModalValues(fields: Fields) {
    const modalValues = super._getModalValues(fields);
    modalValues.listDesc = modalValues.listDesc.reduce(
      (result: any[][], item: TableHeader) => {
        if (/^car\.car_identification/.test(item.name)) {
          result[0].push(item);
        }

        if (/^car\.rental_histories/.test(item.name)) {
          item.dataKey = item.name
            .split('.')
            .slice(2)
            .join('.');
          result[1].push(item);
        }

        return result;
      },
      [[], []]
    );

    return modalValues;
  }

  /**
   * アップロード結果モーダルのヘッダを作成する
   */
  private _createUploadResultThList() {
    return [
      {
        name: 'css_class',
        formatKey: 'css_class',
        label: '',
        displayable: false,
      },
      {
        name: 'result',
        formatKey: 'result',
        label: this.labels.result,
        displayable: true,
      },
      {
        name: 'car.car_identification.model',
        formatKey: 'car.car_identification.model',
        label: this.labels.model,
        displayable: true,
      },
      {
        name: 'car.car_identification.type',
        formatKey: 'car.car_identification.type',
        label: this.labels.type,
        displayable: true,
      },
      {
        name: 'car.car_identification.serial',
        formatKey: 'car.car_identification.serial',
        label: this.labels.serial,
        displayable: true,
      },
      {
        name: 'car.rental.reservation1.customer_label',
        formatKey: 'car.rental.reservation1.customer_label',
        label: this.labels.rental1,
        displayable: true,
      },
      {
        name: 'car.rental.reservation1.start_date',
        formatKey: 'car.rental.reservation1.start_date',
        label: this.labels.rental1_period,
        displayable: true,
      },
      {
        name: 'car.rental.reservation1.viewable_end_date',
        formatKey: 'car.rental.reservation1.viewable_end_date',
        label: this.labels.rental1_viewable_period,
        displayable: true,
      },
      {
        name: 'car.rental.reservation2.customer_label',
        formatKey: 'car.rental.reservation2.customer_label',
        label: this.labels.rental2,
        displayable: true,
      },
      {
        name: 'car.rental.reservation2.start_date',
        formatKey: 'car.rental.reservation2.start_date',
        label: this.labels.rental2_period,
        displayable: true,
      },
      {
        name: 'car.rental.reservation2.viewable_end_date',
        formatKey: 'car.rental.reservation2.viewable_end_date',
        label: this.labels.rental2_viewable_period,
        displayable: true,
      },
      {
        name: 'error_messages',
        formatKey: 'error_messages',
        label: this.labels.result_detail,
        displayable: true,
      },
    ];
  }

  /**
   * アップロードの結果を整形する
   * @param responses レスポンス
   */
  private _formatUploadResult(responses) {
    const list = responses.map(response => {
      const data = response.request;
      const { reservation1, reservation2 } = data.car.rental;

      data.car.rental.reservation1.start_date =
        reservation1.customer_label == null
          ? ''
          : `${reservation1.start_date}-${reservation1.end_date}`;
      data.car.rental.reservation1.viewable_end_date =
        reservation1.customer_label == null
          ? ''
          : `${reservation1.end_date}-${reservation1.viewable_end_date}`;

      data.car.rental.reservation2.start_date =
        reservation2.customer_label == null
          ? ''
          : `${reservation2.start_date}-${reservation2.end_date}`;
      data.car.rental.reservation2.viewable_end_date =
        reservation2.customer_label == null
          ? ''
          : `${reservation2.end_date}-${reservation2.viewable_end_date}`;

      data.result = {
        type: 'result',
        success: !response.error_data,
      };

      if (response.error_data) {
        data.error_messages = this._createErrorMessages(response.error_data);
        data.css_class = 'warning';
      }

      return data;
    });
    return this._formatList(list, this.uploadResultThList);
  }

  /**
   * デートピッカーを初期化する
   */
  private _initializeDatePicker() {
    const datePickerConfig = this.userSettingService.getDatePickerConfig();
    this.beginningWday = datePickerConfig.first_day_of_week_kind;
    const _window = window as any;
    this.enableDateRange = _window.settings.datePickerRange.information;
    this._dateFormat = datePickerConfig.date_format_code;
    this.timeZone = datePickerConfig.time_difference;

    this.datePickerParams = {
      timeZone: this.timeZone,
      dateFormat: this._dateFormat,
    };
    this.datePickerService.initialize(this.datePickerParams);
    this.params.rental.date_from = this.datePickerService.toMoment().format(
      DateFormat.hyphen
    );
    this.params.rental.date_to = this.datePickerService.toMoment().add(1, 'month').format(
      DateFormat.hyphen
    );
  }
}
