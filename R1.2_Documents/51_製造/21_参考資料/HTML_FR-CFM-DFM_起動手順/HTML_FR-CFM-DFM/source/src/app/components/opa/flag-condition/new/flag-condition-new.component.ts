import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { FlagConditionService } from '../../../../services/opa/flag-condition/flag-condition.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { FlagConditionParams } from '../../../../types/opa/flag-condition';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { FlagConditionFormComponent } from '../shared/form/flag-condition-form.component';
import * as _ from 'lodash';
import { Title } from '@angular/platform-browser';
import { FlagConditionKinds } from '../../../../constants/opa/flag-condition-kinds';
import { ScreenCode } from '../../../../constants/opa/screen-codes/flag-condition-management';

@Component({
  selector: 'app-flag-condition-new',
  templateUrl: '../shared/form/flag-condition-form.component.html',
  styleUrls: [
    '../shared/form/flag-condition-form.component.scss',
    '../shared/caution-icon.scss',
  ],
  providers: [FlagConditionService],
})
export class FlagConditionNewComponent extends FlagConditionFormComponent {
  isUpdate = false;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    router: Router,
    header: CommonHeaderService,
    alert: KbaAlertService,
    modal: KbaModalService,
    flagConditionService: FlagConditionService
  ) {
    super(nav, title, header, router, alert, modal, flagConditionService);
    this.screenCode = ScreenCode.regist;
  }

  protected async _fetchDataForInitialize() {
    const res = await this.flagConditionService.fetchInitNew();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this.onSelectFlagKind(FlagConditionKinds.caution);
    const conditionCode = this.params.flag_condition.event_condition.detection_condition_code;
    this.flagConditionForm.get('cautionGroup.detection_condition_code').setValue(conditionCode);
    this.flagConditionForm.get('cautionGroup.min_alerm_time')
      .setValue(this.params.flag_condition.event_condition.occurrence_identification.min_alerm_time);
    this.onEvaluationCodeChange(conditionCode);
    this.onCheckedMininumDuration(this.minimum_duration);
    this.loading = false;
  }

  /**
   * フラグ条件登録処理
   *
   * @param params フラグ条件登録情報
   * @param path 登録後遷移先のパス
   */
  protected _register(params: FlagConditionParams, path: string): void {
    this._showLoadingSpinner();

    this.flagConditionService.createFlagCondition(params).then(
      res => {
        this.router.navigateByUrl(path).then(e => {
          this._reset();

          this._hideLoadingSpinner();
          this.alertService.show(this.labels.finish_message);
        });
      },
      errorData => this._setError(errorData, this.alertService)
    );
  }

  /**
   * フォームに入力された内容をリセットする
   */
  protected _reset() {
    [
      'flag_code',
      'flag_kind_code',
      'free_memo',
    ].forEach(key => this.flagConditionForm.get(key).reset());

    if (this.isSelectedKindCaution()) {
      this.flagConditionForm.get('cautionGroup').reset();
      this.eventCodeSelect.reset();
      this.minimum_duration = false;
      this.flagConditionForm
        .get('cautionGroup.detection_condition_code')
        .setValue(this.detectionConditionCode.consecutive_occurrence_days);
      this.flagConditionForm.controls.flag_code.setValue(this.flagCode.yellow);
      this.flagConditionForm.controls.flag_kind_code.setValue(
        this.kind.caution
      );
      const conditionCode = this.params.flag_condition.event_condition.detection_condition_code;
      this.onEvaluationCodeChange(conditionCode);
      this.onCheckedMininumDuration(this.minimum_duration);
    } else {
      this.flagConditionForm.get('replacementTimeGroup').reset();
      this.flagConditionForm.controls.flag_code.setValue(this.flagCode.red);
      this.flagConditionForm.controls.flag_kind_code.setValue(
        this.kind.replacementTime
      );
    }

    this.selectBoxes.toArray().forEach(th => {
      if (
        !_.has(this.resource, 'flag_condition.group_id') &&
        th.kbaName === 'group_id'
      ) {
        return;
      }
      th.reset();
    });
  }
}
