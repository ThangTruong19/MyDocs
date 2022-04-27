import * as _ from 'lodash';
import * as moment from 'moment';
import {
  Component,
  ViewChild,
  TemplateRef,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { CarParams } from '../../../../types/flm/car';

import { UpdateTargetKind, NewUsedKind } from '../../../../constants/flm/car';
import { ManagementTarget } from '../../../../constants/flm/car';
import { DateFormat, YearMonthFormat } from '../../../../constants/date-format';

import { CarFormComponent } from '../shared/form/car-form.component';
import { KbaSelectedComponent } from '../../../shared/kba-selected/kba-selected.component';

import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { CarService } from '../../../../services/flm/car/car.service';
import { KbaDatePickerService } from '../../../../services/shared/kba-date-picker.service';
import { KbaMonthPickerService } from '../../../../services/shared/kba-month-picker.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';
import { ScreenCode } from '../../../../constants/flm/screen-codes/car-management';

@Component({
  selector: 'app-car-edit',
  templateUrl: '../shared/form/car-form.component.html',
  styleUrls: ['../shared/form/car-form.component.scss'],
  providers: [KbaDatePickerService, KbaMonthPickerService],
})
export class CarEditComponent extends CarFormComponent {
  @ViewChild('errorModalContent', { static: false })
  errorModalContent: TemplateRef<null>;
  @ViewChild('time_difference', { static: false })
  timeDifferenceSelect: KbaSelectedComponent;
  @ViewChild('time_difference_minute', { static: false })
  timeDifferenceMinuteSelect: KbaSelectedComponent;

  isUpdate = true;
  isFormBuildUp = false;
  target: any;
  carId: '';
  screenCode = ScreenCode.edit;

  mainInfoUpdatePaths = [
    'car.car_identification.maker_code',
    'car.car_identification.model',
    'car.car_identification.type_rev',
    'car.car_identification.serial',
    'car.car_identification.initial_smr',
  ];
  attributeUpdatePaths = [
    'car.car_management_attribute.time_difference', // 時差
    'car.distributor_attribute.asset_status_kind', // 資産状態
    'car.distributor_attribute.asset_owner_id', // 資産所有者
    'car.distributor_attribute.custom_car_attribute_1_detail_id', // カスタム属性１
    'car.distributor_attribute.custom_car_attribute_2_detail_id', // カスタム属性２
    'car.distributor_attribute.custom_car_attribute_3_detail_id', // カスタム属性３
    'car.distributor_attribute.custom_car_attribute_4_detail_id', // カスタム属性４
    'car.distributor_attribute.custom_car_attribute_5_detail_id', // カスタム属性５
    'car.distributor_attribute.custom_car_attribute_6_detail_id', // カスタム属性６
    'car.distributor_attribute.custom_car_attribute_7_detail_id', // カスタム属性７
    'car.distributor_attribute.custom_car_attribute_8_detail_id', // カスタム属性８
    'car.distributor_attribute.custom_car_attribute_9_detail_id', // カスタム属性９
    'car.distributor_attribute.custom_car_attribute_10_detail_id', // カスタム属性１０
    'car.distributor_attribute.custom_car_attribute_10_detail_id', // カスタム属性１０
    'car.distributor_attribute.free_memo', // メモ
    'car.distributor_attribute.note_1', // 備考１
    'car.distributor_attribute.note_2', // 備考２
    'car.distributor_attribute.note_3', // 備考３
    'car.distributor_attribute.note_4', // 備考４
    'car.distributor_attribute.note_5', // 備考５
    'car.distributor_attribute.class_1_id', // 分類１
    'car.distributor_attribute.class_2_id', // 分類２
    'car.distributor_attribute.class_3_id', // 分類３
    'car.distributor_attribute.class_4_id', // 分類４
    'car.distributor_attribute.class_5_id', // 分類５
    'car.distributor_attribute.intended_use_code', // 使用目的
    'car.distributor_attribute.debit_kind', // 債権
    'car.customer_id', // 顧客
    'car.user_permission_sub_group_ids', // サブグループ
    'car.bank_id', // 銀行
    'car.insurance_id', // 保険
    'car.finance_id', // ファイナンス
    'car.distributor_attribute.new_used_kind', // 新車中古車区分
    'car.distributor_attribute.delivery_date', // 車両納入日
    'car.distributor_attribute.used_delivery_date', // 中古車納入日
    'car.distributor_attribute.used_delivery_smr', // 中古車納入時SMR
    'car.distributor_attribute.production_year_month', // 製造年月
    'car.distributor_attribute.data_publish_kind', // 顧客へのデータ公開
    'car.distributor_attribute.spec_pattern_id', // 仕様パターン
  ];
  managementTargets = [ManagementTarget.all, ManagementTarget.subGroup];
  submitModalLabels: { [key: string]: string } = {};

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    alertService: KbaAlertService,
    modalService: KbaModalService,
    carService: CarService,
    api: ApiService,
    datePickerService: KbaDatePickerService,
    private monthPickerService: KbaMonthPickerService,
    router: Router,
    private activatedRoute: ActivatedRoute,
    private ref: ChangeDetectorRef,
    userSettingService: UserSettingService
  ) {
    super(
      nav,
      title,
      header,
      alertService,
      modalService,
      carService,
      datePickerService,
      api,
      router,
      userSettingService
    );
  }

  get updateContentHeader() {
    return this.mainInfoHeader.concat(this.detailInfoHeader);
  }

  get updateContentParams() {
    return _.merge(this.mainInfoParams, this.detailInfoParams);
  }

  /**
   * 端末品番・シリアルの値が存在するかを判定する
   */
  isTerminalInformationNull() {
    const {
      komtrax_unit: {
        terminal_component: { part, serial },
      },
    } = this.params.car;

    return part == null && serial == null;
  }

  /**
   * 車両管理登録APIを実行
   * @param params パラメータ
   * @param path 遷移後のパス
   */
  protected async _register(params: CarParams, path?: string) {
    let param = this._reflectParams(params);

    // 車両変更: 変更対象が「サブグループのみ」の場合はサブグループ・必須パラメータ以外のパラメータを除外する
    if (this.isManagementTargetSubgroup) {
      const subGroupParamKeys = [
        'car.user_permission_sub_group_ids',
        'car.car_identification.serial',
        'car.car_identification.initial_smr',
        'car.car_identification.update_datetime',
        'car.distributor_attribute.new_used_kind',
        'car.distributor_attribute.stock_status_update_date',
        'car.distributor_attribute.data_publish_kind',
        'car.car_management_attribute.time_difference',
      ];

      // 新車中古車区分が「新車」の場合は車両納入日をリクエストする
      if (_.get(param, 'car.distributor_attribute.new_used_kind') === NewUsedKind.newCar) {
        subGroupParamKeys.push('car.distributor_attribute.delivery_date');
      } else if (_.get(param, 'car.distributor_attribute.new_used_kind') === NewUsedKind.usedCar) {
        subGroupParamKeys.push('car.distributor_attribute.used_delivery_date');
      }

      param = _.pick(param, subGroupParamKeys);
    }

    return this.carService.updateCars(this.carId, param).then(
      res => {
        this.router.navigateByUrl(path).then(e => {
          this._reset();

          if (
            res.result_data.warning_data == null ||
            res.result_data.warning_data.length === 0
          ) {
            this.alertService.show(this.labels.complete_message);
          } else {
            this.alertService.show(
              res.result_data.warning_data.map(data => data.message),
              true,
              'warning'
            );
          }
        });
      },
      error => { }
    );
  }

  /**
   * フォームに入力された内容をリセットする
   */
  protected async _reset() {
    await this._getFirstResource();
    this._restoreData();
    this.makerSelectDetail.refresh(false);
    this.modelSelectDetail.refresh(false);
    this.typeSelectDetail.refresh(false);
    this.refreshFormTextInput();
    this.selectBoxes.toArray().forEach((th) => {
      if ((!this.exists('car.support_distributor_id') && th.kbaName === 'support_distributor_id') ||
        (!this.exists('car.distributor_attribute.asset_status_kind') && th.kbaName === 'asset_status_kind') ||
        (!this.exists('car.distributor_attribute.asset_owner_id') && th.kbaName === 'asset_owner_id') ||
        (_.includes(['maker_code', 'model', 'type_rev', 'support_distributor_id'], th.kbaName))) {
        return;
      }
      th.refresh();
    });
  }

  protected async _fetchDataForInitialize() {
    const searchParams = {
      common: {
        car_identification: {
          car_ids: [],
        },
      },
    };
    this.activatedRoute.params.subscribe(p => {
      this.carId = p.id;
      _.set(searchParams, 'common.car_identification.car_ids', [p.id]);
    });

    const res = await this.carService.fetchEditInitData(searchParams);
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this.target = res.target.result_data.cars[0];

    if (this.target == null) {
      this.loading = false;
      this.params = null;
      return;
    }
    // 更新対象
    _.set(this.registControlParams, 'update_target_kind', UpdateTargetKind.attribute);
    await this._getFirstResource();
    this._restoreData();
    this._buildFormControls();
    this.safeDetectChanges();
    // サービス対象が0:全て, 1:サブグループのみ以外の場合
    if (
      !_.includes(
        this.managementTargets,
        _.get(this.target, 'user_permission.management_target_code')
      )
    ) {
      this.modalService.open({
        title: this.labels.error_modal_title,
        labels: this.labels,
        content: this.errorModalContent,
        showCloseBtn: false,
        ok: () => this._redirectIndex(),
      });
    } else {
      this.loading = false;
    }
  }

  /**
   * 登録モーダルのパラメータを整形する
   * @param paths 対象となる項目のパス
   */
  protected _createSubmitModalParams(paths) {
    const result = {};
    paths.forEach(path => {
      let value = '';
      let params = {};
      if (this.exists(path)) {
        result[path] = (() => {
          switch (path) {
            // 主要情報変更
            case 'car.car_identification.maker_code': // メーカ
              return this.isMainInfoUpdate
                ? this._getResourceValueName(path, _.get(this.params, path))
                : _.get(
                  this.initialParams,
                  'car.car_identification.maker_label'
                );
            case 'car.car_identification.model': // 機種
              return this.isMainInfoUpdate
                ? this._getResourceValueName(path, _.get(this.params, path))
                : _.get(
                  this.initialParams,
                  'car.car_identification.model_label'
                );
            case 'car.car_identification.type_rev': // 型式
              return this.isMainInfoUpdate
                ? this._getResourceValueName(path, _.get(this.params, path))
                : _.get(
                  this.initialParams,
                  'car.car_identification.type_label'
                );
            case 'car.car_identification.initial_smr': // 初期SMR
            case 'car.car_identification.serial': // 機番
              params = this.isMainInfoUpdate
                ? _.cloneDeep(this.params)
                : _.cloneDeep(this.initialParams);
              return _.get(params, path);
            // 属性変更
            case 'car.car_management_attribute.time_difference': // 時差
              value = this.isAttributeUpdate
                ? _.get(this.params, path)
                : _.get(this.initialParams, path);
              return this.formatTimeDifference(value);
            case 'car.car_management_attribute.rental_car_kind': // レンタル機
            case 'car.distributor_attribute.asset_status_kind': // 資産状態
            case 'car.distributor_attribute.asset_owner_id': // 資産所有者
            case 'car.distributor_attribute.custom_car_attribute_1_detail_id': // カスタム属性１
            case 'car.distributor_attribute.custom_car_attribute_2_detail_id': // カスタム属性２
            case 'car.distributor_attribute.custom_car_attribute_3_detail_id': // カスタム属性３
            case 'car.distributor_attribute.custom_car_attribute_4_detail_id': // カスタム属性４
            case 'car.distributor_attribute.custom_car_attribute_5_detail_id': // カスタム属性５
            case 'car.distributor_attribute.custom_car_attribute_6_detail_id': // カスタム属性６
            case 'car.distributor_attribute.custom_car_attribute_7_detail_id': // カスタム属性７
            case 'car.distributor_attribute.custom_car_attribute_8_detail_id': // カスタム属性８
            case 'car.distributor_attribute.custom_car_attribute_9_detail_id': // カスタム属性９
            case 'car.distributor_attribute.custom_car_attribute_10_detail_id': // カスタム属性１０
            case 'car.bank_id': // 銀行
            case 'car.insurance_id': // 保険
            case 'car.finance_id': // ファイナンス
            case 'car.distributor_attribute.new_used_kind': // 新車中古車区分
            case 'car.distributor_attribute.data_publish_kind': // 顧客へのデータ公開
            case 'car.distributor_attribute.spec_pattern_id': // 仕様パターン
            case 'car.distributor_attribute.class_1_id': // 分類１
            case 'car.distributor_attribute.class_2_id': // 分類２
            case 'car.distributor_attribute.class_3_id': // 分類３
            case 'car.distributor_attribute.class_4_id': // 分類４
            case 'car.distributor_attribute.class_5_id': // 分類５
            case 'car.distributor_attribute.intended_use_code': // 使用目的
            case 'car.distributor_attribute.debit_kind': // 債権
            case 'car.customer_id': // 顧客
              value = this.isAttributeUpdate
                ? _.get(this.params, path)
                : _.get(this.initialParams, path);
              return this._getResourceValueName(path, value);
            case 'car.user_permission_sub_group_ids': // サブグループ
              value = this.isAttributeUpdate
                ? _.get(this.params, path)
                : _.get(this.initialParams, path);
              return this._formatSubGroupIds(value, path);
            case 'car.distributor_attribute.stock_status_update_date':
              return this.isAttributeUpdate
                ? _.get(
                  this.params,
                  'car.distributor_attribute.stock_status_update_date_formatted'
                )
                : _.get(
                  this.initialParams,
                  'car.distributor_attribute.stock_status_update_date_formatted'
                );
            case 'car.distributor_attribute.delivery_date':
              return this.isAttributeUpdate
                ? _.get(
                  this.params,
                  'car.distributor_attribute.delivery_date_formatted'
                )
                : _.get(
                  this.initialParams,
                  'car.distributor_attribute.delivery_date_formatted'
                );
            case 'car.distributor_attribute.used_delivery_date':
              return this.isAttributeUpdate
                ? _.get(
                  this.params,
                  'car.distributor_attribute.used_delivery_date_formatted'
                )
                : _.get(
                  this.initialParams,
                  'car.distributor_attribute.used_delivery_date_formatted'
                );
            case 'car.distributor_attribute.production_year_month':
              return this.isAttributeUpdate
                ? _.get(
                  this.params,
                  'car.distributor_attribute.production_year_month_formatted'
                )
                : _.get(
                  this.initialParams,
                  'car.distributor_attribute.production_year_month_formatted'
                );
            // 参照のみ
            case 'car.komtrax_unit.terminal_component.part': // 端末品番
            case 'car.komtrax_unit.terminal_component.serial': // 端末シリアル
              return _.get(this.params, path);
            case 'car.support_distributor_id': // 担当DB
              return this._getResourceValueName(path, _.get(this.params, path));
            default:
              params = this.isAttributeUpdate
                ? _.cloneDeep(this.params)
                : _.cloneDeep(this.initialParams);
              return _.get(params, path);
          }
        })();

        if (this.isManagementTargetSubgroup && this.submitModalLabels[path] != null) {
          result[path] = this.submitModalLabels[path];
        }
      }
    });

    return result;
  }

  /**
   * 更新対象に応じたパラメタを反映する
   * @param params パラメータ
   * @param 反映後パラメータ
   */
  private _reflectParams(params: CarParams): object {
    const paths = this.isAttributeUpdate
      ? this.mainInfoUpdatePaths
      : this.attributeUpdatePaths;
    const reflectParams = _.cloneDeep(params);

    paths.forEach(path => {
      _.set(reflectParams, path, _.get(this.initialParams, path));
    });
    const registParams = _.omit(reflectParams, [
      'car.support_distributor_id',
      'car.komtrax_unit',
      'car.car_identification.type_rev',
    ]);
    _.set(
      registParams,
      'car.car_identification.type_rev',
      _.get(reflectParams, 'car.car_identification.type_rev')
    );

    return registParams;
  }

  /**
   * 一覧取得より取得したデータでリソースの取得をする
   */
  private async _getFirstResource() {
    const makerCode = _.get(this.target, 'car_identification.maker_code');
    const model = _.get(this.target, 'car_identification.model');
    const type_rev = _.get(this.target, 'car_identification.type_rev');
    const serial = _.get(this.target, 'car_identification.serial');
    const supportDbId = _.get(this.target, 'support_distributor.id');

    // 担当DB変更
    if (this.exists('car.support_distributor_id', true)) {
      const supportDbResource = await this._handleSupportDistributorChange(supportDbId);
      this.resource = _.merge(this.resource, supportDbResource);
    }
    // メーカー変更
    if (this.exists('car.car_identification.maker_code', true)) {
      const makerResource = await this._handleSupportDistributorOrMakerChange(makerCode, supportDbId);
      this.resource = _.merge(this.resource, makerResource);
    }
    // 機種変更
    if (this.exists('car.car_identification.model', true)) {
      const modelResource = await this._handleSupportDistributorOrModelChange(model, supportDbId);
      this.resource = _.merge(this.resource, modelResource);
    }

    // 端末品番、端末シリアル
    const carIdBelongResource = await this.carService.fetchCarIdBelongResource(
      ScreenCode.edit,
      _.get(this.target, 'car_identification.id')
    );
    _.set(
      this.resource,
      'car.komtrax_unit.terminal_component.part',
      _.get(carIdBelongResource, 'car.komtrax_unit.terminal_component.part')
    );
    _.set(
      this.resource,
      'car.komtrax_unit.terminal_component.serial',
      _.get(carIdBelongResource, 'car.komtrax_unit.terminal_component.serial')
    );
    // 時差
    const timeDifferenceResouce = await this.fetchTimeDifferenceResouce({
      screenCode: this.screenCode,
      maker_code: makerCode,
      model: model,
      type_rev: type_rev,
      serial: serial,
    });
    _.set(
      this.resource,
      'car.car_management_attribute.time_difference',
      _.get(
        timeDifferenceResouce,
        'car.car_management_attribute.time_difference'
      )
    );
    _.set(
      this.resource,
      'car.car_management_attribute.time_difference_minute',
      _.get(
        timeDifferenceResouce,
        'car.car_management_attribute.time_difference_minute'
      )
    );
  }

  /**
   * 一覧取得より取得したデータで画面の初期状態を復元する
   */
  private async _restoreData() {
    // パラメタ復元
    // 主要情報
    this._restoreMainInfoParams();

    // 詳細情報
    _.merge(this.params, this.registControlParams);
    const dateParams = this._restoreDetailParams();

    if (
      ManagementTarget.subGroup ===
      _.get(this.target, 'user_permission.management_target_code')
    ) {
      this.isManagementTargetSubgroup = true;
    }

    await this._afterInitialize();

    // ラベル取得
    // 主要情報
    this._restoreMainInfoLabels();

    // 詳細情報
    this._restoreDetailLabels(dateParams);
  }

  /**
   * 主要情報のパラメータを復元する
   */
  private _restoreMainInfoParams() {
    _.set(this.registControlParams, 'car.car_identification.maker_code', _.get(this.target, 'car_identification.maker_code'));
    _.set(this.registControlParams, 'car.car_identification.model', _.get(this.target, 'car_identification.model'));
    _.set(this.registControlParams, 'car.car_identification.type_rev', _.get(this.target, 'car_identification.type_rev'));
    _.set(this.registControlParams, 'car.car_identification.serial', _.get(this.target, 'car_identification.serial'));
    _.set(this.registControlParams, 'car.support_distributor_id', _.get(this.target, 'support_distributor.id'));
  }

  /**
   * 詳細情報のパラメータを復元する
   */
  private _restoreDetailParams() {
    _.set(
      this.params,
      'car.car_identification.update_datetime',
      _.get(this.target, 'car_identification.update_datetime')
    );
    _.set(
      this.params,
      'car.komtrax_unit.terminal_component.part',
      _.get(this.target, 'komtrax_unit.main_component.part')
    );
    _.set(
      this.params,
      'car.komtrax_unit.terminal_component.serial',
      _.get(this.target, 'komtrax_unit.main_component.serial')
    );
    _.set(
      this.params,
      'car.distributor_attribute.debit_kind',
      _.get(this.target, 'distributor_attribute.debit_kind')
    );
    _.set(
      this.params,
      'car.distributor_attribute.free_memo',
      _.get(this.target, 'distributor_attribute.free_memo')
    );
    _.set(
      this.params,
      'car.distributor_attribute.new_used_kind',
      _.get(this.target, 'distributor_attribute.new_used_kind')
    );
    const deliveryDate = _.get(
      this.target,
      'distributor_attribute.delivery_date'
    );
    _.set(
      this.params,
      'car.distributor_attribute.delivery_date_formatted',
      deliveryDate
    );
    const usedDeliveryDate = _.get(
      this.target,
      'distributor_attribute.used_delivery_date'
    );
    _.set(
      this.params,
      'car.distributor_attribute.used_delivery_date_formatted',
      usedDeliveryDate
    );
    _.set(
      this.params,
      'car.distributor_attribute.used_delivery_smr',
      _.get(this.target, 'distributor_attribute.used_delivery_smr')
    );
    const productionYearMonth = _.get(
      this.target,
      'distributor_attribute.production_year_month'
    );
    _.set(
      this.params,
      'car.distributor_attribute.production_year_month_formatted',
      productionYearMonth
    );
    _.set(
      this.params,
      'car.distributor_attribute.asset_status_kind',
      _.cloneDeep(_.get(this.target, 'distributor_attribute.asset_status_kind'))
    );
    _.set(
      this.params,
      'car.distributor_attribute.asset_owner_id',
      _.get(this.target, 'distributor_attribute.asset_owner_id')
    );
    _.set(
      this.params,
      'car.distributor_attribute.spec_pattern_id',
      _.get(this.target, 'distributor_attribute.spec_pattern_id')
    );
    _.set(
      this.params,
      'car.distributor_attribute.note_1',
      _.get(this.target, 'distributor_attribute.note_1')
    );
    _.set(
      this.params,
      'car.distributor_attribute.note_2',
      _.get(this.target, 'distributor_attribute.note_2')
    );
    _.set(
      this.params,
      'car.distributor_attribute.note_3',
      _.get(this.target, 'distributor_attribute.note_3')
    );
    _.set(
      this.params,
      'car.distributor_attribute.note_4',
      _.get(this.target, 'distributor_attribute.note_4')
    );
    _.set(
      this.params,
      'car.distributor_attribute.note_5',
      _.get(this.target, 'distributor_attribute.note_5')
    );
    _.set(
      this.params,
      'car.distributor_attribute.class_1_id',
      _.get(this.target, 'distributor_attribute.class_1.id')
    );
    _.set(
      this.params,
      'car.distributor_attribute.class_2_id',
      _.get(this.target, 'distributor_attribute.class_2.id')
    );
    _.set(
      this.params,
      'car.distributor_attribute.class_3_id',
      _.get(this.target, 'distributor_attribute.class_3.id')
    );
    _.set(
      this.params,
      'car.distributor_attribute.class_4_id',
      _.get(this.target, 'distributor_attribute.class_4.id')
    );
    _.set(
      this.params,
      'car.distributor_attribute.class_5_id',
      _.get(this.target, 'distributor_attribute.class_5.id')
    );
    _.set(
      this.params,
      'car.distributor_attribute.custom_car_attribute_1_detail_id',
      _.get(
        this.target,
        'distributor_attribute.custom_car_attribute_1.detail_id'
      )
    );
    _.set(
      this.params,
      'car.distributor_attribute.custom_car_attribute_2_detail_id',
      _.get(
        this.target,
        'distributor_attribute.custom_car_attribute_2.detail_id'
      )
    );
    _.set(
      this.params,
      'car.distributor_attribute.custom_car_attribute_3_detail_id',
      _.get(
        this.target,
        'distributor_attribute.custom_car_attribute_3.detail_id'
      )
    );
    _.set(
      this.params,
      'car.distributor_attribute.custom_car_attribute_4_detail_id',
      _.get(
        this.target,
        'distributor_attribute.custom_car_attribute_4.detail_id'
      )
    );
    _.set(
      this.params,
      'car.distributor_attribute.custom_car_attribute_5_detail_id',
      _.get(
        this.target,
        'distributor_attribute.custom_car_attribute_5.detail_id'
      )
    );
    _.set(
      this.params,
      'car.distributor_attribute.custom_car_attribute_6_detail_id',
      _.get(
        this.target,
        'distributor_attribute.custom_car_attribute_6.detail_id'
      )
    );
    _.set(
      this.params,

      'car.distributor_attribute.custom_car_attribute_7_detail_id',
      _.get(
        this.target,
        'distributor_attribute.custom_car_attribute_7.detail_id'
      )
    );
    _.set(
      this.params,
      'car.distributor_attribute.custom_car_attribute_8_detail_id',
      _.get(
        this.target,
        'distributor_attribute.custom_car_attribute_8.detail_id'
      )
    );
    _.set(
      this.params,
      'car.distributor_attribute.custom_car_attribute_9_detail_id',
      _.get(
        this.target,
        'distributor_attribute.custom_car_attribute_9.detail_id'
      )
    );
    _.set(
      this.params,
      'car.distributor_attribute.custom_car_attribute_10_detail_id',
      _.get(
        this.target,
        'distributor_attribute.custom_car_attribute_10.detail_id'
      )
    );
    const stockStatusUpdateDate = _.get(
      this.target,
      'distributor_attribute.stock_status_update_date'
    );
    _.set(
      this.params,
      'car.distributor_attribute.stock_status_update_date_formatted',
      stockStatusUpdateDate
    );
    _.set(
      this.params,
      'car.distributor_attribute.stock_status_update_date',
      this.datePickerService.convertDateString(
        stockStatusUpdateDate,
        this.datePickerService.getCurrentDateFormat(),
        DateFormat.hyphen
      )
    );

    _.set(
      this.params,
      'car.distributor_attribute.intended_use_code',
      _.cloneDeep(_.get(this.target, 'distributor_attribute.intended_use_code'))
    );
    _.set(
      this.params,
      'car.distributor_attribute.data_publish_kind',
      _.get(this.target, 'distributor_attribute.data_publish_kind')
    );
    _.set(this.params, 'car.customer_id', _.get(this.target, 'customer.id'));
    this.selectedSubGroupIds = _.cloneDeep(
      _.map(_.get(this.target, 'user_permission.sub_groups'), 'id')
    );
    _.set(this.params, 'car.bank_id', _.get(this.target, 'bank.id'));
    _.set(this.params, 'car.insurance_id', _.get(this.target, 'insurance.id'));
    _.set(this.params, 'car.finance_id', _.get(this.target, 'finance.id'));
    _.set(
      this.params,
      'car.car_identification.initial_smr',
      _.get(this.target, 'car_identification.initial_smr')
    );
    _.set(
      this.params,
      'car.car_management_attribute.time_difference',
      _.get(this.target, 'car_management_attribute.time_difference') ||
      _.get(
        this.target,
        'car_management_attribute.support_distributor_time_difference'
      )
    );
    _.set(
      this.params,
      'car.car_management_attribute.rental_car_kind',
      _.get(this.target, 'car_management_attribute.rental_car_kind')
    );
    this._reflectTimeDifference(_.get(this.params, 'car.car_management_attribute.time_difference'));
    _.set(this.params, 'car.car_management_attribute.rental_car_kind', _.get(this.target, 'car_management_attribute.rental_car_kind'));

    return {
      deliveryDate,
      usedDeliveryDate,
      stockStatusUpdateDate,
      productionYearMonth,
    };
  }

  /**
   * 主要情報のラベルを復元する
   */
  private _restoreMainInfoLabels() {
    // メーカ
    _.set(
      this.registControlParams,
      'car.car_identification.maker_label',
      this._getLabel(
        'car.car_identification.maker_code',
        'car_identification.maker_name',
        _.get(this.target, 'car_identification.maker_code')
      )
    );
    // 機種
    _.set(
      this.registControlParams,
      'car.car_identification.model_label',
      this._getLabel(
        'car.car_identification.model',
        'car_identification.model',
        _.get(this.target, 'car_identification.model')
      )
    );
    // 型式
    _.set(
      this.registControlParams,
      'car.car_identification.type_label',
      this._getLabel(
        'car.car_identification.type_rev',
        'car_identification.type_rev',
        _.get(this.target, 'car_identification.type_rev')
      )
    );
    // 担当DB
    _.set(
      this.registControlParams,
      'car.support_distributor_label',
      this._getLabel(
        'car.support_distributor_id',
        'support_distributor.label',
        _.get(this.target, 'support_distributor.id')
      )
    );
  }

  /**
   * 詳細情報のラベルを復元する
   */
  private async _restoreDetailLabels({
    deliveryDate,
    usedDeliveryDate,
    stockStatusUpdateDate,
    productionYearMonth,
  }) {
    // メーカ
    _.set(
      this.params,
      'car.car_identification.maker_label',
      this._getLabel(
        'car.car_identification.maker_code',
        'car_identification.maker_name',
        _.get(this.target, 'car_identification.maker_code')
      )
    );
    // 機種
    _.set(
      this.params,
      'car.car_identification.model_label',
      this._getLabel(
        'car.car_identification.model',
        'car_identification.model',
        _.get(this.target, 'car_identification.model')
      )
    );
    // 型式
    _.set(
      this.params,
      'car.car_identification.type_label',
      this._getLabel(
        'car.car_identification.type_rev',
        'car_identification.type_rev',
        _.get(this.target, 'car_identification.type_rev')
      )
    );
    // 担当DB
    _.set(
      this.params,
      'car.support_distributor_label',
      this._getLabel(
        'car.support_distributor_id',
        'support_distributor.label',
        _.get(this.target, 'support_distributor.id')
      )
    );

    // 時差
    await this.timeDifferenceSelect.refresh(false);
    await this.timeDifferenceMinuteSelect.refresh(false);

    // 資産状態
    const assetStatusName = _.get(this.target, 'distributor_attribute.asset_status_name');
    _.set(
      this.params,
      'car.distributor_attribute.asset_status_name',
      assetStatusName
    );
    this.submitModalLabels['car.distributor_attribute.asset_status_kind'] = assetStatusName;
    // 資産所有者
    const assetOwnerName = _.get(this.target, 'distributor_attribute.asset_owner_name');
    _.set(
      this.params,
      'car.distributor_attribute.asset_owner_name',
      assetOwnerName
    );
    this.submitModalLabels['car.distributor_attribute.asset_owner_id'] = assetOwnerName;

    // カスタム属性１
    _.set(
      this.params,
      'car.distributor_attribute.custom_car_attribute_1_detail_name',
      this._getLabel(
        'car.distributor_attribute.custom_car_attribute_1_detail_id',
        'distributor_attribute.custom_car_attribute_1.detail_name',
        this.params.car.distributor_attribute.custom_car_attribute_1_detail_id
      )
    );
    // カスタム属性２
    _.set(
      this.params,
      'car.distributor_attribute.custom_car_attribute_2_detail_name',
      this._getLabel(
        'car.distributor_attribute.custom_car_attribute_2_detail_id',
        'distributor_attribute.custom_car_attribute_2.detail_name',
        this.params.car.distributor_attribute.custom_car_attribute_2_detail_id
      )
    );
    // カスタム属性３
    _.set(
      this.params,
      'car.distributor_attribute.custom_car_attribute_3_detail_name',
      this._getLabel(
        'car.distributor_attribute.custom_car_attribute_3_detail_id',
        'distributor_attribute.custom_car_attribute_3.detail_name',
        this.params.car.distributor_attribute.custom_car_attribute_3_detail_id
      )
    );
    // カスタム属性４
    _.set(
      this.params,
      'car.distributor_attribute.custom_car_attribute_4_detail_name',
      this._getLabel(
        'car.distributor_attribute.custom_car_attribute_4_detail_id',
        'distributor_attribute.custom_car_attribute_4.detail_name',
        this.params.car.distributor_attribute.custom_car_attribute_4_detail_id
      )
    );
    // カスタム属性５
    _.set(
      this.params,
      'car.distributor_attribute.custom_car_attribute_5_detail_name',
      this._getLabel(
        'car.distributor_attribute.custom_car_attribute_5_detail_id',
        'distributor_attribute.custom_car_attribute_5.detail_name',
        this.params.car.distributor_attribute.custom_car_attribute_5_detail_id
      )
    );
    // カスタム属性６
    _.set(
      this.params,
      'car.distributor_attribute.custom_car_attribute_6_detail_name',
      this._getLabel(
        'car.distributor_attribute.custom_car_attribute_6_detail_id',
        'distributor_attribute.custom_car_attribute_6.detail_name',
        this.params.car.distributor_attribute.custom_car_attribute_6_detail_id
      )
    );
    // カスタム属性７
    _.set(
      this.params,
      'car.distributor_attribute.custom_car_attribute_7_detail_name',
      this._getLabel(
        'car.distributor_attribute.custom_car_attribute_7_detail_id',
        'distributor_attribute.custom_car_attribute_7.detail_name',
        this.params.car.distributor_attribute.custom_car_attribute_7_detail_id
      )
    );
    // カスタム属性８
    _.set(
      this.params,
      'car.distributor_attribute.custom_car_attribute_8_detail_name',
      this._getLabel(
        'car.distributor_attribute.custom_car_attribute_8_detail_id',
        'distributor_attribute.custom_car_attribute_8.detail_name',
        this.params.car.distributor_attribute.custom_car_attribute_8_detail_id
      )
    );
    // カスタム属性９
    _.set(
      this.params,
      'car.distributor_attribute.custom_car_attribute_9_detail_name',
      this._getLabel(
        'car.distributor_attribute.custom_car_attribute_9_detail_id',
        'distributor_attribute.custom_car_attribute_9.detail_name',
        this.params.car.distributor_attribute.custom_car_attribute_9_detail_id
      )
    );
    // カスタム属性１０
    _.set(
      this.params,
      'car.distributor_attribute.custom_car_attribute_10_detail_name',
      this._getLabel(
        'car.distributor_attribute.custom_car_attribute_10_detail_id',
        'distributor_attribute.custom_car_attribute_10.detail_name',
        this.params.car.distributor_attribute.custom_car_attribute_10_detail_id
      )
    );

    // 分類１
    _.set(
      this.params,
      'car.distributor_attribute.class_1_name',
      this._getLabel(
        'car.distributor_attribute.class_1_id',
        'distributor_attribute.class_1.label',
        this.params.car.distributor_attribute.class_1_id
      )
    );
    // 分類２
    _.set(
      this.params,
      'car.distributor_attribute.class_2_name',
      this._getLabel(
        'car.distributor_attribute.class_2_id',
        'distributor_attribute.class_2.label',
        this.params.car.distributor_attribute.class_2_id
      )
    );
    // 分類３
    _.set(
      this.params,
      'car.distributor_attribute.class_3_name',
      this._getLabel(
        'car.distributor_attribute.class_3_id',
        'distributor_attribute.class_3.label',
        this.params.car.distributor_attribute.class_3_id
      )
    );
    // 分類４
    _.set(
      this.params,
      'car.distributor_attribute.class_4_name',
      this._getLabel(
        'car.distributor_attribute.class_4_id',
        'distributor_attribute.class_4.label',
        this.params.car.distributor_attribute.class_4_id
      )
    );
    // 分類５
    _.set(
      this.params,
      'car.distributor_attribute.class_5_name',
      this._getLabel(
        'car.distributor_attribute.class_5_id',
        'distributor_attribute.class_5.label',
        this.params.car.distributor_attribute.class_5_id
      )
    );

    // 使用目的
    _.set(
      this.params,
      'car.distributor_attribute.intended_use_name',
      this._getLabel(
        'car.distributor_attribute.intended_use_code',
        'distributor_attribute.intended_use_name',
        this.params.car.distributor_attribute.intended_use_code
      )
    );
    // 債権
    _.set(
      this.params,
      'car.distributor_attribute.debit_name',
      this._getLabel(
        'car.distributor_attribute.debit_kind',
        'distributor_attribute.debit_name',
        this.params.car.distributor_attribute.debit_kind
      )
    );
    // 顧客
    _.set(
      this.params,
      'car.customer_name',
      this._getLabel(
        'car.customer_id',
        'customer.label',
        this.params.car.customer_id
      )
    );
    // 銀行
    _.set(
      this.params,
      'car.bank_name',
      this._getLabel(
        'car.bank_id',
        'bank.label',
        this.params.car.bank_id
      )
    );
    // 保険
    _.set(
      this.params,
      'car.insurance_name',
      this._getLabel(
        'car.insurance_id',
        'insurance.label',
        this.params.car.insurance_id
      )
    );
    // ファイナンス
    _.set(
      this.params,
      'car.finance_name',
      this._getLabel(
        'car.finance_id',
        'finance.label',
        this.params.car.finance_id
      )
    );
    // 新車中古車区分
    _.set(
      this.params,
      'car.distributor_attribute.new_used_kind_label',
      this._getLabel(
        'car.distributor_attribute.new_used_kind',
        'distributor_attribute.new_used_name',
        this.params.car.distributor_attribute.new_used_kind
      )
    );
    // 顧客へのデータ公開
    _.set(
      this.params,
      'car.distributor_attribute.data_publish_kind_name',
      this._getLabel(
        'car.distributor_attribute.data_publish_kind',
        'distributor_attribute.data_publish_name',
        this.params.car.distributor_attribute.data_publish_kind
      )
    );
    // 仕様パターン
    _.set(
      this.params,
      'car.distributor_attribute.spec_pattern_name',
      this._getLabel(
        'car.distributor_attribute.spec_pattern_id',
        'distributor_attribute.spec_pattern_name',
        this.params.car.distributor_attribute.spec_pattern_id
      )
    );
    // レンタル機
    _.set(
      this.params,
      'car.car_management_attribute.rental_car_kind_name',
      this._getLabel(
        'car.car_management_attribute.rental_car_kind',
        'car_management_attribute.rental_car_name',
        this.params.car.car_management_attribute.rental_car_kind
      )
    );
    // 車両納入日
    _.set(
      this.params,
      'car.distributor_attribute.delivery_date',
      _.isEmpty(deliveryDate)
        ? ''
        : moment(
          deliveryDate,
          this.datePickerService.inputDateFormat(this.dateFormat)
        ).format(DateFormat.hyphen)
    );
    // 中古車納入日
    _.set(
      this.params,
      'car.distributor_attribute.used_delivery_date',
      _.isEmpty(usedDeliveryDate)
        ? ''
        : moment(
          usedDeliveryDate,
          this.datePickerService.inputDateFormat(this.dateFormat)
        ).format(DateFormat.hyphen)
    );
    // 製造年月
    _.set(
      this.params,
      'car.distributor_attribute.production_year_month',
      _.isEmpty(productionYearMonth)
        ? ''
        : moment(
          productionYearMonth,
          this.monthPickerService.inputDateFormat(this.dateFormat)
        ).format(YearMonthFormat.hyphen)
    );
    // 在庫状況更新日
    _.set(
      this.params,
      'car.distributor_attribute.stock_status_update_date',
      _.isEmpty(stockStatusUpdateDate)
        ? ''
        : moment(
          stockStatusUpdateDate,
          this.datePickerService.inputDateFormat(this.dateFormat)
        ).format(DateFormat.hyphen)
    );
    this.initialParams = _.cloneDeep(this.params);
    // サブグループ
    _.set(
      this.initialParams,
      'car.user_permission_sub_group_ids',
      _.cloneDeep(_.map(_.get(this.target, 'user_permission.sub_groups'), 'id'))
    );
    // EQPcare車両納入日
    this.eqp_delivery_date = _.get(
      this.target,
      'distributor_attribute.eqp_delivery_date'
    );
    // EQPcare中古車両納入日
    this.eqp_used_delivery_date = _.get(
      this.target,
      'distributor_attribute.eqp_used_delivery_date'
    );
  }

  /**
   * 変更画面に表示するラベルを取得
   * @param resoucePath リソースのパス
   * @param labelPath API返却値の文言のパス
   * @param paramValue パラメータの値
   */
  private _getLabel(resoucePath: string, labelPath: string, paramValue: any) {
    const label = this.isManagementTargetSubgroup ?
      _.get(this.target, labelPath) :
      this._getResourceValueName(resoucePath, paramValue);

    this.submitModalLabels[resoucePath] = label;
    return label;
  }

  /**
   * 車両管理一覧に遷移します。
   */
  private _redirectIndex() {
    this.router.navigateByUrl('cars');
  }
}
