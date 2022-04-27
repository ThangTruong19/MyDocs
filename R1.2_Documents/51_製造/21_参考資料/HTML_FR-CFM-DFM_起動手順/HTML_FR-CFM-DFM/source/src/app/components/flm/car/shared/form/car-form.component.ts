import * as _ from 'lodash';
import { ViewChild, ViewChildren, TemplateRef, QueryList } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { Resource, Labels } from '../../../../../types/common';
import {
  CarParams,
  RegistControlParams,
  OrbcommApplyParams,
} from '../../../../../types/flm/car';
import { DatePickerParams } from '../../../../../types/calendar';

import { ResourceKind } from '../../../../../constants/resource-type';
import { RegistrationCarKind } from '../../../../../constants/flm/car';
import { DataPublishKind } from '../../../../../constants/flm/car';
import { NewUsedKind } from '../../../../../constants/flm/car';
import { SmrIntervalItemCustomKind } from '../../../../../constants/flm/car';
import { AccumulateFuelIntervalItemCustomKind } from '../../../../../constants/flm/car';
import { OrbcommRequestTargetKind } from '../../../../../constants/flm/car';
import { CommonHeaderAttribute } from '../../../../../constants/common-header-attribute';
import { UpdateTargetKind } from '../../../../../constants/flm/car';
import { RentalCarKind } from '../../../../../constants/flm/car';
import { TimeDifferenceSettingKind } from '../../../../../constants/flm/car';
import { DateFormat } from '../../../../../constants/date-format';

import { KbaAbstractRegisterComponent } from '../../../../shared/kba-abstract-component/kba-abstract-register-component';
import { KbaFormTableSelectComponent } from '../../../../shared/kba-form-table-select/kba-form-table-select.component';
import { KbaFormTableTextComponent } from '../../../../shared/kba-form-table-text/kba-form-table-text.component';

import { Mixin } from '../../../../../decorators/mixin-decorator';

import { CommonHeaderService } from '../../../../../services/shared/common-header.service';
import { KbaNavigationService } from '../../../../../services/shared/kba-navigation.service';
import { KbaModalService } from '../../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../../services/api/api.service';
import { CarService } from '../../../../../services/flm/car/car.service';
import { KbaDatePickerService } from '../../../../../services/shared/kba-date-picker.service';

import {
  TimeDifference,
  ITimeDifference,
  TimeDifferenceData,
} from '../../../../../mixins/time-difference';
import { UserSettingService } from '../../../../../services/api/user-setting.service';
import { ScreenCode } from '../../../../../constants/flm/screen-codes/car-management';
import { FilterReservedWord } from '../../../../../constants/condition';

