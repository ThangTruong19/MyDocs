import { OnInit, ViewChild, TemplateRef, Sanitizer } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {
  DivisionList,
  ModelRevParams,
} from '../../../../../types/flm/model-rev-modal';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import { ModalValues, Resources } from '../../../../../types/common';
import { FlagParams, DetectionConditionCode } from '../../../../../types/flm/flag';

import { CommonState } from '../../../../../constants/common-state';
import { validationPattern } from '../../../../../constants/validation-patterns';
import {
  EvaluationCode,
  ModelSelectType,
} from '../../../../../constants/flm/flag';

import { KbaAbstractRegisterComponent } from '../../../../shared/kba-abstract-component/kba-abstract-register-component';
import { KbaFormTableSelectComponent } from '../../../../shared/kba-form-table-select/kba-form-table-select.component';

import { KbaNavigationService } from '../../../../../services/shared/kba-navigation.service';
import { KbaModalService } from '../../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../../services/shared/kba-alert.service';
import { FlagService } from '../../../../../services/flm/flag/flag.service';
import { CommonHeaderService } from '../../../../../services/shared/common-header.service';
import { ScreenCode } from '../../../../../constants/flm/screen-codes/flag-condition-management';

export abstract class FlagFormComponent extends KbaAbstractRegisterComponent
  implements OnInit {
  @ViewChild(KbaFormTableSelectComponent, { static: false })
  supportDistributorSelect: KbaFormTableSelectComponent;
  @ViewChild('modelRevModalContent', { static: false })
  modelRevModalContent: TemplateRef<any>;
  @ViewChild('refModalContent', { static: false }) refModalContent: TemplateRef<
    any
  >;

  evaluationCode = EvaluationCode;
  modelSelectType = ModelSelectType;

  params: FlagParams = {
    flag_condition: {
      flag_code: '5',
      event_condition: {
        detection_condition_code: '1',
        occurrence_identification: {
          ignore_0minute_code: true,
        },
      },
      car_conditions: [],
    },
  };
  originalParams: FlagParams;
  apiParams: FlagParams;
  flagForm = new FormGroup({});
  numberPattern = validationPattern.numeric;
  selectedDivisions: DivisionList = {};
  tempSelectedDivisions: DivisionList = {};
  divisionsForDisplay = [];
  isUpdate;

  desc: {
    label: string;
    name: string;
    displayable: boolean;
  }[];
  val: {
    [key: string]: string;
  };
  descNames = [
    'flag_condition.support_distributor_id', // 担当 DB
    'flag_condition.flag_code', // フラグ
    'flag_condition.event_condition.event_code', // エラーコード
    'flag_condition.car_conditions', // 機種型式
    'flag_condition.event_condition.detection_condition_code', // 条件種別
    'flag_condition', // 条件
    'flag_condition.event_condition.occurrence_identification.ignore_0minute_code', // オプション
    'flag_condition.free_memo', // メモ
  ];
  modelRevParams: ModelRevParams = {
    modelSelectType: this.modelSelectType.select,
  };
  tempModelRevParams: ModelRevParams;
  divisionList: DivisionList = {};
  refModalData;
  allModels = false;
  modelRevOk = false;
  state = CommonState;
  refModalValues: ModalValues;
  resourceCache: { [key: string]: Resources } = {};
  screenCode: string;
  supportDistributorLabel: string;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    protected alertService: KbaAlertService,
    protected modalService: KbaModalService,
    protected flagService: FlagService,
    protected router: Router,
    protected header: CommonHeaderService
  ) {
    super(nav, title, header);
    this.screenCode = this.isUpdate ? ScreenCode.edit : ScreenCode.regist;
  }

  get evaluationCodeText() {
    const res = this.resource.flag_condition.event_condition.detection_condition_code.values.find(
      r =>
        r.value ===
        this.params.flag_condition.event_condition.detection_condition_code
    );
    return res ? res.name : '';
  }

  ngOnInit() {
    this._fetchDataForInitialize().then(async () => {
      await this.header.setHeader(this.labels, this.resource, this.functions);
      await this._buildFormControls();
      this.onLoad();
    });
  }

  /**
   * 条件種別変更時の処理
   * @param value 条件種別
   */
  onEvaluationCodeChange(value: DetectionConditionCode) {
    if (value == null) {
      return;
    }

    this.params.flag_condition.event_condition.detection_condition_code = value;

    const array = [
      this.flagForm.get('conditions.consecutiveOccurrenceDaysGroup'),
      this.flagForm.get('conditions.occurrenceDaysGroup'),
      this.flagForm.get('conditions.accumulateOccurrenceCountGroup'),
    ];
    array.forEach(group => group.disable());
    array[+value - 1].enable();
  }

  /**
   * 続けて登録ボタン押下時の処理
   */
  onClickContinue() {
    this._registerModalOpen('flags/new');
  }

  /**
   * リセットボタン押下時の処理
   */
  onClickReset(): void {
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      closeBtnLabel: this.labels.cancel,
      ok: () => this._reset(),
    });
  }

  /**
   * 登録ボタン押下時の処理
   */
  onClickSubmit() {
    const path = this.isUpdate ? 'flags' : '';
    this._registerModalOpen(path);
  }

  /**
   * 機種型式選択モーダルを開く
   */
  showModelRevModal() {
    if (this.resource.support_distributor_id) {
      this.modelRevParams.groupId = this.params.flag_condition.support_distributor_id;
    }
    this.tempSelectedDivisions = _.cloneDeep(this.selectedDivisions);
    this.tempModelRevParams = _.cloneDeep(this.modelRevParams);
    this.modalService.open(
      {
        title: this.labels.model_rev_modal_title,
        labels: this.labels,
        content: this.modelRevModalContent,
        enableOk: this.modelRevOk,
        closeBtnLabel: this.labels.cancel,
        ok: () => this._formatSelectedDivisionsForDisplay(),
        close: () => {
          this.selectedDivisions = _.cloneDeep(this.tempSelectedDivisions);
          this.modelRevParams = _.cloneDeep(this.tempModelRevParams);
        },
      },
      {
        size: 'lg',
      }
    );
  }

  /**
   * フォーム項目がエラー状態であるかを判定
   * @param path パス
   */
  isErrorForm(path) {
    return _.some(this.errorData, data => _.includes(data.keys, path));
  }

  /**
   * 担当DB変更時の処理
   * @param value 担当DBID
   * @param reset 機種型式をリセットする
   */
  async handleSupportDistributorChange(value, reset = true) {
    if (this.resourceCache[value] == null) {
      this.resourceCache[value] = await this.flagService.fetchDivisionResource(
        this.screenCode,
        value
      );
    }

    this.resource.division_code = this.resourceCache[value].division_code;

    if (reset) {
      if (this.isUpdate && value === this.originalParams.flag_condition.support_distributor_id) {
        this._resetModelRevModal();
      } else {
        this.selectedDivisions = {};
      }
      this._formatSelectedDivisionsForDisplay();
      this.modelRevOk = false;
      this.allModels = false;
      this.modelRevParams.modelSelectType = ModelSelectType.select;
      this.safeDetectChanges();
    }
  }

  /**
   * 参照モーダルを開く
   * @param params 機種型式モーダルから渡されたパラメータ
   */
  showRefModal = params => {
    this.flagService
      .fetchProfileList(
        {
          ...params,
          group_id: this.params.flag_condition.support_distributor_id,
        },
        this.refModalValues.requestHeaderParams
      )
      .then(res => {
        this.refModalData = res.result_data.flag_condition_links;
        this.modalService.open(
          {
            title: this.labels.ref_modal_title,
            labels: this.labels,
            content: this.refModalContent,
          },
          {
            size: 'lg',
          }
        );
      });
  }

  /**
   * 機種一覧を表示用にフォーマット
   */
  protected _formatSelectedDivisionsForDisplay() {
    let divisions = _.values(this.selectedDivisions).map(array =>
      _.sortBy(array, ['model'])
    );
    divisions = _.flatten(divisions)
      .filter(d => !!d.divisions.length)
      .map(d => {
        return {
          model: d.model,
          divisions: _.sortBy(d.divisions, ['type_rev']),
        };
      });
    this.divisionsForDisplay = _.cloneDeep(divisions);
    this.allModels =
      this.modelRevParams.modelSelectType === this.modelSelectType.all;
    this.modelRevOk = this.modalService.enableOk;
  }

  /**
   * フォームの部品を angular の form に登録します。
   */
  protected _buildFormControls() {
    const conditions = new FormGroup({});
    // 条件種別ラジオボタン
    const detectionConditionCode = this.params.flag_condition.event_condition.detection_condition_code;
    this.flagForm.addControl('detection_condition_code', new FormControl(
      detectionConditionCode
    ));
    // 条件種別: 連続発生
    conditions.addControl(
      'consecutiveOccurrenceDaysGroup',
      new FormGroup({
        consecutive_occurrence_days: new FormControl('', Validators.required),
        decision_period: new FormControl('', Validators.required),
      })
    );
    // 条件種別: 指定期間発生日数
    conditions.addControl(
      'occurrenceDaysGroup',
      new FormGroup({
        occurrence_days: new FormControl('', Validators.required),
        decision_period: new FormControl('', Validators.required),
      })
    );
    // 条件種別: 累積発生回数
    conditions.addControl(
      'accumulateOccurrenceCountGroup',
      new FormGroup({
        accumulate_occurrence_count: new FormControl('', Validators.required),
      })
    );
    this.flagForm.addControl('conditions', conditions);
    // オプション
    this.flagForm.addControl(
      'ignore_0minute',
      new FormControl(
        this.params.flag_condition.event_condition.occurrence_identification.ignore_0minute_code,
        Validators.required
      )
    );
    // メモ
    this.flagForm.addControl('free_memo', new FormControl());

    this.onEvaluationCodeChange(detectionConditionCode);
  }

  /**
   * API にデータを投げます。
   * @param requestParams API に渡すパラメータ
   * @param path 処理後に遷移するパス
   */
  protected abstract _register(): Promise<any>;

  /**
   * フォームの選択内容をリセットします。
   */
  protected _reset() {
    this._clearError();
    this.alertService.close();
    this._resetModelRevModal();
  }

  protected _dataKey(name: string) {
    return name
      .split('.')
      .slice(2)
      .join('.');
  }

  /**
   * 機種型式モーダルの内容をリセット
   */
  protected abstract _resetModelRevModal();

  /**
   * 確認モーダルの内容を作成します。
   */
  private _buildConfirmModalValues(params: FlagParams) {
    return this.descNames.reduce((val, name) => {
      switch (name) {
        case 'flag_condition.support_distributor_id':
          if (this.isUpdate) {
            return {
             ...val,
             [name]: this.supportDistributorLabel,
            };
          } else {
            return {
             ...val,
              [name]: this._getResourceValueName(name, _.get(params, name)),
            };
          }
        case 'flag_condition':
          return {
            ...val,
            [name]: _.map(
              _.omit(
                params.flag_condition.event_condition.occurrence_identification,
                ['ignore_0minute_code']
              ),
              (value, key) => ({
                key: `flag_condition.event_condition.occurrence_identification.${key}`,
                value,
              })
            ),
          };
        default:
          return {
            ...val,
            [name]: _.get(params, name),
          };
      }
    }, {});
  }

  /**
   * API に投げるパラメータを作成します。
   */
  private _buildParams() {
    const params = _.cloneDeep(this.params);
    const ignore_0minute = this.params.flag_condition.event_condition
      .occurrence_identification.ignore_0minute_code;
    params.flag_condition.event_condition.occurrence_identification = _.values(
      this.flagForm.controls.conditions.value
    )[0];
    params.flag_condition.event_condition.occurrence_identification.ignore_0minute_code = `${Number(
      ignore_0minute
    )}`;

    params.flag_condition.car_conditions = (() => {
      if (this.modelRevParams.modelSelectType === this.modelSelectType.select) {
        return this.divisionsForDisplay.reduce(
          (result, item) =>
            result.concat(
              item.divisions.map(d =>
                _.pick(d, ['maker_code', 'division_code', 'model', 'type_rev'])
              )
            ),
          []
        );
      }
      return [];
    })();

    return params;
  }

  /**
   * 確認モーダルのヘッダを作成します。
   */
  private _buildConfirmModalHeader() {
    return this.descNames.map(name => {
      const label = (() => {
        switch (name) {
          case 'flag_condition.event_condition.occurrence_identification.ignore_0minute_code':
            return this.labels.option;
          case 'flag_condition':
            return this.labels.flag_condition;
          default:
            const resource = _.get(this.resource, name);
            return resource && resource.name;
        }
      })();

      return {
        label,
        name,
        displayable: !!label,
      };
    });
  }

  /**
   * 登録モーダルオープン
   * @param path 処理後に遷移するパス
   */
  private _registerModalOpen(path?: string) {
    this.apiParams = this._buildParams();
    this.desc = this._buildConfirmModalHeader();
    this.val = this._buildConfirmModalValues(this.apiParams);
    this.modalService.open({
      title: this.labels.submit_modal_title,
      labels: this.labels,
      content: this.submitModalContent,
      closeBtnLabel: this.labels.cancel,
      ok: async () => {
        try {
          await this._register();
          await this.router.navigateByUrl(path);
          this._reset();
          this.alertService.show(this.labels.finish_message);
        } catch (error) {
          this._setError(error, this.alertService);
        }
      },
    });
  }
}
