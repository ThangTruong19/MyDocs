import * as _ from 'lodash';
import { Title } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { FlagConditionParams } from '../../../../types/opa/flag-condition';
import { ScreenCode } from '../../../../constants/opa/screen-codes/flag-condition-management';

import { FlagConditionFormComponent } from '../shared/form/flag-condition-form.component';

import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { FlagConditionService } from '../../../../services/opa/flag-condition/flag-condition.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';

@Component({
  selector: 'app-flag-condition-edit',
  templateUrl: '../shared/form/flag-condition-form.component.html',
  styleUrls: [
    '../shared/form/flag-condition-form.component.scss',
    '../shared/caution-icon.scss',
  ],
  providers: [FlagConditionService],
})
export class FlagConditionEditComponent extends FlagConditionFormComponent {
  isUpdate = true;
  flagConditionId = '';
  target: any;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    router: Router,
    header: CommonHeaderService,
    alert: KbaAlertService,
    modal: KbaModalService,
    flagConditionService: FlagConditionService,
    private activatedRoute: ActivatedRoute
  ) {
    super(nav, title, header, router, alert, modal, flagConditionService);
    this.screenCode = ScreenCode.edit;
  }

  protected async _fetchDataForInitialize() {
    const searchParams = {
      flag_condition_id: '',
      flag_kind_code: '',
    };
    this.activatedRoute.params.subscribe(
      p => (this.flagConditionId = searchParams.flag_condition_id = p.id)
    );
    this.activatedRoute.queryParams.subscribe(
      qp => (searchParams.flag_kind_code = qp.flag_kind_code)
    );
    const res = await this.flagConditionService.fetchEditInitData(searchParams);
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this.target = res.target.result_data.flag_conditions[0];

    if (this.target == null) {
      this.params = null;
      this.loading = false;
      return;
    }

    const res2 = await this.flagConditionService.fetchCautionResource(
      this.screenCode,
      searchParams.flag_kind_code
    );
    this.resource.flag_condition = {
      ...this.resource.flag_condition,
      ...res2.flag_condition,
    };
    this.loading = false;
    this._restoreData();
    this._refreshFormControl();
  }

  /**
   * フラグ条件更新処理
   *
   * @param params フラグ条件情報
   * @param path 登録後遷移先のパス
   */
  protected _register(params: FlagConditionParams, path: string): void {
    this._showLoadingSpinner();

    this.flagConditionService
      .updateFlagConditions(this.flagConditionId, params)
      .then(
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
    this._restoreData();
    this._refreshFormControl();
  }

  /**
   * 一覧取得より取得したデータで画面の初期状態を復元する
   */
  private _restoreData() {
    this.params.flag_condition = _.cloneDeep(this.target);
    if (this.isSelectedKindCaution()) {
      this.minimum_duration = !!_.get(
        this.params,
        'flag_condition.event_condition.occurrence_identification.min_alerm_time'
      );
    }
  }

  private _refreshFormControl() {
    const {
      free_memo,
      event_condition: {
        detection_condition_code,
        occurrence_identification: {
          occurrence_days,
          decision_period,
          min_alerm_time,
          consecutive_occurrence_days,
        },
        time_identification: {
          remaining_time_threshold,
        },
      },
    } = this.params.flag_condition;

    if (this.isSelectedKindCaution()) {
      this.flagConditionForm.get('cautionGroup').setValue({
        minimum_duration: this.minimum_duration,
        min_alerm_time,
        detection_condition_code,
        decisionPeriodGroup: {
          occurrence_days,
          decision_period,
        },
        consecutive_occurrence_days,
      });
      this.onEvaluationCodeChange(detection_condition_code);
      this.onCheckedMininumDuration(this.minimum_duration);
    } else {
      this.flagConditionForm.get('replacementTimeGroup').setValue({
        remaining_time_threshold,
      });
    }
    if (this.flagConditionForm.get('free_memo')) {
      this.flagConditionForm.get('free_memo').setValue(
        free_memo
      );
    }
  }
}