@Mixin([TimeDifference])
export abstract class CarFormComponent extends KbaAbstractRegisterComponent
  implements ITimeDifference {
  @ViewChild('makerSelect', { static: false })
  makerSelect: KbaFormTableSelectComponent;
  @ViewChild('modelSelect', { static: false })
  modelSelect: KbaFormTableSelectComponent;
  @ViewChild('typeSelect', { static: false })
  typeSelect: KbaFormTableSelectComponent;
  @ViewChild('makerSelectDetail', { static: false })
  makerSelectDetail: KbaFormTableSelectComponent;
  @ViewChild('modelSelectDetail', { static: false })
  modelSelectDetail: KbaFormTableSelectComponent;
  @ViewChild('typeSelectDetail', { static: false })
  typeSelectDetail: KbaFormTableSelectComponent;
  @ViewChild('mainSubmitModalContent', { static: false })
  mainSubmitModalContent: TemplateRef<null>;
  @ViewChild('detailSubmitModalContent', { static: false })
  detailSubmitModalContent: TemplateRef<null>;
  @ViewChild('resetModalContent', { static: false })
  resetModalContent: TemplateRef<null>;
  @ViewChildren(KbaFormTableSelectComponent) selectBoxes: QueryList<
    KbaFormTableSelectComponent
  >;

  fifteenMinutesItem: string[];
  nextGenHoursItem: string[];
  timeDifference;
  omitTimeDifferenceMinuteResourceValues: (resource: Resource) => Resource;
  omitTimeDifferenceHourResourceValues: (resource: Resource) => Resource;
  createTimeDifference: (diff: string) => TimeDifferenceData;
  joinTimeDifference: (timeDistance: TimeDifferenceData) => string;

  carForm: FormGroup = new FormGroup({});
  carDetailForm: FormGroup = new FormGroup({});
  carCompleteForm: FormGroup = new FormGroup({});
  kind = DataPublishKind;
  newUsedKind = NewUsedKind;
  commonHeaderAttr = CommonHeaderAttribute;
  updateTargetKind = UpdateTargetKind;
  rentalCarKind = RentalCarKind;
  registScreenCode = ScreenCode.regist;
  screenCode: string;

  isUpdate: boolean;
  isFormBuildUp: boolean;
  isAttributeUpdate = true;
  isMainInfoUpdate = false;
  isManagementTargetSubgroup = false;
  loading = true;
  initialParams = {
    car: {
      car_identification: {
        maker_code: '',
        model: '',
        type: '',
        serial: '',
        update_datetime: '',
        initial_smr: '',
      },
      komtrax_unit: {
        terminal_component: {
          part: '',
          serial: '',
        },
      },
      user_permission_sub_group_ids: [],
      distributor_attribute: {
        debit_kind: '',
        free_memo: '',
        new_used_kind: '',
        delivery_date: '',
        delivery_date_formatted: '',
        used_delivery_date: '',
        used_delivery_date_formatted: '',
        used_delivery_smr: '',
        production_year_month: '',
        production_year_month_formatted: '',
        asset_status_kind: '',
        asset_owner_id: '',
        spec_pattern_id: '',
        note_1: '',
        note_2: '',
        note_3: '',
        note_4: '',
        note_5: '',
        class_1_id: '',
        class_2_id: '',
        class_3_id: '',
        class_4_id: '',
        class_5_id: '',
        custom_car_attribute_1_detail_id: '',
        custom_car_attribute_2_detail_id: '',
        custom_car_attribute_3_detail_id: '',
        custom_car_attribute_4_detail_id: '',
        custom_car_attribute_5_detail_id: '',
        custom_car_attribute_6_detail_id: '',
        custom_car_attribute_7_detail_id: '',
        custom_car_attribute_8_detail_id: '',
        custom_car_attribute_9_detail_id: '',
        custom_car_attribute_10_detail_id: '',
        stock_status_update_date: '',
        stock_status_update_date_formatted: '',
        intended_use_code: '',
        data_publish_kind: '',
      },
      support_distributor_id: '',
      customer_id: '',
      bank_id: '',
      insurance_id: '',
      finance_id: '',
      car_management_attribute: {
        registration_car_kind: '',
        time_difference: '',
        rental_car_kind: '',
      },
    },
  };
  params = {
    car: {
      car_identification: {
        maker_code: '',
        model: '',
        type_rev: '',
        serial: '',
        update_datetime: '',
        initial_smr: '',
      },
      komtrax_unit: {
        terminal_component: {
          part: '',
          serial: '',
        },
      },
      user_permission_sub_group_ids: [],
      distributor_attribute: {
        debit_kind: '',
        free_memo: '',
        new_used_kind: '',
        delivery_date: '',
        delivery_date_formatted: '',
        used_delivery_date: '',
        used_delivery_date_formatted: '',
        used_delivery_smr: '',
        production_year_month: '',
        production_year_month_formatted: '',
        asset_status_kind: '',
        asset_owner_id: '',
        spec_pattern_id: '',
        note_1: '',
        note_2: '',
        note_3: '',
        note_4: '',
        note_5: '',
        class_1_id: '',
        class_2_id: '',
        class_3_id: '',
        class_4_id: '',
        class_5_id: '',
        custom_car_attribute_1_detail_id: '',
        custom_car_attribute_2_detail_id: '',
        custom_car_attribute_3_detail_id: '',
        custom_car_attribute_4_detail_id: '',
        custom_car_attribute_5_detail_id: '',
        custom_car_attribute_6_detail_id: '',
        custom_car_attribute_7_detail_id: '',
        custom_car_attribute_8_detail_id: '',
        custom_car_attribute_9_detail_id: '',
        custom_car_attribute_10_detail_id: '',
        stock_status_update_date: '',
        stock_status_update_date_formatted: '',
        intended_use_code: '',
        data_publish_kind: '',
      },
      support_distributor_id: '',
      customer_id: '',
      bank_id: '',
      insurance_id: '',
      finance_id: '',
      car_management_attribute: {
        registration_car_kind: '',
        time_difference: '',
        rental_car_kind: '',
      },
    },
  };
  registControlParams = {
    car: {
      car_identification: {
        maker_code: '',
        model: '',
        type_rev: '',
        serial: '',
      },
      support_distributor_id: '',
      car_management_attribute: {
        registration_car_kind: '',
      },
    },
  };
  datePickerParams: DatePickerParams;
  descItem: any[];
  valItem: any;
  // typeList: object[] = [];
  confirmMessage: '';
  isRetrofit = false;
  isVisibleDetailSubmit = false;
  selectedSubGroupIds: string[] = [];
  mainInfoPaths = [
    'car.car_identification.maker_code',
    'car.car_identification.model',
    'car.car_identification.type_rev',
    'car.car_identification.serial',
    'car.support_distributor_id',
  ];
  detailInfoPaths = [
    'car.komtrax_unit.terminal_component.part',
    'car.komtrax_unit.terminal_component.serial',
    'car.car_identification.initial_smr',
    'car.car_management_attribute.time_difference',
    'car.car_management_attribute.rental_car_kind',
    'car.distributor_attribute.asset_status_kind',
    'car.distributor_attribute.asset_owner_id',
    'car.distributor_attribute.stock_status_update_date',
    'car.distributor_attribute.custom_car_attribute_1_detail_id',
    'car.distributor_attribute.custom_car_attribute_2_detail_id',
    'car.distributor_attribute.custom_car_attribute_3_detail_id',
    'car.distributor_attribute.custom_car_attribute_4_detail_id',
    'car.distributor_attribute.custom_car_attribute_5_detail_id',
    'car.distributor_attribute.custom_car_attribute_6_detail_id',
    'car.distributor_attribute.custom_car_attribute_7_detail_id',
    'car.distributor_attribute.custom_car_attribute_8_detail_id',
    'car.distributor_attribute.custom_car_attribute_9_detail_id',
    'car.distributor_attribute.custom_car_attribute_10_detail_id',
    'car.distributor_attribute.free_memo',
    'car.distributor_attribute.note_1',
    'car.distributor_attribute.note_2',
    'car.distributor_attribute.note_3',
    'car.distributor_attribute.note_4',
    'car.distributor_attribute.note_5',
    'car.distributor_attribute.class_1_id',
    'car.distributor_attribute.class_2_id',
    'car.distributor_attribute.class_3_id',
    'car.distributor_attribute.class_4_id',
    'car.distributor_attribute.class_5_id',
    'car.distributor_attribute.intended_use_code',
    'car.distributor_attribute.debit_kind',
    'car.customer_id',
    'car.user_permission_sub_group_ids',
    'car.bank_id',
    'car.insurance_id',
    'car.finance_id',
    'car.distributor_attribute.delivery_date',
    'car.distributor_attribute.new_used_kind',
    'car.distributor_attribute.used_delivery_date',
    'car.distributor_attribute.used_delivery_smr',
    'car.distributor_attribute.production_year_month',
    'car.distributor_attribute.data_publish_kind',
    'car.distributor_attribute.spec_pattern_id',
  ];
  mainInfoHeader: {
    label: string;
    name: string;
    displayable: boolean;
  }[];
  mainInfoParams: {
    [key: string]: any;
  };
  detailInfoHeader: {
    label: string;
    name: string;
    displayable: boolean;
  }[];
  detailInfoParams: {
    [key: string]: string;
  };
  notIncludedParamKeys = [
    'car.car_identification.maker_code',
    'car.car_management_attribute.registration_car_kind',
    'car.distributor_attribute.asset_status_kind',
    'car.distributor_attribute.asset_owner_id',
  ];
  extraExcludedParamKeys = ['maker_code', 'update_target_kind'];
  excludeUsedKindModalHeader = [
    'car.distributor_attribute.used_delivery_smr',
    'car.distributor_attribute.used_delivery_date',
  ];
  excludeNewKindModalHeader = ['car.distributor_attribute.delivery_date'];
  excludedUsedKindParamKeys = ['car.distributor_attribute.delivery_date'];
  excludedNewKindParamKeys = [
    'car.distributor_attribute.used_delivery_smr',
    'car.distributor_attribute.used_delivery_date',
  ];
  isVisibleCompleteSubmit = false;
  orbcommApplyParams: OrbcommApplyParams = {
    orbcomm_request: {
      nation_id: '',
    },
  };
  orbcommApplyLabels = {
    maker_name: '',
    model: '',
    type: '',
    serial: '',
    komtrax_unit_part: '',
    komtrax_unit_serial: '',
  };
  orbcommApplyKinds = {
    smr_interval_item_custom_kind: '',
    accumulate_fuel_interval_item_custom_kind: '',
    orbcomm_request_target_kind: '',
  };
  carId = '';
  isOrbcommApplyExecute = false;
  orbcommOffset = 0;
  dateFormat = '';
  timeZone = '';
  enableDateRange: string[] = [];
  isUsedKind = false;
  beginningWday: number;
  eqp_delivery_date = '';
  eqp_used_delivery_date = '';
  datePickerLabels: Labels;
  noDataExcludeKeys = [
    'car.distributor_attribute.custom_car_attribute_1_detail_id',
    'car.distributor_attribute.custom_car_attribute_2_detail_id',
    'car.distributor_attribute.custom_car_attribute_3_detail_id',
    'car.distributor_attribute.custom_car_attribute_4_detail_id',
    'car.distributor_attribute.custom_car_attribute_5_detail_id',
    'car.distributor_attribute.custom_car_attribute_6_detail_id',
    'car.distributor_attribute.custom_car_attribute_7_detail_id',
    'car.distributor_attribute.custom_car_attribute_8_detail_id',
    'car.distributor_attribute.custom_car_attribute_9_detail_id',
    'car.distributor_attribute.custom_car_attribute_10_detail_id',
    'car.distributor_attribute.class_1_id',
    'car.distributor_attribute.class_2_id',
    'car.distributor_attribute.class_3_id',
    'car.distributor_attribute.class_4_id',
    'car.distributor_attribute.class_5_id',
    'car.distributor_attribute.asset_status_kind',
    'car.distributor_attribute.asset_owner_id',
    'car.customer_id',
    'car.bank_id',
    'car.insurance_id',
    'car.finance_id',
  ];

  /**
   * 累積燃料消費量管理カスタムリンク名取得
   * @return 名称
   */
  get customizeFuelName(): string {
    if (this.isOrbcommRequestTarget()) {
      return this.isOrbcommApplyExecute
        ? this.labels.customize_fuel_continually
        : this.labels.customize_fuel_no_apply;
    } else {
      return this.isOrbcommApplyExecute
        ? this.labels.customize_fuel_continually
        : this.labels.customize_fuel;
    }
  }

  /**
   * SMRインターバルカスタムリンク名取得
   * @return 名称
   */
  get customizeSmrIntervalName(): string {
    if (this.isOrbcommRequestTarget()) {
      return this.isOrbcommApplyExecute
        ? this.labels.customize_smr_interval_continually
        : this.labels.customize_smr_interval_no_apply;
    } else {
      return this.isOrbcommApplyExecute
        ? this.labels.customize_smr_interval_continually
        : this.labels.set_default_smr_interval;
    }
  }

  /**
   * 共通ヘッダの高さ分のオフセットを返却
   * @return オフセット
   */
  get commonHeaderOffset(): number {
    return -this.commonHeaderAttr.height;
  }

  /**
   * 属性変更項目が編集可能かどうかを返却する
   * @return true: 編集可能 / false: 編集不可
   */
  get isAttributeEditable(): boolean {
    if (!this.isUpdate) {
      return true;
    }

    return this.isAttributeUpdate;
  }

  get isTimeDifferenceEditable() {
    return !this.isTerminalInformationNull() && this.isAttributeEditable;
  }

  /**
   * 「.KBA-orbcomm-apply」の高さ分のオフセットを返却
   * @return オフセット
   */
  get orbcommApplyOffset(): number {
    const orbcommApplyEl = <HTMLInputElement>(
      document.body.querySelector('.KBA-orbcomm-apply')
    );
    // スクロールする前の値のみを保持する
    if (this.orbcommOffset === 0) {
      this.orbcommOffset = -orbcommApplyEl.offsetTop;
    }
    return this.orbcommOffset;
  }

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    protected alertService: KbaAlertService,
    protected modalService: KbaModalService,
    protected carService: CarService,
    protected datePickerService: KbaDatePickerService,
    protected api: ApiService,
    protected router: Router,
    protected userSettingService: UserSettingService
  ) {
    super(nav, title, header);
  }

  /**
   * 主要情報変更項目が編集可能かどうかを返却する
   * @param path パス
   * @return true: 編集可能 / false: 編集不可
   */
  isMainInfoEditable(path: string): boolean {
    if (!this.isUpdate) {
      return _.includes(this.mainInfoPaths, path) ? false : this.isRetrofit;
    }

    return this.isMainInfoUpdate;
  }

  /**
   * 時差取得
   * @return 時差
   */
  get timeDifferenceLabel(): string {
    return _.get(this.initialParams, 'car.car_management_attribute.time_difference');
  }

  async fetchTimeDifferenceResouce({
    screenCode,
    maker_code,
    model,
    type_rev,
    serial,
  }) {
    return await this.carService.fetchTimeDifferenceResouce(
      screenCode,
      maker_code,
      model,
      type_rev,
      serial
    );
  }

  /**
   * 担当DBプルダウン変更時の処理
   */
  async onSupportDistributorChange(value: string) {
    const res = await this._handleSupportDistributorChange(value);
    this.resource.car.car_identification.maker_code = _.get(res, 'car.car_identification.maker_code');

    if (this.makerSelect) {
      if(!this.resource.car.car_identification.maker_code.values.some(
        r =>
          r.value ===
          this.registControlParams.car.car_identification.maker_code)) {
            this.makerSelect.reset();
      }
      this.makerSelect.refresh();
    }

    if (this.isUpdate) {
      this.selectBoxes.forEach(async select => await select.refresh(false));
    }
  }

  /**
   * 詳細登録へボタン押下コールバック
   */
  async onClickMainSubmit() {
    this._clearError();
    this.isVisibleDetailSubmit = false;
    this.carDetailForm.markAsPristine();
    this.params = _.cloneDeep(this.initialParams);
    _.set(
      this.registControlParams,
      'car.car_management_attribute.registration_car_kind',
      ''
    );
    await this._carRegistrationControl().catch(errorData =>
      this._setError(errorData, this.alertService)
    );

    if (!_.isEmpty(this.confirmMessage)) {
      this.modalService.open({
        title: this.labels.main_submit_modal_title,
        labels: this.labels,
        okBtnLabel: this.labels.ok_btn_label,
        closeBtnLabel: this.labels.close_btn_label,
        content: this.mainSubmitModalContent,
        ok: async () => {
          _.set(
            this.registControlParams,
            'car.car_management_attribute.registration_car_kind',
            RegistrationCarKind.retrofit
          );
          this.confirmMessage = '';
          await this._carRegistrationControl().catch(errorData =>
            this._setError(errorData, this.alertService)
          );
        },
        ng: async () => {
          _.set(
            this.registControlParams,
            'car.car_management_attribute.registration_car_kind',
            RegistrationCarKind.standard
          );
          this.confirmMessage = '';
          await this._carRegistrationControl().catch(errorData =>
            this._setError(errorData, this.alertService)
          );
        },
      });
    }
  }

  /**
   * 登録ボタン押下時の処理
   */
  onClickSubmit() {
    const path = this.isUpdate ? '/cars' : null;
    _.set(
      this.params,
      'car.user_permission_sub_group_ids',
      _.cloneDeep(this.selectedSubGroupIds)
    );
    this._registerModalOpen(path);
  }

  /**
   * SMRリンク押下時の処理
   */
  onClickLinkSmr() {
    const car_id = this.carId;
    this.router.navigate(['/smr_interval/cars', car_id, 'edit']);
  }

  /**
   * 累積燃料リンク押下時の処理
   */
  onClickLinkFuel() {
    const car_id = this.carId;
    this.router.navigate(['/fuel_interval_items/cars', car_id, 'edit']);
  }

  /**
   * 続けて登録ボタン押下時の処理
   */
  onClickContinue() {
    this.isVisibleDetailSubmit = false;
    this.isVisibleCompleteSubmit = false;
    this.isOrbcommApplyExecute = false;
    this.router.navigateByUrl('cars/new').then(e => {
      this._reset();
    });
  }

  /**
   * リセットボタン押下時の処理
   */
  onClickReset(): void {
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      ok: () => this._reset(),
    });
  }

  /**
   * 更新対象変更時コールバック
   * @param updateTargetKind 更新対象区分
   */
  onSelectUpdateTargetKind(updateTargetKind: string) {
    this.safeDetectChanges();
    this.isMainInfoUpdate = updateTargetKind === UpdateTargetKind.mainInfo;
    this.isAttributeUpdate = !this.isMainInfoUpdate;
  }

  /**
   * 申請ボタン押下時の処理
   */
  async onClickApply() {
    await this.carService.applyOrbcomm(this.carId, this.orbcommApplyParams);
    this.isOrbcommApplyExecute = true;
  }

  /**
   * フォームグループを取得
   * @param form フォーム
   * @param path パス
   */
  getFormGroup(form, path) {
    return (
      form.get(path) ||
      path
        .split('.')
        .reduce((fg, p) => fg.get(p) || this._initializeFormGroup(fg, p), form)
    );
  }

  /**
   * メーカコード変更時コールバック
   * @param makerCode メーカコード
   */
  async onMakerCodeChange(makerCode) {
    const supportDbId = this.exists('car.support_distributor_id', true)
      ? _.get(this.registControlParams, 'car.support_distributor_id') ||
      this.resource.car.support_distributor_id.values[0].value
      : null;
    const res = await this._handleSupportDistributorOrMakerChange(
      makerCode,
      supportDbId
    );
    this.resource.car.car_identification.model = _.get(res, 'car.car_identification.model');

    if (this.modelSelect && !this.isUpdate) {
      this.modelSelect.refresh();
    }
  }

  /**
   * 機種変更時コールバック
   * @param model 機種
   */
  async onModelChange(model) {
    const supportDbId = this.exists('car.support_distributor_id', true)
      ? _.get(this.registControlParams, 'car.support_distributor_id') ||
      this.resource.car.support_distributor_id.values[0].value
      : null;
    const res = await this._handleSupportDistributorOrModelChange(
      model,
      supportDbId
    );
    this.resource.car.car_identification.type_rev = _.get(res, 'car.car_identification.type_rev');

    if (this.typeSelect && !this.isUpdate) {
      await this.typeSelect.refresh();
    }
  }

  /**
   * メーカコード変更時コールバック(詳細)
   * @param makerCode メーカコード
   */
  async onMakerCodeDetailChange(makerCode) {
    if (!this.isUpdate) {
      return;
    }

    const supportDbId = this.exists('car.support_distributor_id', true)
      ? _.get(this.registControlParams, 'car.support_distributor_id') ||
      this.resource.car.support_distributor_id.values[0].value
      : null;
    const res = await this._handleSupportDistributorOrMakerChange(
      makerCode,
      supportDbId,
      'onMakerCodeDetailChange'
    );
    this.resource.car.car_identification.model = _.get(res, 'car.car_identification.model');

    if (this.modelSelectDetail) {
      await this.modelSelectDetail.refresh();
    }
  }

  /**
   * 機種変更時コールバック(詳細)
   * @param model 機種
   */
  async onModelDetailChange(model) {
    if (!this.isUpdate) {
      return;
    }

    const supportDbId = this.exists('car.support_distributor_id', true)
      ? _.get(this.registControlParams, 'car.support_distributor_id') ||
      this.resource.car.support_distributor_id.values[0].value
      : null;
    const res = await this._handleSupportDistributorOrModelChange(
      model,
      supportDbId,
      'onModelDetailChange'
    );
    this.resource.car.car_identification.type_rev = _.get(res, 'car.car_identification.type_rev');

    if (this.typeSelectDetail) {
      await this.typeSelectDetail.refresh();
    }
  }

  /**
   * 既に該当のチェックボックスがチェック済みかどうかを返却する。
   *
   * @param value 値
   * @return true: チェック済み / false: 未チェック
   */
  isChecked(value) {
    return _.includes(this.selectedSubGroupIds, value);
  }

  /**
   * サブグループIDチェックボックスチェック時コールバック
   * @param event イベント
   * @param value サブグループID
   */
  onChangeSubGroupId(event, trueValue: string) {
    if (event.target.checked) {
      if (!_.includes(this.selectedSubGroupIds, trueValue)) {
        this.selectedSubGroupIds.push(trueValue);
      }
    } else {
      _.pull(this.selectedSubGroupIds, trueValue);
    }
  }

  /**
   * 時差プルダウン変更時コールバック
   * @param elem 時 / 分
   * @param value 値
   */
  onTimeDiffrenceChange() {
    this.params.car.car_management_attribute.time_difference = this.joinTimeDifference(
      this.timeDifference
    );
  }

  /**
   * 新車中古車区分変更時コールバック
   * @param newUsedKind: 新車中古車区分
   */
  onNewUsedKindChange(newUsedKind) {
    const usedDeliverySmrControl = this.carDetailForm.get(
      'distributor_attribute.used_delivery_smr'
    );
    const usedDeliveryDateControl = this.carDetailForm.get(
      'distributor_attribute.used_delivery_date'
    );
    const deliveryDateControl = this.carDetailForm.get(
      'distributor_attribute.delivery_date'
    );

    if (
      !usedDeliverySmrControl ||
      !usedDeliveryDateControl ||
      !deliveryDateControl
    ) {
      return;
    }

    if (newUsedKind === NewUsedKind.usedCar) {
      usedDeliverySmrControl.enable();
      usedDeliveryDateControl.enable();
      deliveryDateControl.disable();
      this.isUsedKind = true;
    } else {
      usedDeliverySmrControl.disable();
      usedDeliveryDateControl.disable();
      deliveryDateControl.enable();
      this.isUsedKind = false;
    }
  }

  /**
   * orbcomm申請対象かどうかを返却する
   * @return true: 対象 / false: 対象外
   */
  isOrbcommRequestTarget() {
    return (
      OrbcommRequestTargetKind.target ===
      this.orbcommApplyKinds.orbcomm_request_target_kind
    );
  }

  /**
   * SMRインターバル管理項目カスタム可能かどうかを返却する
   * @return true: 可能 / false: 不可
   */
  isSmrIntervalItemCustom() {
    return (
      SmrIntervalItemCustomKind.possible ===
      this.orbcommApplyKinds.smr_interval_item_custom_kind
    );
  }

  /**
   * 累積燃料消費量管理項目カスタム可能かどうかを返却する
   * @return true: 可能 / false: 不可
   */
  isAccumulateFuelIntervalItemCustom() {
    return (
      AccumulateFuelIntervalItemCustomKind.possible ===
      this.orbcommApplyKinds.accumulate_fuel_interval_item_custom_kind
    );
  }

  /**
   * 端末品番・シリアルの値が存在するかを判定する
   */
  isTerminalInformationNull() {
    const {
      car_management_attribute: { registration_car_kind },
      komtrax_unit: {
        terminal_component: { part, serial },
      },
    } = this.params.car;

    return (
      registration_car_kind === RegistrationCarKind.standard &&
      part == null &&
      serial == null
    );
  }

  /**
   * 初期化完了後に行う処理
   */
  protected async _afterInitialize(): Promise<any> {
    const datePickerConfig = this.userSettingService.getDatePickerConfig();
    this.beginningWday = datePickerConfig.first_day_of_week_kind;
    const _window = window as any;
    this.enableDateRange = _window.settings.datePickerRange.car;
    this.dateFormat = datePickerConfig.date_format_code;
    this.timeZone = datePickerConfig.time_difference;

    this.datePickerParams = {
      timeZone: this.timeZone,
      dateFormat: this.dateFormat,
    };
    this.datePickerService.initialize(this.datePickerParams);
  }

  /**
   * フォームの部品を angular の form に登録します。
   */
  protected _buildFormControls() {
    this.carDetailForm = new FormGroup({});

    // 中古車納入時SMR, データ公開区分, 中古車納入日
    this.carDetailForm.addControl(
      'distributor_attribute',
      new FormGroup({
        used_delivery_smr: new FormControl(
          _.get(this.params, 'car.distributor_attribute.used_delivery_smr')
        ),
        delivery_date: new FormControl(
          _.get(this.params, 'car.distributor_attribute.delivery_date'),
          Validators.required
        ),
        used_delivery_date: new FormControl(
          _.get(this.params, 'car.distributor_attribute.used_delivery_date'),
          Validators.required
        ),
      })
    );

    // サブグループチェックボックス
    _.get(this.resource, 'car.user_permission_sub_group_ids').values.forEach(
      (sub_group_id, index) => {
        this.carDetailForm.addControl(
          `sub_group_id_${index}`,
          new FormControl()
        );
      }
    );

    if (this.isUpdate) {
      this.carForm = new FormGroup({});

      // 初期SMR
      this.carDetailForm.addControl(
        'car_identification',
        new FormGroup({
          initial_smr: new FormControl(
            _.get(this.params, 'car.car_identification.initial_smr'),
            Validators.required
          ),
          serial: new FormControl(
            _.get(this.params, 'car.car_identification.serial'),
            Validators.required
          ),
        })
      );
    }
    this.isFormBuildUp = true;
  }

  /**
   * 入力された内容を API に渡し登録を行う
   * @param params パラメータ
   * @param path パス
   */
  protected abstract _register(params: CarParams, path?: string);

  /**
   * フォームに入力された内容をリセットする
   */
  protected abstract _reset();

  /**
   * 登録モーダルのパラメータを整形する
   * @param paths 対象となる項目のパス
   */
  protected _createSubmitModalParams(paths) {
    const result = {};
    paths.forEach(path => {
      if (this.exists(path)) {
        result[path] = (() => {
          switch (path) {
            case 'car.car_identification.maker_code':
              return _.get(this.params, 'car.car_identification.maker_label');
            case 'car.support_distributor_id':
              return _.get(this.params, 'car.support_distributor_label');
            case 'car.distributor_attribute.asset_status_kind':
              return (
                this._getResourceValueName(path, _.get(this.params, path)) ||
                _.get(
                  this.params,
                  'car.distributor_attribute.asset_status_name'
                )
              );
            case 'car.distributor_attribute.asset_owner_id':
              return (
                this._getResourceValueName(path, _.get(this.params, path)) ||
                _.get(this.params, 'car.distributor_attribute.asset_owner_name')
              );
            case 'car.bank_id':
            case 'car.insurance_id':
            case 'car.finance_id':
            case 'car.distributor_attribute.new_used_kind':
            case 'car.distributor_attribute.data_publish_kind':
            case 'car.distributor_attribute.spec_pattern_id':
            case 'car.distributor_attribute.class_1_id':
            case 'car.distributor_attribute.class_2_id':
            case 'car.distributor_attribute.class_3_id':
            case 'car.distributor_attribute.class_4_id':
            case 'car.distributor_attribute.class_5_id':
            case 'car.distributor_attribute.intended_use_code':
            case 'car.distributor_attribute.debit_kind':
            case 'car.distributor_attribute.custom_car_attribute_1_detail_id':
            case 'car.distributor_attribute.custom_car_attribute_2_detail_id':
            case 'car.distributor_attribute.custom_car_attribute_3_detail_id':
            case 'car.distributor_attribute.custom_car_attribute_4_detail_id':
            case 'car.distributor_attribute.custom_car_attribute_5_detail_id':
            case 'car.distributor_attribute.custom_car_attribute_6_detail_id':
            case 'car.distributor_attribute.custom_car_attribute_7_detail_id':
            case 'car.distributor_attribute.custom_car_attribute_8_detail_id':
            case 'car.distributor_attribute.custom_car_attribute_9_detail_id':
            case 'car.distributor_attribute.custom_car_attribute_10_detail_id':
            case 'car.customer_id':
            case 'car.car_management_attribute.rental_car_kind':
              return this._getResourceValueName(path, _.get(this.params, path));
            case 'car.car_identification.model':
              return _.get(this.params, 'car.car_identification.model_label');
            case 'car.car_identification.type_rev':
              return _.get(this.params, 'car.car_identification.type_label');
            case 'car.distributor_attribute.delivery_date':
              return _.get(
                this.params,
                'car.distributor_attribute.delivery_date_formatted'
              );
            case 'car.distributor_attribute.used_delivery_date':
              return _.get(
                this.params,
                'car.distributor_attribute.used_delivery_date_formatted'
              );
            case 'car.distributor_attribute.production_year_month':
              return _.get(
                this.params,
                'car.distributor_attribute.production_year_month_formatted'
              );
            case 'car.distributor_attribute.stock_status_update_date':
              return _.get(
                this.params,
                'car.distributor_attribute.stock_status_update_date_formatted'
              );
            case 'car.user_permission_sub_group_ids':
              return this._formatSubGroupIds(_.get(this.params, path), path);
            case 'car.car_management_attribute.time_difference':
              return this.formatTimeDifference(_.get(this.params, path));
            default:
              return _.get(this.params, path);
          }
        })();
      }
    });

    return result;
  }

  /**
   * サブグループの文言を成形して返す
   * @param subGroupIds サブグループの配列
   * @param path パス
   */
  protected _formatSubGroupIds(subGroupIds, path) {
    return _.chain(subGroupIds)
      .orderBy()
      .map(subGroupId => {
        return this._getResourceValueName(path, subGroupId);
      })
      .value()
      .join(', ');
  }

  /**
   * 時差のパラメータを解釈しプルダウンに反映する
   * @param diff 時差（文字列形式）
   */
  protected _reflectTimeDifference(diff: string) {
    this.timeDifference = this.createTimeDifference(diff);
  }

  /**
   * 担当DB変更時、依存するリソースを取得する
   */
  protected async _handleSupportDistributorChange(supportDbId: string) {
    return await this.carService.fetchSupportDistributorIdBelongParams(
      this.screenCode,
      supportDbId
    );
  }

  /**
   * 担当DB・メーカ変更時、依存するリソースを取得する
   */
  protected async _handleSupportDistributorOrMakerChange(
    makerCode: string,
    supportDbId?: string,
    identifier?: string
  ) {
    return await this.carService.fetchModelsBySupportDistributorIdAndMakerCode(
      this.screenCode,
      makerCode,
      supportDbId,
      identifier
    );
  }

  /**
   * 担当DB・機種変更時、依存するリソースを取得する
   */
  protected async _handleSupportDistributorOrModelChange(
    model: string,
    supportDbId?: string,
    identifier?: string
  ) {
    return await this.carService.fetchTypesBySupportDistributorIdAndModel(
      this.screenCode,
      model,
      supportDbId,
      identifier
    );
  }

  /**
   * フォームグループを初期化
   * @param fg フォームグループ
   * @param path パス
   */
  private _initializeFormGroup(fg: FormGroup, path: string) {
    fg.addControl(path, new FormGroup({}));
    return fg.get(path);
  }

  /**
   * 確認モーダルを開く
   * @param transitionPath 遷移後パス
   */
  private _registerModalOpen(transitionPath: string) {
    const detailInfoPaths =
      _.get(this.params, 'car.distributor_attribute.new_used_kind') ===
        NewUsedKind.usedCar
        ? _.filter(
          this.detailInfoPaths,
          path => !_.includes(this.excludeNewKindModalHeader, path)
        )
        : _.filter(
          this.detailInfoPaths,
          path => !_.includes(this.excludeUsedKindModalHeader, path)
        );
    this.mainInfoHeader = this._createSubmitModalHeader(this.mainInfoPaths);
    this.mainInfoParams = this._createSubmitModalParams(this.mainInfoPaths);
    this.detailInfoHeader = this._createSubmitModalHeader(detailInfoPaths);
    this.detailInfoParams = this._createSubmitModalParams(detailInfoPaths);
    this.modalService.open({
      title: this.labels.submit_modal_title,
      labels: this.labels,
      content: this.detailSubmitModalContent,
      ok: async () => {
        this._clearError();
        const params = this._formatParams(this.params);
        params.car.car_management_attribute.time_difference =
          params.car.car_management_attribute.time_difference === '-0000' ? '+0000' :
          params.car.car_management_attribute.time_difference;
        return this._register(params, transitionPath)
          .then(res => {
            if (!this.isUpdate) {
              this.isVisibleCompleteSubmit = true;
            }
          })
          .catch(errorData => this._setError(errorData, this.alertService));
      },
    });
  }

  /**
   * 登録モーダルのヘッダを作成する
   * @param paths 対象となる項目のパス
   */
  private _createSubmitModalHeader(paths) {
    let displayable;
    return paths.map(path => {
      displayable = this.exists(path);
      return {
        label: displayable
          ? _.get(this.resource, path + '.name') || this.labels[path]
          : '',
        name: path,
        displayable,
      };
    });
  }

  /**
   * パラメータから必要な値のみを取り出す
   * @param params パラメータ
   */
  private _formatParams(params, keys: string = '', isArray: boolean = false) {
    const initValue = _.isArray(params) ? [] : {};

    return _.reduce(
      params,
      (obj, value, key) => {
        // キーが添え字でない
        if (!_.isNumber(key)) {
          keys += _.isEmpty(keys) ? key : `.${key}`;
        }
        // Array以外のObjectの場合
        if (Object.prototype.toString.call(value) === '[object Object]') {
          obj[key] = this._formatParams(value, keys);
        } else if (_.isArray(value)) {
          obj[key] = _.compact(this._formatParams(value, keys, true));
        } else {
          if (
            this.exists(keys)
              ? !this._extraExcludedParams(keys)
              : this._extraIncludedParams(keys)
          ) {
            obj[key] = value;
          }
        }

        if (!isArray) {
          // 除外パラメタのキー比較用のキーより「.」の最後の要素を取り除く
          // 例. cars.distributor_attribute.asset_status_kind => cars.distributor_attribute
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
   * リソースに含まれないがパラメータに含める項目を判定する
   * @param key キー名
   */
  private _extraIncludedParams(key) {
    if (_.includes(this.notIncludedParamKeys, key)) {
      return true;
    }

    if (key === 'car.car_identification.update_datetime') {
      return this.isUpdate;
    }

    return false;
  }

  /**
   * リソースに含まれるがパラメータに含めない項目を判定する
   * @param key キー名
   */
  private _extraExcludedParams(key: string) {
    if (_.includes(this.extraExcludedParamKeys, key)) {
      return true;
    }

    if (this.isUsedKind) {
      return _.includes(this.excludedUsedKindParamKeys, key);
    } else {
      return _.includes(this.excludedNewKindParamKeys, key);
    }
  }

  /**
   * 車両登録画面表示制御API を実行
   */
  private async _carRegistrationControl(): Promise<any> {
    let requestParams = _.cloneDeep(this.registControlParams);
    if (
      _.isEmpty(
        this.registControlParams.car.car_management_attribute
          .registration_car_kind
      )
    ) {
      requestParams = _.omit(requestParams, 'car.car_management_attribute');
    }

    const res = await this.carService.carRegistrationControl(requestParams);
    this.isUsedKind = false;
    const message = _.get(res, 'result_data.confirmation_message.message');
    if (message != null) {
      this.confirmMessage = _.get(
        res,
        'result_data.confirmation_message.message'
      );
    } else {
      this.isRetrofit =
        _.get(
          res,
          'result_data.car.car_management_attribute.registration_car_kind'
        ) === RegistrationCarKind.retrofit;
      const { car } = res.result_data;

      await Promise.all([
        this._getDetailSubmitResource(res, car),
        this._getTimeDifferenceResource(res, car),
        this._getCarIdBelongResource(res),
      ]);

      this._buildFormControls();
      this.isVisibleDetailSubmit = true;
    }
    return;
  }

  private async _getDetailSubmitResource(res: any, car: any) {
    const resource = await this.carService.getDetailSubmitResource(
      _.map(_.get(res, 'result_data.possible_input_items'), 'resource_path'),
      this.exists('car.support_distributor_id')
        ? _.get(car, 'support_distributor.id')
        : null
    );
    _.merge(this.resource, resource);

    this.params.car.car_management_attribute.registration_car_kind =
      res.result_data.car.car_management_attribute.registration_car_kind;
    this.params.car.car_identification.maker_code =
      res.result_data.car.car_identification.maker_code;
    this.params.car.car_identification.model =
      res.result_data.car.car_identification.model;
    this.params.car.car_identification.type_rev =
      res.result_data.car.car_identification.type_rev;
    this.params.car.car_identification.serial =
      res.result_data.car.car_identification.serial;
    this.params.car.support_distributor_id =
      res.result_data.car.support_distributor.id;
    _.set(
      this.params,
      'car.car_identification.maker_label',
      res.result_data.car.car_identification.maker_name
    );
    _.set(
      this.params,
      'car.car_identification.model_label',
      res.result_data.car.car_identification.model
    );
    _.set(
      this.params,
      'car.car_identification.type_label',
      res.result_data.car.car_identification.type_rev
    );

    Promise.resolve(null).then(() => {
      _.set(
        this.params,
        'car.komtrax_unit.terminal_component.part',
        this.isRetrofit
          ? ''
          : _.get(res, 'result_data.car.komtrax_unit.terminal_component.part')
      );
      _.set(
        this.params,
        'car.komtrax_unit.terminal_component.serial',
        this.isRetrofit
          ? ''
          : _.get(
            res,
            'result_data.car.komtrax_unit.terminal_component.serial'
          )
      );
      _.set(
        this.params,
        'car.car_identification.initial_smr',
        this.isRetrofit
          ? ''
          : _.get(res, 'result_data.car.car_identification.initial_smr')
      );
    });
    _.set(
      this.params,
      'car.car_identification.update_datetime',
      _.get(res, 'result_data.car.car_identification.update_datetime')
    );
    _.set(
      this.params,
      'car.support_distributor_label',
      res.result_data.car.support_distributor.label
    );
    _.set(
      this.params,
      'car.distributor_attribute.asset_status_kind',
      _.get(res, 'result_data.car.distributor_attribute.asset_status_kind')
    );
    // 資産状態のリソースが存在しない場合
    if (!this.exists('distributor_attribute.asset_status_kind')) {
      _.set(
        this.params,
        'car.distributor_attribute.asset_status_name',
        _.get(res, 'result_data.car.distributor_attribute.asset_status_name')
      );
    }
    _.set(
      this.params,
      'car.distributor_attribute.asset_owner_id',
      _.get(res, 'result_data.car.distributor_attribute.asset_owner_id')
    );
    // 資産所有者のリソースが存在しない場合
    if (!this.exists('distributor_attribute.asset_owner_id')) {
      _.set(
        this.params,
        'car.distributor_attribute.asset_owner_name',
        _.get(res, 'result_data.car.distributor_attribute.asset_owner_name')
      );
    }
    // 顧客へのデータ公開 納入日以降のみ公開をデフォルトとする
    _.set(
      this.params,
      'car.distributor_attribute.data_publish_kind',
      DataPublishKind.afterDeliveryDate
    );
    _.set(
      this.params,
      'car.car_management_attribute.rental_car_kind',
      RentalCarKind.support
    );
  }

  private async _getTimeDifferenceResource(res: any, car: any) {
    const { maker_code, model, type_rev, serial } = car.car_identification;
    const timeDifferenceResouce = await this.fetchTimeDifferenceResouce({
      screenCode: this.registScreenCode,
      maker_code,
      model,
      type_rev,
      serial,
    });
    const {
      time_difference,
      time_difference_minute,
    } = timeDifferenceResouce.car.car_management_attribute;
    _.set(
      this.resource,
      'car.car_management_attribute.time_difference',
      time_difference
    );
    _.set(
      this.resource,
      'car.car_management_attribute.time_difference_minute',
      time_difference_minute
    );
    _.set(
      this.params,
      'car.car_management_attribute.time_difference',
      _.get(
        res,
        'result_data.car.car_management_attribute.support_distributor_time_difference'
      )
    );

    // 時差設定区分が30分の場合はリソースから15, 45を削除する
    if (
      TimeDifferenceSettingKind.thirtyMinutes ===
      _.get(
        res,
        'result_data.car.car_management_attribute.time_difference_setting_kind'
      )
    ) {
      this.resource.car.car_management_attribute.time_difference_minute = this.omitTimeDifferenceMinuteResourceValues(
        this.resource.car.car_management_attribute.time_difference_minute
      );
      this.resource.car.car_management_attribute.time_difference = this.omitTimeDifferenceHourResourceValues(
        this.resource.car.car_management_attribute.time_difference
      );
    }
    this._reflectTimeDifference(
      _.get(this.params, 'car.car_management_attribute.time_difference')
    );
    const today = this.datePickerService.toMoment();
    _.set(
      this.params,
      'car.distributor_attribute.stock_status_update_date',
      today.format(DateFormat.hyphen)
    );
    _.set(
      this.params,
      'car.distributor_attribute.stock_status_update_date_formatted',
      today.format(this.datePickerService.inputDateFormat(this.dateFormat))
    );
    _.set(
      this.params,
      'car.distributor_attribute.delivery_date',
      today.format(DateFormat.hyphen)
    );
    _.set(
      this.params,
      'car.distributor_attribute.delivery_date_formatted',
      today.format(this.datePickerService.inputDateFormat(this.dateFormat))
    );
    const _window = window as any;
    if (_.get(_window, 'settings.carParams.intendedUseCode')) {
      _.set(
        this.params,
        'car.distributor_attribute.intended_use_code',
        _window.settings.carParams.intendedUseCode
      );
    }
    if (_.get(_window, 'settings.carParams.debitKind')) {
      _.set(
        this.params,
        'car.distributor_attribute.debit_kind',
        _window.settings.carParams.debitKind
      );
    }
    if (_.get(_window, 'settings.carParams.dataPublishKind')) {
      _.set(
        this.params,
        'car.distributor_attribute.data_publish_kind',
        _window.settings.carParams.dataPublishKind
      );
    }

    this.eqp_delivery_date = _.get(
      res,
      'result_data.car.distributor_attribute.eqp_delivery_date'
    );
    this.eqp_used_delivery_date = _.get(
      res,
      'result_data.car.distributor_attribute.eqp_used_delivery_date'
    );
  }

  private async _getCarIdBelongResource(res: any) {
    if (this.isRetrofit) {
      return Promise.resolve();
    }

    const carId = _.get(res, 'result_data.car.car_identification.id');
    const carIdBelongResource = await this.carService.fetchCarIdBelongResource(
      this.registScreenCode,
      carId
    );
    _.set(
      this.resource,
      'car.komtrax_unit.terminal_component.part',
      _.get(carIdBelongResource, 'car.komtrax_unit.terminal_component.part')
    );
    _.set(
      this.resource,
      'car.komtrax_unit.terminal_component.serial',
      _.get(
        carIdBelongResource,
        'car.komtrax_unit.terminal_component.serial'
      )
    );
  }
}
