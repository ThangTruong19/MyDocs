import { Component } from '@angular/core';
import { FlagFormComponent } from '../../../../components/flm/flag/shared/form/flag-form.component';
import { FlagService } from '../../../../services/flm/flag/flag.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { Router } from '@angular/router';
import { ApiService } from '../../../../services/api/api.service';
import { Title } from '@angular/platform-browser';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';

@Component({
  selector: 'app-flag-new',
  templateUrl: '../shared/form/flag-form.component.html',
  styleUrls: ['../shared/form/flag-form.component.scss'],
})
export class FlagNewComponent extends FlagFormComponent {
  isUpdate = false;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    alert: KbaAlertService,
    modal: KbaModalService,
    flag: FlagService,
    router: Router,
    header: CommonHeaderService
  ) {
    super(nav, title, alert, modal, flag, router, header);
  }

  protected async _fetchDataForInitialize() {
    const res = await this.flagService.fetchNewInitData();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    if (this.resource.flag_condition.support_distributor_id == null) {
      this.resource.division_code = (await this.flagService.fetchDivisionResource(
        this.screenCode
      )).division_code;
    } else {
      const supportDB = this.resource.flag_condition.support_distributor_id
        .values[0].value;
      this.handleSupportDistributorChange(supportDB);
    }
    this.refModalValues = this._getModalValues(res.refFields);
    this._setTitle();
  }

  /**
   * フラグ登録 API を実行
   */
  protected _register() {
    return this.flagService.createFlag(this.apiParams);
  }

  /**
   * 機種型式モーダルの内容をリセット
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

  protected _reset() {
    this.flagForm.reset();
    if (this.resource.support_distributor_id) {
      this.supportDistributorSelect.reset();
    }
    this.flagForm.controls.ignore_0minute.setValue(true);
    this.flagForm.controls.detection_condition_code.setValue(
      this.evaluationCode.consecutiveOccurrenceDays
    );
    super._reset();
  }
}
