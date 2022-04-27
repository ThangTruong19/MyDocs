import {
  Component,
  OnInit,
  ChangeDetectorRef,
  TemplateRef,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import * as moment from 'moment';

import { Fields, TableHeader, Api, Labels } from '../../../../types/common';
import { UpdateParams, RentalCar } from '../../../../types/flm/rental-car';

import { environment } from '../../../../../environments/environment';

import { DateFormat } from '../../../../constants/date-format';

import { KbaAbstractRegisterComponent } from '../../../shared/kba-abstract-component/kba-abstract-register-component';
import { KbaFormTableSelectComponent } from '../../../shared/kba-form-table-select/kba-form-table-select.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { RentalCarService } from '../../../../services/flm/rental-car/rental-car.service';
import { KbaDatePickerService } from '../../../../services/shared/kba-date-picker.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';
import { KbaSearchDatePickerComponent } from '../../../shared/kba-search-date-picker/kba-search-date-picker.component';
import { KbaFromToDatePickerComponent } from '../../../shared/kba-from-to-date-picker/kba-from-to-date-picker.component';

@Component({
  selector: 'app-rental-car-edit',
  templateUrl: './rental-car-edit.component.html',
  styleUrls: ['./rental-car-edit.component.scss'],
})
export class RentalCarEditComponent extends KbaAbstractRegisterComponent {
  @ViewChildren('reservationSelects') reservationSelects: QueryList<
    KbaFormTableSelectComponent
  >;
  @ViewChildren('rentalStartEndDatePicker')
  rentalStartEndDatePickers: QueryList<KbaFromToDatePickerComponent>;
  @ViewChildren('viewableEndDatePicker') viewableEndDatePickers: QueryList<
    KbaSearchDatePickerComponent
  >;

  window = window;
  carId: string;
  params: UpdateParams;
  fields: Fields;
  rentalCar: RentalCar;
  thList: TableHeader[];
  notUseCustomerId = true;
  customerIdSelectParams: {
    [identifier: string]: {
      customer_id_select?: string;
    };
  } = {
      reservation1: {},
      reservation2: {},
    };
  customerNames: {
    [identifier: string]: string;
  } = {};
  customerNotFound: {
    [identifier: string]: boolean;
  } = {};
  customerIdSearchValues: {
    [identifier: string]: string;
  } = {};
  submitModalThList: TableHeader[];
  submitModalValues: {
    customer_name: string;
    start_date: string;
    viewable_end_date: string;
  }[];
  environment = environment;

  datePickerLabels: Labels;

  // デートピッカー関連
  beginningWday;
  enableDateRange;
  dateFormat;
  timeZone;
  viewableEndDateRange: {
    reservation1: string[];
    reservation2: string[];
  } = {
      reservation1: [],
      reservation2: [],
    };
  datePickerParams: any;

  constructor(
    navigation: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    private rentalCarService: RentalCarService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private ref: ChangeDetectorRef,
    private datePickerService: KbaDatePickerService,
    private modalService: KbaModalService,
    private alertService: KbaAlertService,
    private userSettingService: UserSettingService
  ) {
    super(navigation, title, header);
  }

  /**
   * 顧客IDフォーカス時の処理
   * @param event イベント
   * @param identifier 識別子
   */
  handleFocusCustomerId(event: FocusEvent, identifier: string) {
    this.params.car.rental[identifier].customer_id = null;
    this.customerNames[identifier] = this.labels.empty;
    this.customerNotFound[identifier] = false;
  }

  /**
   * 顧客IDからフォーカスが外れた時の処理
   * @param event イベント
   * @param identifier 識別子
   */
  async handleBlurCustomerId(event: FocusEvent, identifier: string) {
    this.alertService.close();
    const value = (event.target as HTMLInputElement).value;
    if (value == null || value.length === 0) {
      return;
    }

    // TODO: hayashi 取り決めが必要
    const path = `car.rental.${identifier}.customer_id_search`;
    const res = await this.rentalCarService.fetchCustomerIdBelongingResource(
      value,
      identifier,
      path,
      true
    );

    if (_.get(res, `car.rental.${identifier}`)) {
      this.params.car.rental[identifier].customer_id =
        res.car.rental[identifier].customer_id.values[0].value;
      this.customerNames[identifier] =
        res.car.rental[identifier].customer_label.values[0].name;
    } else {
      this.alertService.show(this.labels.customer_not_found, true, 'danger');
      this.customerNotFound[identifier] = true;
    }
  }

  /**
   * リセットボタン押下時の処理
   */
  handleClickReset() {
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      ok: () => {
        this.notUseCustomerId = true;
        this.safeDetectChanges();
        this.params = this._getInitialParams(this.rentalCar);
        if (this.reservationSelects.length > 0) {
          this.customerIdSelectParams = this._getCustomerIdSelectParams(
            this.params
          );
          this._resetCustomerIds(this.customerIdSelectParams);
        }
      },
    });
  }

  /**
   * 顧客名プルダウン変更時の処理
   * @param value プルダウンの値
   * @param identifier 識別子
   */
  async handleChangeCustomerId(value: string, identifier: string) {
    const path = `car.rental.${identifier}.customer_id_select`;
    this.params.car.rental[identifier].customer_id = value;
    this.customerNames[identifier] = this._getResourceValueName(path, value);
  }

  /**
   * 入力項目をクリア
   * @param identifier 識別子
   */
  handleClickClear(identifier) {
    this.params.car.rental[identifier].start_date = null;
    this.params.car.rental[identifier].start_date_display = null;
    this.params.car.rental[identifier].end_date = null;
    this.params.car.rental[identifier].end_date_display = null;
    this.params.car.rental[identifier].viewable_end_date = null;
    this.params.car.rental[identifier].viewable_end_date_display = null;
    this.params.car.rental[identifier].customer_id = null;
    this.customerIdSearchValues[identifier] = null;
    this.customerNames[identifier] = this.labels.empty;
    this.customerNotFound[identifier] = false;
    const rentalStartEndDatePicker = this.rentalStartEndDatePickers.find(
      rp => rp.fromId === `${identifier}start_date`
    );
    rentalStartEndDatePicker.handleSelectFromDate(null);
    rentalStartEndDatePicker.handleSelectToDate(null);
    const viewableEndDatePicker = this.viewableEndDatePickers.find(
      vp => vp.id === `${identifier}viewable_end_date`
    );
    viewableEndDatePicker.onSelectDate(null);
    let select: KbaFormTableSelectComponent;
    if ((select = this._getCustomerIdSelect(identifier))) {
      select.resetAndEmit();
    }
  }

  /**
   * 変更ボタン押下時の処理
   */
  async handleClickSubmit() {
    const params = this._formatParams(this.params);
    this.submitModalValues = this._createSubmitModalValues(params);
    [params.car.rental.reservation1, params.car.rental.reservation2].forEach(
      reservation => {
        reservation.start_date_display = null;
        reservation.viewable_end_date_display = null;
        reservation.end_date_display = null;
      }
    );

    this.modalService.open(
      {
        title: this.labels.submit_modal_title,
        labels: this.labels,
        content: this.submitModalContent,
        ok: async () => {
          try {
            await this.rentalCarService.updateRentalCars(this.carId, params);
            await this.router.navigateByUrl('/rental_cars');
            this.alertService.show(this.labels.finish_message);
          } catch (errorData) {
            this._setError(errorData, this.alertService);
          }
        },
      },
      {
        size: 'lg',
      }
    );
  }

  /**
   * 顧客IDを使用しないチェック変更時のコールバック
   * @param value 値
   */
  handleNotUseCusromerIdChange(value) {
    this.notUseCustomerId = value;
    ['reservation1', 'reservation2'].forEach(identifier => {
      this.params.car.rental[identifier].customer_id = null;
      this.customerNames[identifier] = this.labels.empty;
      this.customerIdSearchValues[identifier] = null;
      this.customerNotFound[identifier] = false;
    });
    this.safeDetectChanges();

    if (this.reservationSelects.length > 0) {
      this.customerIdSelectParams = this._getCustomerIdSelectParams(
        this.params
      );
      this._resetCustomerIds(this.customerIdSelectParams);
    }
  }

  /**
   * 閲覧終了日の日付範囲を取得する
   */
  getEnableDateRange(endDate: string) {
    const range = this.datePickerService.parseDateRange(this.enableDateRange);

    if (endDate != null && endDate.length > 0) {
      range[0] = moment(endDate, DateFormat.hyphen).format(DateFormat.params);
    }

    return range;
  }

  /**
   * 終了日変更時の処理
   */
  handleSelectEndDate(
    endDate: string,
    identifier: 'reservation1' | 'reservation2'
  ) {
    this.viewableEndDateRange[identifier][0] =
      endDate != null && endDate.length > 0
        ? endDate.replace(/-/g, '')
        : this.datePickerService.parseDateRange(this.enableDateRange)[0];
    if (
      moment(endDate, DateFormat.hyphen).isAfter(
        moment(
          this.params.car.rental[identifier].viewable_end_date,
          DateFormat.hyphen
        )
      )
    ) {
      const viewableEndDatePicker = this.viewableEndDatePickers.find(
        vp => vp.id === `${identifier}viewable_end_date`
      );
      viewableEndDatePicker.onSelectDate(moment(endDate, DateFormat.hyphen));
    }
  }

  protected async _fetchDataForInitialize() {
    const res = await this.rentalCarService.fetchEditInitData();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this.fields = res.fields;
    this._setTitle();

    this.activatedRoute.params.subscribe(params => (this.carId = params.id));
    this.rentalCar = (await this.rentalCarService.fetchRentalCars(
      {
        common: {
          car_identification: {
            car_ids: [this.carId],
          },
        },
      },
      { 'X-Fields': this._createXFields(res.fields).join(',') }
    )).result_data.cars[0];

    if (this.rentalCar == null) {
      return;
    }

    this.params = this._getInitialParams(this.rentalCar);
    this.thList = this._createThList(res.fields);

    this._initializeDatePicker();
    this.safeDetectChanges();

    if (this.reservationSelects.length > 0) {
      this.customerIdSelectParams = this._getCustomerIdSelectParams(
        this.params
      );
      this._resetCustomerIds(this.customerIdSelectParams);
    }

    this.submitModalThList = this._createSubmitModalThList();

    ['reservation1', 'reservation2'].forEach(identifier => {
      const range = this.getEnableDateRange(
        this.params.car.rental[identifier].end_date
      );
      this.viewableEndDateRange[identifier][0] = range[0];
      this.viewableEndDateRange[identifier][1] = range[1];
    });
  }

  /**
   * テーブルヘッダを作成
   * @override
   * @param fields 指定項目
   */
  protected _createThList(fields: Fields) {
    return super
      ._createThList(fields)
      .filter(th => th.displayable)
      .map(th => ({
        ...th,
        dataKey: th.name
          .split('.')
          .slice(1)
          .join('.'),
      }));
  }

  /**
   * 初期パラメータを取得
   * @param rentalCar レンタル車両情報
   */
  private _getInitialParams(rentalCar: RentalCar) {
    const params = {
      car: _.chain(rentalCar)
        .pick(['car_identification.update_datetime', 'rental'])
        .omit([
          'rental.reservation1.customer_label',
          'rental.reservation1.customer_label_english',
          'rental.reservation2.customer_label',
          'rental.reservation2.customer_label_english',
        ])
        .value(),
    };

    [
      'car.rental.reservation1.start_date',
      'car.rental.reservation1.end_date',
      'car.rental.reservation1.viewable_end_date',
      'car.rental.reservation2.start_date',
      'car.rental.reservation2.end_date',
      'car.rental.reservation2.viewable_end_date',
    ].forEach(path => {
      const dateString: string | null = _.get(params, path);

      if (dateString == null || dateString.length === 0) {
        return;
      }

      _.set(
        params,
        path,
        this.datePickerService.convertDateString(
          dateString,
          this.datePickerService.getCurrentDateFormat(),
          DateFormat.hyphen
        )
      );
    });

    return params;
  }

  private _getCustomerIdSelectParams(params: UpdateParams) {
    return {
      reservation1: {
        customer_id_select: params.car.rental.reservation1.customer_id,
      },
      reservation2: {
        customer_id_select: params.car.rental.reservation2.customer_id,
      },
    };
  }

  /**
   * 最初の顧客ID取得の制御を行う
   * @param params パラメータ
   * @param identifier 識別子
   */
  private async _resetCustomerIds(params) {
    const {
      reservation1: { customer_id_select: customerId1 },
      reservation2: { customer_id_select: customerId2 },
    } = params;

    const reservations = [
      {
        identifier: 'reservation1',
        customerId: customerId1,
      },
      {
        identifier: 'reservation2',
        customerId: customerId2,
      },
    ];

    for (const reservation of reservations) {
      await this.handleChangeCustomerId(
        reservation.customerId,
        reservation.identifier
      );
    }
  }

  /**
   * デートピッカーを初期化する
   */
  private _initializeDatePicker() {
    const datePickerConfig = this.userSettingService.getDatePickerConfig();
    this.beginningWday = datePickerConfig.first_day_of_week_kind;
    const _window = window as any;
    this.enableDateRange = _window.settings.datePickerRange.information;
    this.dateFormat = datePickerConfig.date_format_code;
    this.timeZone = datePickerConfig.time_difference;

    this.datePickerParams = {
      timeZone: this.timeZone,
      dateFormat: this.dateFormat,
    };
    this.datePickerService.initialize(this.datePickerParams);
  }

  /**
   * 確認モーダルのヘッダを作成する
   */
  private _createSubmitModalThList() {
    return [
      {
        label: this.resource.car.rental.reservation1.customer_id_select.name,
        name: 'customer_name',
      },
      {
        label: this.resource.car.rental.reservation1.start_date.name,
        name: 'start_date',
      },
      {
        label: this.resource.car.rental.reservation1.viewable_end_date.name,
        name: 'viewable_end_date',
      },
    ];
  }

  /**
   * 変更モーダルに表示する項目を作成
   * @param params パラメータ
   */
  private _createSubmitModalValues(params: UpdateParams) {
    const {
      car: {
        rental: { reservation1, reservation2 },
      },
    } = params;

    return [
      {
        identifier: 'reservation1',
        reservation: reservation1,
      },
      {
        identifier: 'reservation2',
        reservation: reservation2,
      },
    ].map(reservation => {
      const {
        start_date,
        end_date,
        viewable_end_date,
        start_date_display,
        end_date_display,
        viewable_end_date_display,
      } = reservation.reservation;

      const customer_id =
        !this.notUseCustomerId ||
          [start_date, end_date, viewable_end_date].some(
            value => !_.isEmpty(value)
          )
          ? reservation.reservation.customer_id
          : null;

      const confirmStartDate = start_date_display || this.labels.empty;
      const confirmEndDate = end_date_display || this.labels.empty;
      const confirmViewableEndDate =
        viewable_end_date_display || this.labels.empty;

      return {
        customer_name:
          customer_id != null
            ? this.customerNames[reservation.identifier]
            : this.labels.empty,
        start_date:
          !_.isEmpty(start_date) || !_.isEmpty(end_date)
            ? `${confirmStartDate} - ${confirmEndDate}`
            : this.labels.empty,
        viewable_end_date:
          !_.isEmpty(end_date) || !_.isEmpty(viewable_end_date)
            ? `${confirmEndDate} - ${confirmViewableEndDate}`
            : this.labels.empty,
      };
    });
  }

  /**
   * 顧客名のプルダウンを取得する
   * @param identifier 識別子
   */
  private _getCustomerIdSelect(identifier): KbaFormTableSelectComponent {
    const reservationSelects = this.reservationSelects.toArray();
    switch (identifier) {
      case 'reservation1':
        return reservationSelects[0];
      case 'reservation2':
        return reservationSelects[1];
    }
  }

  /**
   * パラメータを整形する
   * @param params パラメータ
   */
  private _formatParams(params: UpdateParams) {
    const {
      car: {
        rental: { reservation1, reservation2 },
      },
    } = _.cloneDeep(params);

    [reservation1, reservation2].forEach(reservation => {
      if (
        this.notUseCustomerId &&
        [
          reservation.start_date,
          reservation.end_date,
          reservation.viewable_end_date,
        ].every(value => _.isEmpty(value))
      ) {
        reservation.customer_id = null;
      }
    });

    return {
      car: {
        ...params.car,
        rental: {
          reservation1,
          reservation2,
        },
      },
    };
  }

  /**
   * 日付のフォーマットをハイフン繋ぎのものに変換する
   * @param date 日付文字列
   */
  private _formatDateString(
    date: string,
    srcFormat: string,
    destFormat: string
  ) {
    return '';
  }
}
