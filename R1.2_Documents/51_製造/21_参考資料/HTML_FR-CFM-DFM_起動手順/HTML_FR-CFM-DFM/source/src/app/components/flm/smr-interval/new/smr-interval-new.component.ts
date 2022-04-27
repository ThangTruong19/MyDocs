import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import { SmrIntervalParams } from '../../../../types/flm/smr-interval';

import {
  KindSetting,
  TargetModelKind,
} from '../../../../constants/flm/smr-interval';

import { SmrIntervalFormComponent } from '../../../../components/flm/smr-interval/shared/form/smr-interval-form.component';

import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { SmrIntervalService } from '../../../../services/flm/smr-interval/smr-interval.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { ScreenCode } from '../../../../constants/flm/screen-codes/smr-interval-item-management';

@Component({
  selector: 'app-smr-interval-new',
  templateUrl: '../shared/form/smr-interval-form.component.html',
  styleUrls: ['../shared/form/smr-interval-form.component.scss'],
})
export class SmrIntervalNewComponent extends SmrIntervalFormComponent {
  isUpdate = false;
  screenCode = ScreenCode.regist;

  params: SmrIntervalParams = {
    smr_interval_item: {
      label: '',
      inspection_start_smr: '',
      smr_interval: '',
      smr_interval_kind: KindSetting.off,
      threshold: '',
      threshold_kind: KindSetting.off,
      target_model_kind: TargetModelKind.select,
      car_conditions: [],
    },
  };

  constructor(
    nav: KbaNavigationService,
    title: Title,
    alert: KbaAlertService,
    modal: KbaModalService,
    smrIntervalService: SmrIntervalService,
    router: Router,
    header: CommonHeaderService,
    ref: ChangeDetectorRef
  ) {
    super(nav, title, alert, modal, smrIntervalService, router, header, ref);
  }

  protected async _fetchDataForInitialize() {
    const res = await this.smrIntervalService.fetchInitNew();

    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    // 機種型式選択モーダルの共通パーツで使うリソースのキー
    this.resource.smr_interval_item.model_select_type =
      res.resource.smr_interval_item.target_model_kind;

    if (!this.exists('smr_interval_item.support_distributor_id')) {
      this.resource.smr_interval_item.division_code = (await this.smrIntervalService.fetchDivisionResource(
        this.screenCode
      )).division_code;
    } else {
      const supportDB = this.resource.smr_interval_item.support_distributor_id
        .values[0].value;
      this.handleSupportDistributorChange(supportDB);
    }
    this.refModalHeaderParams = this._getModalValues(res.refFields);
    this._setTitle();
    this.onSelectSmrIntervalKind();
    this.onSelectThresholdKind();
    this.onLoad();
  }

  /**
   * SMRインターバル管理項目登録 API を実行
   */
  protected _register() {
    return this.smrIntervalService.createSmrIntervalItems(
      this.buildRegistParams()
    );
  }

  /**
   * フォームの選択内容をリセットする
   */
  protected _reset() {
    if (this.resource.smr_interval_item.support_distributor_id) {
      this.supportDistributorSelect.reset();
    }
    this.smrIntervalForm.reset();
    // formcontrolのリセットだとラジオボタンが消えてしまうため個別に初期化する
    this.params.smr_interval_item.smr_interval_kind = this.smrIntervalKindSetting.off;
    this.params.smr_interval_item.threshold_kind = this.thresholdKindSetting.off;

    this._resetModelRevModal();
  }

  /**
   * 機種型式モーダルの内容をリセットする
   */
  private _resetModelRevModal() {
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
}
