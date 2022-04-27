import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import { FuelParams } from '../../../../types/flm/fuel';

import { KindSetting, TargetModelKind } from '../../../../constants/flm/fuel';

import { FuelFormComponent } from '../../../../components/flm/fuel/shared/form/fuel-form.component';

import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { FuelService } from '../../../../services/flm/fuel/fuel.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';
import { ScreenCode } from '../../../../constants/flm/screen-codes/fuel-management';

@Component({
  selector: 'app-fuel-new',
  templateUrl: '../shared/form/fuel-form.component.html',
  styleUrls: ['../shared/form/fuel-form.component.scss'],
})
export class FuelNewComponent extends FuelFormComponent {
  isUpdate = false;
  screenCode = ScreenCode.regist;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    alert: KbaAlertService,
    modal: KbaModalService,
    fuelService: FuelService,
    router: Router,
    header: CommonHeaderService,
    ref: ChangeDetectorRef,
    userSettingService: UserSettingService
  ) {
    super(
      nav,
      title,
      alert,
      modal,
      fuelService,
      router,
      header,
      ref,
      userSettingService
    );
  }

  /**
   * 初期化処理
   */
  protected async _fetchDataForInitialize() {
    const res = await this.fuelService.fetchInitNew();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    // 機種型式選択モーダルの共通パーツで使うリソースのキー
    this.resource.accumulate_fuel_interval_item.model_select_type =
      res.resource.accumulate_fuel_interval_item.target_model_kind;
    this.refModalHeaderParams = this._getModalValues(res.refFields);
    this.unit = this.labels[this.userSettingService.getVolumeUnit()];
    this._initializeParams();
    this.initParams = _.cloneDeep(this.params);
    if (!this.exists('accumulate_fuel_interval_item.support_distributor_id')) {
      this.resource.accumulate_fuel_interval_item.division_code = (await this.fuelService.fetchDivisionResource(
        this.screenCode
      )).division_code;
    } else {
      const supportDB = this.resource.accumulate_fuel_interval_item
        .support_distributor_id.values[0].value;
      this.handleSupportDistributorChange(supportDB);
    }
    this.onSelectFuelKind();
    this.onSelectThresholdKind();
    this._setTitle();
    this.onLoad();
  }

  /**
   * 登録 API を実行
   */
  protected _register() {
    return this.fuelService.createFuel(this.buildRegistParams());
  }

  /**
   * 機種型式モーダルをリセット
   * @override
   *
   */
  protected _resetModelRevModal() {
    this.tempSelectedDivisions = {};
    this.selectedDivisions = {};
    this.divisionsForDisplay = [];
    this.modelRevParams = {
      modelSelectType: this.modelSelectType.select,
    };
    this.tempModelRevParams = {
      modelSelectType: this.modelSelectType.select,
    };
    this.modelRevOk = false;
    this.allModels = false;
  }

  /**
   * パラメータを初期化
   */
  private _initializeParams(): void {
    this.params = {
      accumulate_fuel_interval_item: {
        label: '',
        inspection_start_accumulate_fuel: '',
        accumulate_fuel_interval: '',
        accumulate_fuel_interval_kind: '0',
        threshold: '',
        threshold_kind: '0',
        target_model_kind: '0',
        car_conditions: [],
      },
    };
    if (this.resource.accumulate_fuel_interval_item.support_distributor_id) {
      this.params.accumulate_fuel_interval_item.support_distributor_id =
        this.resource.accumulate_fuel_interval_item.support_distributor_id.values[0].value;
    }
  }
}
