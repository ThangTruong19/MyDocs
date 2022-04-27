import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import { FuelParams } from '../../../../types/flm/fuel';

import { KindSetting } from '../../../../constants/flm/fuel';

import { FuelFormComponent } from '../../../../components/flm/fuel/shared/form/fuel-form.component';

import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModelRevService } from '../../../../services/shared/kba-model-rev.service';
import { FuelService } from '../../../../services/flm/fuel/fuel.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';
import { ScreenCode } from '../../../../constants/flm/screen-codes/fuel-management';

@Component({
  selector: 'app-fuel-edit',
  templateUrl: '../shared/form/fuel-form.component.html',
  styleUrls: ['../shared/form/fuel-form.component.scss'],
})
export class FuelEditComponent extends FuelFormComponent {
  isUpdate = true;

  // 更新APIのリクエストに含む
  fuelItemId: string;
  updateDatetime: string;
  screenCode = ScreenCode.edit;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    alert: KbaAlertService,
    modal: KbaModalService,
    fuelService: FuelService,
    router: Router,
    header: CommonHeaderService,
    ref: ChangeDetectorRef,
    userSettingService: UserSettingService,
    private activatedRoute: ActivatedRoute,
    private modelRevService: KbaModelRevService
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

  protected async _fetchDataForInitialize(): Promise<void> {
    let id: string;
    this.activatedRoute.params.subscribe(params => (id = params.id));
    const res = await this.fuelService.fetchEditInitData({
      accumulate_fuel_interval_item_id: id,
    });
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();

    if (res.target.result_data.accumulate_fuel_interval_items[0] == null) {
      this.params = null;
      return;
    }

    // 機種型式選択モーダルの共通パーツで使うリソースのキー
    this.resource.accumulate_fuel_interval_item.model_select_type =
      res.resource.accumulate_fuel_interval_item.target_model_kind;
    this.fuelItemId =
      res.target.result_data.accumulate_fuel_interval_items[0].id;
    this.updateDatetime =
      res.target.result_data.accumulate_fuel_interval_items[0].update_datetime;
    this.refModalHeaderParams = this._getModalValues(res.refFields);
    this.initParams = this._formatDataToParams(res.target.result_data);
    this.params = _.cloneDeep(this.initParams);
    this.unit = this.labels[this.userSettingService.getVolumeUnit()];
    if (!this.exists('accumulate_fuel_interval_item.support_distributor_id')) {
      this.safeDetectChanges();
      this.resource.accumulate_fuel_interval_item.division_code = (await this.fuelService.fetchDivisionResource(
        this.screenCode
      )).division_code;
    } else {
      const supportDB =
        res.target.result_data.accumulate_fuel_interval_items[0]
          .support_distributor_id;
      this.handleSupportDistributorChange(supportDB, false);
    }
    this.safeDetectChanges();
    this._refreshFormState();
    this.onLoad();
  }

  /**
   * 更新 API を実行
   */
  protected _register() {
    return this.fuelService.updateFuel(
      this.buildRegistParams(),
      this.fuelItemId,
      this.updateDatetime
    );
  }

  /**
   * 機種型式モーダルをリセット
   * @override
   */
  protected _resetModelRevModal() {
    this._refreshModelRevForm(this.params);
  }

  /**
   * 取得したデータをパラメータに整形する
   * @param params API から取得したパラメータ
   */
  private _formatDataToParams(data) {
    const targetData = data.accumulate_fuel_interval_items[0];

    const result: FuelParams = {
      accumulate_fuel_interval_item: _.pick(targetData, [
        'label',
        'inspection_start_accumulate_fuel',
        'accumulate_fuel_interval_kind',
        'threshold_kind',
        'target_model_kind',
        'car_conditions',
      ]),
    };
    result.accumulate_fuel_interval_item[
      'inspection_start_accumulate_fuel'
    ] = String(targetData.inspection_start_accumulate_fuel);

    if (
      _.has(
        this.resource.accumulate_fuel_interval_item,
        'support_distributor_id'
      )
    ) {
      result.accumulate_fuel_interval_item['support_distributor_id'] =
        targetData.support_distributor_id;
    }

    if (targetData.accumulate_fuel_interval_kind === KindSetting.on) {
      result.accumulate_fuel_interval_item['accumulate_fuel_interval'] = String(
        targetData.accumulate_fuel_interval
      );
    }

    if (targetData.threshold_kind === KindSetting.on) {
      result.accumulate_fuel_interval_item['threshold'] = String(
        targetData.threshold
      ).slice(1);
    }

    this._refreshModelRevForm(result);
    return result;
  }

  /**
   * API で取得したパラメータから選択済みの機種型式を抽出・整形する
   * @param params パラメータ
   */
  private _formatSelectedDivisions(params) {
    const target = params.accumulate_fuel_interval_item.car_conditions;

    const temp = _.groupBy(target, 'division_code');
    _.forEach(
      temp,
      (v, k) =>
        (temp[k] = _.map(_.groupBy(v, 'model'), (divisions, model) => ({
          model,
          divisions,
        })))
    );

    return temp;
  }

  /**
   * 機種型式選択フォームを更新
   * @param params パラメータ
   */
  private _refreshModelRevForm(params) {
    this.modelRevParams.modelSelectType =
      params.accumulate_fuel_interval_item.target_model_kind;
    this.allModels = _.isEmpty(
      params.accumulate_fuel_interval_item.car_conditions
    );
    this.selectedDivisions = this._formatSelectedDivisions(params);
    this._formatSelectedDivisionsForDisplay();
    this.modelRevOk = this.modelRevService.isValid(
      this.modelRevParams,
      this.selectedDivisions
    );
  }
}
