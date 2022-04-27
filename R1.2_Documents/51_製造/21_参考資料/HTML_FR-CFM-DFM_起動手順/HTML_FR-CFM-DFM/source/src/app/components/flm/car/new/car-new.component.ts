import * as moment from 'moment';
import * as _ from 'lodash';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { CarParams } from '../../../../types/flm/car';

import { CarFormComponent } from '../shared/form/car-form.component';

import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { CarService } from '../../../../services/flm/car/car.service';
import { KbaDatePickerService } from '../../../../services/shared/kba-date-picker.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';
import { FilterReservedWord } from '../../../../constants/condition';
import { ScreenCode } from '../../../../constants/flm/screen-codes/car-management';
import { Resources, Resource } from '../../../../types/common';

@Component({
  selector: 'app-car-new',
  templateUrl: '../shared/form/car-form.component.html',
  styleUrls: ['../shared/form/car-form.component.scss'],
  providers: [KbaDatePickerService],
})
export class CarNewComponent extends CarFormComponent {
  isUpdate = false;
  isFormBuildUp = true;
  warningLabel: string;
  FilterReservedWord = FilterReservedWord;
  screenCode = ScreenCode.regist;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    alertService: KbaAlertService,
    modalService: KbaModalService,
    datePickerService: KbaDatePickerService,
    carService: CarService,
    api: ApiService,
    router: Router,
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

  /**
   * 車両管理登録APIを実行
   * @param params パラメータ
   * @param path 遷移後のパス
   */
  protected async _register(params: CarParams, path?: string) {
    const res = await this.carService.createCar(params);
    this.orbcommApplyLabels = {
      model: _.get(res.result_data, 'car.car_identification.model'),
      maker_name: _.get(res.result_data, 'car.car_identification.maker_name'),
      type: _.get(res.result_data, 'car.car_identification.type_rev'),
      serial: _.get(res.result_data, 'car.car_identification.serial'),
      komtrax_unit_part: _.get(
        res.result_data,
        'car.komtrax_unit.main_component.part'
      ),
      komtrax_unit_serial: _.get(
        res.result_data,
        'car.komtrax_unit.main_component.serial'
      ),
    };
    this.orbcommApplyKinds = {
      smr_interval_item_custom_kind: _.get(
        res.result_data,
        'car.car_management_attribute.smr_interval_item_custom_kind'
      ),
      accumulate_fuel_interval_item_custom_kind: _.get(
        res.result_data,
        'car.car_management_attribute.accumulate_fuel_interval_item_custom_kind'
      ),
      orbcomm_request_target_kind: _.get(
        res.result_data,
        'car.car_management_attribute.orbcomm_request_target_kind'
      ),
    };
    this.carId = _.get(res.result_data, 'car.car_identification.id');
    const resource = await this.carService.getApplyOrbcommResourceByCarId(
      this.carId,
      ScreenCode.regist
    );

    _.set(
      this.orbcommApplyParams,
      'orbcomm_request.nation_id',
      _.get(res.result_data, 'car.car_management_attribute.nation_id')
    );
    Object.assign(this.resource, resource);

    this.warningLabel =
      res.result_data.warning_data != null &&
        res.result_data.warning_data.length > 0
        ? res.result_data.warning_data.map(data => data.message)
        : null;
  }

  /**
   * フォームに入力された内容をリセットする
   */
  protected _reset(): void {
    this.selectBoxes.toArray().forEach(th => {
      if (
        (!this.exists('car.support_distributor_id') &&
          th.kbaName === 'support_distributor_id') ||
        (!this.exists('car.distributor_attribute.asset_status_kind') &&
          th.kbaName === 'asset_status_kind') ||
        (!this.exists('car.distributor_attribute.asset_owner_id') &&
          th.kbaName === 'asset_owner_id')
      ) {
        return;
      }
      th.reset();
    });
    this.makerSelect.refresh();
    this.carForm.reset();
    this.carDetailForm.reset();
    this.selectedSubGroupIds = [];
  }

  protected _fetchDataForInitialize() {
    return new Promise(resolve => {
      this.carService.fetchInitNew().then(res => {
        this.initialize(res);
        this.labels = res.label;
        this.resource = this._filterResource(res.resource);
        this._setTitle();
        this._afterInitialize();
        this.loading = false;
        resolve();
      });
    });
  }

  /**
   * 担当DBの選択肢に応じてリソースをフィルタリングする
   * @param resource リソース
   */
  private _filterResource(resource: Resources) {
    if (_.get(resource, 'car.support_distributor_id') == null) {
      return resource;
    }

    const supportDBValues = resource.car.support_distributor_id.values;
    resource.car.support_distributor_id.values =
      (supportDBValues.length === 1) && (supportDBValues[0].value === this.api.getGroupId()) ? [] : supportDBValues;

    return resource;
  }
}
