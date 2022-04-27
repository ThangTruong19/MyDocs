import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import { SmrIntervalParams } from '../../../../types/flm/smr-interval';

import { KindSetting } from '../../../../constants/flm/smr-interval';

import { SmrIntervalFormComponent } from '../../../../components/flm/smr-interval/shared/form/smr-interval-form.component';

import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { SmrIntervalService } from '../../../../services/flm/smr-interval/smr-interval.service';
import { KbaModelRevService } from '../../../../services/shared/kba-model-rev.service';
import { ScreenCode } from '../../../../constants/flm/screen-codes/smr-interval-item-management';

@Component({
  selector: 'app-smr-interval-edit',
  templateUrl: '../shared/form/smr-interval-form.component.html',
  styleUrls: ['../shared/form/smr-interval-form.component.scss'],
})
export class SmrIntervalEditComponent extends SmrIntervalFormComponent {
  isUpdate = true;

  // リセット用の初期パラメータ
  defaultParams: SmrIntervalParams;

  // 更新APIのリクエストに含む
  smrIntervalItemId: string;
  updateDatetime: string;
  screenCode = ScreenCode.edit;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    alert: KbaAlertService,
    modal: KbaModalService,
    smrIntervalService: SmrIntervalService,
    router: Router,
    header: CommonHeaderService,
    ref: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private modelRevService: KbaModelRevService
  ) {
    super(nav, title, alert, modal, smrIntervalService, router, header, ref);
  }

  protected async _fetchDataForInitialize() {
    let queryParams;

    this.activatedRoute.params.subscribe(
      params => (queryParams = { smr_interval_item_id: params.id })
    );

    const res = await this.smrIntervalService.fetchEditInitData(queryParams);
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();

    if (res.target.result_data.smr_interval_items[0] == null) {
      return;
    }

    // 機種型式選択モーダルの共通パーツで使うリソースのキー
    this.resource.smr_interval_item.model_select_type =
      res.resource.smr_interval_item.target_model_kind;
    this.smrIntervalItemId = res.target.result_data.smr_interval_items[0].id;
    this.updateDatetime =
      res.target.result_data.smr_interval_items[0].update_datetime;
    this.defaultParams = this._formatDataToParams(res.target.result_data);
    this.params = _.cloneDeep(this.defaultParams);
    this.refModalHeaderParams = this._getModalValues(res.refFields);
    if (!this.exists('smr_interval_item.support_distributor_id')) {
      this.safeDetectChanges();
      this.resource.smr_interval_item.division_code = (await this.smrIntervalService.fetchDivisionResource(
        this.screenCode
      )).division_code;
    } else {
      const supportDB =
        res.target.result_data.smr_interval_items[0].support_distributor_id;
      this.handleSupportDistributorChange(supportDB, false);
    }

    this._refreshFormState();
    this.safeDetectChanges();
    this.onLoad();
  }

  /**
   * SMRインターバル管理項目更新 API を実行
   */
  protected _register() {
    return this.smrIntervalService.updateSmrIntervalItems(
      this.buildRegistParams(),
      this.smrIntervalItemId,
      this.updateDatetime
    );
  }

  /**
   * フォームの選択内容をリセットする
   */
  protected _reset() {
    this.params = _.cloneDeep(this.defaultParams);
    this._refreshModelRevForm(this.params);
    this._refreshFormState();
  }

  /**
   * 取得したデータをパラメータに整形する
   * @param params API から取得したパラメータ
   */
  private _formatDataToParams(data) {
    const targetData = data.smr_interval_items[0];

    const result: SmrIntervalParams = {
      smr_interval_item: _.pick(targetData, [
        'label',
        'inspection_start_smr',
        'smr_interval_kind',
        'threshold_kind',
        'target_model_kind',
        'car_conditions',
      ]),
    };

    if (_.has(this.resource.smr_interval_item, 'support_distributor_id')) {
      result.smr_interval_item['support_distributor_id'] =
        targetData.support_distributor_id;
    }

    if (targetData.smr_interval_kind === KindSetting.on) {
      result.smr_interval_item['smr_interval'] = targetData.smr_interval;
    }

    if (targetData.threshold_kind === KindSetting.on) {
      result.smr_interval_item['threshold'] = targetData.threshold.slice(1);
    }

    this._refreshModelRevForm(result);
    return result;
  }

  /**
   * API で取得したパラメータから選択済みの機種型式を抽出・整形する
   * @param params パラメータ
   */
  private _formatSelectedDivisions(params) {
    const target = params.smr_interval_item.car_conditions;

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
      params.smr_interval_item.target_model_kind;
    this.allModels = _.isEmpty(params.smr_interval_item.car_conditions);
    this.selectedDivisions = this._formatSelectedDivisions(params);
    this._formatSelectedDivisionsForDisplay();
    this.modelRevOk = this.modelRevService.isValid(
      this.modelRevParams,
      this.selectedDivisions
    );
  }

  /**
   * フォームの入力状態をngFormに反映する
   */
  private _refreshFormState() {
    this.smrIntervalForm.patchValue({
      inspectionStartSmr: this.params.smr_interval_item.inspection_start_smr,
      smrInterval: this.params.smr_interval_item.smr_interval,
      threshold: this.params.smr_interval_item.threshold,
    });
    this.refreshFormTextInput();
    this.onSelectSmrIntervalKind();
    this.onSelectThresholdKind();
  }
}
