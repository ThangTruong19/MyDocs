import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { cloneDeep, isEmpty, pick, omit, map, groupBy, forEach } from 'lodash';

import { FlagParams } from '../../../../types/flm/flag';

import {
  EvaluationCode,
  ModelSelectType,
} from '../../../../constants/flm/flag';

import { FlagFormComponent } from '../shared/form/flag-form.component';

import { FlagService } from '../../../../services/flm/flag/flag.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModelRevService } from '../../../../services/shared/kba-model-rev.service';

@Component({
  selector: 'app-flag-edit',
  templateUrl: '../shared/form/flag-form.component.html',
  styleUrls: ['../shared/form/flag-form.component.scss'],
})
export class FlagEditComponent extends FlagFormComponent {
  isUpdate = true;
  flagConditionId;
  supportDistributorLabel: string;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    alert: KbaAlertService,
    modal: KbaModalService,
    flag: FlagService,
    router: Router,
    header: CommonHeaderService,
    private activatedRoute: ActivatedRoute,
    private ref: ChangeDetectorRef,
    private modelRevService: KbaModelRevService
  ) {
    super(nav, title, alert, modal, flag, router, header);
  }

  protected _register(): Promise<any> {
    return this.flagService.updateFlag(this.flagConditionId, this.apiParams);
  }

  protected async _fetchDataForInitialize() {
    const params = {
      flag_condition_id: null,
      group_id: null,
    };
    this.activatedRoute.params.subscribe(
      p => (this.flagConditionId = params.flag_condition_id = p.id)
    );
    this.activatedRoute.queryParams.subscribe(
      p => (params.group_id = p.group_id_param)
    );

    const res = await this.flagService.fetchEditInitData(params);
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this.supportDistributorLabel = '';
    if (res.target.result_data.flag_conditions && res.target.result_data.flag_conditions[0]
      && res.target.result_data.flag_conditions[0].support_distributor_label) {
      this.supportDistributorLabel = res.target.result_data.flag_conditions[0].support_distributor_label;
    }
    this._setTitle();
    this.params = this._formatParams(res.target.result_data.flag_conditions[0]);
    if (this.params == null) {
      return;
    }

    if (this.resource.flag_condition.support_distributor_id == null) {
      this.resource.division_code = (await this.flagService.fetchDivisionResource(
        this.screenCode
      )).division_code;
    } else {
      const supportDB = this.params.flag_condition.support_distributor_id;
      this.handleSupportDistributorChange(supportDB, false);
    }

    this.refModalValues = this._getModalValues(res.refFields);
  }

  /**
   * フォームをリセット
   * @override
   */
  protected _reset() {
    this.params = cloneDeep(this.originalParams);
    this._refreshConditions();
    this.refreshFormTextInput();
    this.flagForm.patchValue({
      ignore_0minute:
        this.params.flag_condition.event_condition.occurrence_identification.ignore_0minute_code,
      detection_condition_code:
        this.params.flag_condition.event_condition.detection_condition_code,
    });

    this.onEvaluationCodeChange(
      this.params.flag_condition.event_condition.detection_condition_code
    );
    super._reset();
  }

  /**
   * 機種型式モーダルをリセット
   * @override
   */
  protected _resetModelRevModal() {
    this._refreshModelRevForm(this.params);
  }

  /**
   * フォーム部品を作成
   * @override
   */
  protected _buildFormControls() {
    if (this.params == null) {
      return;
    }

    super._buildFormControls();
    this._refreshConditions();
  }
  /**
   * パラメータを整形する
   * @param params API から取得したパラメータ
   */
  private _formatParams(params) {
    if (params == null) {
      return null;
    }

    const result: FlagParams = {
      flag_condition: omit(
        pick(params, [
          'flag_code',
          'event_condition.event_code',
          'event_condition.detection_condition_code',
          'event_condition.occurrence_identification',
          'support_distributor_id',
          'car_conditions',
          'free_memo',
          'update_datetime',
        ]),
        [
          'event_condition.occurrence_identification.condition',
          'event_condition.occurrence_identification.ignore_0minute_name',
        ]
      ),
    };
    result.flag_condition.event_condition.occurrence_identification.ignore_0minute_code = !!+params
      .event_condition.occurrence_identification.ignore_0minute_code;
    this._refreshModelRevForm(result);
    this.originalParams = cloneDeep(result);
    return result;
  }

  /**
   * 条件フォームを初期化
   * @param params パラメータ
   */
  private _refreshConditions() {
    let fg;
    let keys: string[];

    this.flagForm.controls.conditions.reset();
    switch (
    this.params.flag_condition.event_condition.detection_condition_code
    ) {
      case EvaluationCode.consecutiveOccurrenceDays:
        fg = this.flagForm.get('conditions.consecutiveOccurrenceDaysGroup');
        keys = ['consecutive_occurrence_days', 'decision_period'];
        break;

      case EvaluationCode.occurrenceDays:
        fg = this.flagForm.get('conditions.occurrenceDaysGroup');
        keys = ['occurrence_days', 'decision_period'];
        break;

      case EvaluationCode.accumulateOccurrenceCount:
        fg = this.flagForm.get('conditions.accumulateOccurrenceCountGroup');
        keys = ['accumulate_occurrence_count'];
        break;
    }
    keys.forEach(key =>
      fg.controls[key].setValue(
        this.params.flag_condition.event_condition.occurrence_identification[
        key
        ]
      )
    );

    this.safeDetectChanges();
  }

  /**
   * API で取得したパラメータから選択済みの機種型式を抽出・整形する
   * @param params パラメータ
   */
  private _formatSelectedDivisions(params) {
    const temp = groupBy(params.flag_condition.car_conditions, 'division_code');
    forEach(
      temp,
      (v, k) =>
        (temp[k] = map(groupBy(v, 'model'), (divisions, model) => ({
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
    this.modelRevParams.modelSelectType = !isEmpty(
      params.flag_condition.car_conditions
    )
      ? ModelSelectType.select
      : ModelSelectType.all;
    this.allModels = isEmpty(params.flag_condition.car_conditions);
    this.selectedDivisions = this._formatSelectedDivisions(params);
    this._formatSelectedDivisionsForDisplay();
    this.modelRevOk = this.modelRevService.isValid(
      this.modelRevParams,
      this.selectedDivisions
    );
  }
}
