import { ViewChild, ViewChildren, QueryList, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import { FlagConditionParams } from '../../../../../types/opa/flag-condition';

import { FlagConditionKinds } from '../../../../../constants/opa/flag-condition-kinds';
import { DetectionConditionCodes } from '../../../../../constants/opa/detection-condition-codes';
import { FlagCodes } from '../../../../../constants/opa/flag-codes';
import { validationPattern } from '../../../../../constants/validation-patterns';

import { Mixin } from '../../../../../decorators/mixin-decorator';

import { KbaAbstractRegisterComponent } from '../../../../../components/shared/kba-abstract-component/kba-abstract-register-component';
import { KbaFormTableSelectComponent } from '../../../../shared/kba-form-table-select/kba-form-table-select.component';
import { KbaSelectedComponent } from '../../../../shared/kba-selected/kba-selected.component';

import { KbaNavigationService } from '../../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../../services/shared/kba-modal.service';
import { FlagConditionService } from '../../../../../services/opa/flag-condition/flag-condition.service';
import { KbaAlertService } from '../../../../../services/shared/kba-alert.service';

import { CautionIcon } from '../../../../../mixins/caution-icon';
import { ScreenCode } from '../../../../../constants/opa/screen-codes/flag-condition-management';
import { Resources } from '../../../../../types/common';

@Mixin([CautionIcon])
export abstract class FlagConditionFormComponent extends KbaAbstractRegisterComponent {
  @ViewChild('submitModalContent', { static: false })
  submitModalContent: TemplateRef<null>;
  @ViewChildren(KbaFormTableSelectComponent)
  selectBoxes: QueryList<KbaFormTableSelectComponent>;
  @ViewChild(KbaSelectedComponent, { static: false })
  eventCodeSelect: KbaSelectedComponent;

  loading = true;
  kind = FlagConditionKinds;
  flagCode = FlagCodes;
  detectionConditionCode = DetectionConditionCodes;

  params: {
    flag_condition: FlagConditionParams;
  } = {
      flag_condition: {
        group_id: '',
        flag_code: FlagCodes.yellow,
        flag_kind_code: '',
        free_memo: '',
        event_condition: {
          event_code: '',
          detection_condition_code:
            DetectionConditionCodes.consecutive_occurrence_days,
          occurrence_identification: {
            consecutive_occurrence_days: '',
            decision_period: '',
            occurrence_days: '',
            min_alerm_time: '',
          },
          time_identification: {
            remaining_time_threshold: '',
          },
        },
      },
    };

  cautionParams: {
    flag_condition: FlagConditionParams;
  } = {
      flag_condition: {
        group_id: '',
        flag_code: '',
        flag_kind_code: '',
        free_memo: '',
        event_condition: {
          event_code: '',
          detection_condition_code: '',
          occurrence_identification: {
            consecutive_occurrence_days: '',
            decision_period: '',
            occurrence_days: '',
            min_alerm_time: '',
          },
        },
      },
    };

  replacementTimeParams: {
    flag_condition: FlagConditionParams;
  } = {
      flag_condition: {
        group_id: '',
        flag_code: '',
        flag_kind_code: '',
        free_memo: '',
        event_condition: {
          detection_condition_code: '',
          time_identification: {
            remaining_time_threshold: '',
          },
        },
      },
    };

  flagConditionForm: FormGroup = new FormGroup({
    flag_code: new FormControl(),
    flag_kind_code: new FormControl(),
    cautionGroup: new FormGroup({
      minimum_duration: new FormControl(),
      min_alerm_time: new FormControl({ value: '', disabled: true }),
      detection_condition_code: new FormControl(),
      decisionPeriodGroup: new FormGroup({
        occurrence_days: new FormControl(),
        decision_period: new FormControl(),
      }),
      consecutive_occurrence_days: new FormControl(),
    }),
    replacementTimeGroup: new FormGroup({
      remaining_time_threshold: new FormControl(),
    }),
  });

  desc: any[] = [];
  val: any;
  naturalNumberPattern = validationPattern.naturalNumber;
  integerPattern = validationPattern.integer;
  minimum_duration = false;
  screenCode: string;
  resourceCache: { [code: string]: Resources } = {};

  get formGroupName() {
    return this.isSelectedKindCaution()
      ? 'cautionGroup'
      : 'replacementTimeGroup';
  }

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    protected router: Router,
    protected alertService: KbaAlertService,
    protected modalService: KbaModalService,
    protected flagConditionService: FlagConditionService
  ) {
    super(nav, title, header);
  }

  /**
   * 入力内容リセットコールバック
   *
   * 入力内容リセット確認モーダルを表示する。
   * 確認後、入力内容をリセットする。
   */
  onClickReset(): void {
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      ok: () => this._reset(),
    });
  }

  /**
   * 登録/変更ボタン押下コールバック
   */
  onClickSubmit(): void {
    const path = this.isUpdate ? '/flag_conditions' : '/';
    this._registerModalOpen(path);
  }

  /**
   * 続けて登録ボタン押下コールバック
   */
  onClickContinue() {
    this._registerModalOpen('/flag_conditions/new');
  }

  /**
   * フラグ条件種別選択コールバック
   *
   * @param value フラグ条件種別値
   */
  async onSelectFlagKind(value: string) {
    if (value == null) {
      return;
    }

    if (this.resourceCache[value] == null) {
      this.resourceCache[
        value
      ] = await this.flagConditionService.fetchCautionResource(
        this.screenCode,
        value
      );
    }

    this.resource.flag_condition = {
      ...this.resource.flag_condition,
      ...this.resourceCache[value].flag_condition,
    };

    this.params.flag_condition.flag_kind_code = value;
    this.params.flag_condition.flag_code = this.isSelectedKindCaution()
      ? FlagCodes.yellow
      : FlagCodes.red;
  }

  /**
   * フラグコード選択コールバック
   *
   * @param value フラグコード値
   */
  onSelectFlagCode(value: string) {
    this.params.flag_condition.flag_code = value;
  }

  /**
   * 最小継続時間設定チェックボックスチェック時コールバック
   *
   * @param check チェック値
   */
  onCheckedMininumDuration(check) {
    this.minimum_duration = check;
    if (check) {
      this.flagConditionForm.get('cautionGroup.min_alerm_time').enable();
    } else {
      this.flagConditionForm.get('cautionGroup.min_alerm_time').disable();
    }
  }

  /**
   * 検出条件コード選択コールバック
   *
   * @param value 値
   */
  onEvaluationCodeChange(value) {
    this.params.flag_condition.event_condition.detection_condition_code = value;

    if (value == null) {
      return;
    }

    const formArray = [
      this.flagConditionForm.get('cautionGroup.consecutive_occurrence_days'),
      this.flagConditionForm.get('cautionGroup.decisionPeriodGroup'),
    ];
    formArray.forEach(group => group.disable());
    formArray[value - 1].enable();
  }

  /**
   * リージョン管理者かどうかを返却する
   *
   * @return true: リージョン管理者 / false: グループ管理者
   */
  isRegionAdmin(): boolean {
    return _.has(this.resource, 'flag_condition.group_id');
  }

  /**
   * フラグ種別がコーションかどうかを返却する
   *
   * @return true: コーション / false: 交換時期
   */
  isSelectedKindCaution(): boolean {
    return this.params.flag_condition.flag_kind_code === this.kind.caution;
  }

  /**
   * 画面表示用に検出条件コードを抽出する
   *
   * @return 検出条件コード 4:残り時間閾値を除くリソース
   */
  fillEvaluationCodes(): Object[] {
    return _.filter(
      this.resource.flag_condition.event_condition.detection_condition_code
        .values,
      item =>
        item.value !== this.detectionConditionCode.remaining_time_threshold
    );
  }

  /**
   * 入力された内容を API に渡し登録を行う
   * @param params パラメータ
   * @param path 遷移後のパス
   */
  protected abstract _register(params: FlagConditionParams, path: string);

  /**
   * フォームに入力された内容をリセットする
   */
  protected abstract _reset();

  /**
   * イベントコード変更時の処理
   * @param value 選択値
   */
  protected onEventCodeChange(value) {
    _.set(this.params, 'flag_condition.event_condition.event_code', value);
  }

  /**
   * 登録確認画面オープン
   *
   * 登録/変更確認モーダルを表示する。
   * 確認後、登録/変更処理をおこない、指定画面に遷移する
   *
   * @param path 確認後遷移先のパス
   */
  private _registerModalOpen(path: string) {
    this._reflectRegistParams();
    this.desc = this._createDesc();
    this.val = this._createVal();
    this.modalService.open(
      {
        title: this.labels.submit_modal_title,
        labels: this.labels,
        content: this.submitModalContent,
        ok: () =>
          this._register(
            _.omit(
              this.isSelectedKindCaution()
                ? this.cautionParams
                : this.replacementTimeParams,
              ['content']
            ),
            path
          ),
      },
      {
        size: 'lg',
      }
    );
  }

  /**
   * 登録用のパラメタを反映する
   */
  private _reflectRegistParams() {
    if (this.isSelectedKindCaution()) {
      this._setCautionParams();
    } else {
      this._setReplacementTimeParams();
    }
  }

  /**
   * 検出種別 交換時期の場合のパラメタ設定
   */
  private _setReplacementTimeParams() {
    this.replacementTimeParams = {
      flag_condition: {
        flag_code: this.params.flag_condition.flag_code,
        flag_kind_code: this.params.flag_condition.flag_kind_code,
        free_memo: this.params.flag_condition.free_memo,
        event_condition: {
          detection_condition_code:
            DetectionConditionCodes.remaining_time_threshold,
          time_identification: {
            remaining_time_threshold: _.get(
              this.params,
              'flag_condition.event_condition.time_identification.remaining_time_threshold'
            ),
          },
        },
      },
    };

    // リージョン管理者の場合はグループIDを追加
    if (this.resource.flag_condition.group_id) {
      this.replacementTimeParams.flag_condition.group_id = this.params.flag_condition.group_id;
    }

    // 変更の場合は更新日時を追加
    if (this.isUpdate) {
      this.replacementTimeParams.flag_condition.update_datetime = this.params.flag_condition.update_datetime;
    }
  }

  /**
   * 検出種別 コーションの場合のパラメタ設定
   */
  private _setCautionParams() {
    this.cautionParams = {
      flag_condition: {
        flag_code: this.params.flag_condition.flag_code,
        flag_kind_code: this.params.flag_condition.flag_kind_code,
        free_memo: this.params.flag_condition.free_memo,
        event_condition: {
          event_code: _.get(
            this.params,
            'flag_condition.event_condition.event_code'
          ),
          detection_condition_code: _.get(
            this.params,
            'flag_condition.event_condition.detection_condition_code'
          ),
        },
      },
    };

    // リージョン管理者の場合はグループIDを追加
    if (this.resource.flag_condition.group_id) {
      this.cautionParams.flag_condition.group_id = this.params.flag_condition.group_id;
    }

    // 変更の場合は更新日時を追加
    if (this.isUpdate) {
      this.cautionParams.flag_condition.update_datetime = this.params.flag_condition.update_datetime;
    }

    // 検出コードの値に応じてパラメタの値を切り替える
    // 検出コード: 1 連続発生の場合は「連続発生日」
    // 検出コード: 2 指定期間発生日数の場合は「期間」, 「日数（期間指定）」
    let key = '';
    switch (
    _.get(
      this.params,
      'flag_condition.event_condition.detection_condition_code'
    )
    ) {
      case DetectionConditionCodes.consecutive_occurrence_days:
        key =
          'flag_condition.event_condition.occurrence_identification.consecutive_occurrence_days';
        _.set(this.cautionParams, key, _.get(this.params, key));
        break;
      case DetectionConditionCodes.decision_period:
        key =
          'flag_condition.event_condition.occurrence_identification.decision_period';
        _.set(this.cautionParams, key, _.get(this.params, key));
        key =
          'flag_condition.event_condition.occurrence_identification.occurrence_days';
        _.set(this.cautionParams, key, _.get(this.params, key));
        break;
    }

    if (this.minimum_duration) {
      key =
        'flag_condition.event_condition.occurrence_identification.min_alerm_time';
      _.set(this.cautionParams, key, _.get(this.params, key));
    }
  }

  /**
   * 登録確認モーダル用の項目を作成する
   * @return 加工後の表示用項目
   */
  private _createVal() {
    let val = _.cloneDeep(this.params);
    if (this.isRegionAdmin()) {
      _.set(
        val,
        'flag_condition.group_label',
        this._getResourceValueName(
          'flag_condition.group_id',
          _.get(val, 'flag_condition.group_id')
        )
      );
    }
    _.set(
      val,
      'flag_condition.flag_kind_label',
      this._getResourceValueName(
        'flag_condition.flag_kind_code',
        _.get(val, 'flag_condition.flag_kind_code')
      )
    );

    this.isSelectedKindCaution()
      ? this._setCautionVal(val)
      : this._setReplacementTimeVal(val);

    _.set(
      val,
      'flag_condition.conditions',
      this._getResourceValueName(
        'flag_condition.event_condition.detection_condition_code',
        this.params.flag_condition.event_condition.detection_condition_code
      )
    );

    val = this.flattenObj(val);

    if (!this.isSelectedKindCaution()) {
      return val;
    }

    _.set(
      val,
      'flag_condition',
      _.reduce(
        _.omit(
          this.params.flag_condition.event_condition.occurrence_identification,
          ['min_alerm_time']
        ),
        (array, value, key) => {
          let addFlg = false;

          // 検出コードの値に応じて確認モーダルに表示する発生識別を切り替える
          // 検出コード: 1 連続発生の場合は「連続発生日」
          // 検出コード: 2 指定期間発生日数の場合は「期間」, 「日数（期間指定）」
          switch (key) {
            case 'consecutive_occurrence_days':
              if (
                this.detectionConditionCode.consecutive_occurrence_days ===
                _.get(
                  val,
                  'flag_condition.event_condition.detection_condition_code'
                )
              ) {
                addFlg = true;
              }
              break;

            case 'decision_period':
            case 'occurrence_days':
              if (
                this.detectionConditionCode.decision_period ===
                _.get(
                  val,
                  'flag_condition.event_condition.detection_condition_code'
                )
              ) {
                addFlg = true;
              }
              break;
          }

          if (addFlg) {
            const obj = {
              name: _.get(
                this.resource,
                `flag_condition.event_condition.occurrence_identification.${key}`
              ).name,
              value: value,
            };
            array.push(obj);
          }
          return array;
        },
        []
      )
    );

    return val;
  }

  /**
   * 検出種別 コーションの場合の値の作成
   *
   * @params val ラベル
   */
  private _setCautionVal(val) {
    let key = 'flag_condition.event_condition.event_code';
    _.set(
      val,
      `${key}_label`,
      this._getResourceValueName(key, _.get(val, key))
    );

    if (this.minimum_duration) {
      key =
        'flag_condition.event_condition.occurrence_identification.min_alerm_time';
      _.set(
        val,
        `${key}_label`,
        !_.isEmpty(_.get(val, key))
          ? `${_.get(val, key)} ${this.labels.minute}`
          : ''
      );
    }
  }

  /**
   * 検出種別 交換時期の場合の値の作成
   *
   * @params val ラベル
   */
  private _setReplacementTimeVal(val) {
    const key =
      'flag_condition.event_condition.time_identification.remaining_time_threshold';
    _.set(val, `${key}_label`, `${_.get(val, key)} ${this.labels.hour}`);

    _.set(
      val,
      'flag_condition.flag_kind_label',
      this._getResourceValueName(
        'flag_condition.flag_kind_code',
        _.get(val, 'flag_condition.flag_kind_code')
      )
    );
  }

  /**
   * 登録確認モーダル用のヘッダを作成する
   * @return 表示用項目
   */
  private _createDesc(): object[] {
    const desc = [];
    const thList = this.isSelectedKindCaution()
      ? this._createCautionThList()
      : this._createReplacementTimeThList();

    // リソースおよびラベルからヘッダを作成
    _.each(thList, th => {
      if (th.name === 'flag_condition') {
        const tmpLabel = _.get(this.labels, th.path);
        if (tmpLabel) {
          desc.push({
            label: tmpLabel,
            name: th.name,
            displayable: true,
          });
        }
      } else {
        const tmpResource = _.get(this.resource, th.path);
        desc.push({
          label: tmpResource.name,
          name: th.name,
          displayable: true,
        });
      }
    });

    return desc;
  }

  /**
   * 検出種別 コーションの場合のthListの作成
   *
   * @return thList
   */
  private _createCautionThList(): Object[] {
    const thList = [
      {
        path: 'flag_condition.flag_kind_code',
        name: 'flag_condition.flag_kind_label',
      },
      { path: 'flag_condition.flag_code', name: 'flag_condition.flag' },
      {
        path: 'flag_condition.event_condition.event_code',
        name: 'flag_condition.event_condition.event_code_label',
      },
      {
        path: 'flag_condition.event_condition.detection_condition_code',
        name: 'flag_condition.conditions',
      },
      {
        path: 'flag_condition',
        name: 'flag_condition',
      },
      {
        path:
          'flag_condition.event_condition.occurrence_identification.min_alerm_time',
        name:
          'flag_condition.event_condition.occurrence_identification.min_alerm_time_label',
      },
      { path: 'flag_condition.free_memo', name: 'flag_condition.free_memo' },
    ];

    if (this.isRegionAdmin()) {
      thList.unshift({
        path: 'flag_condition.group_id',
        name: 'flag_condition.group_label',
      });
    }

    return thList;
  }

  /**
   * 検出種別 交換時期の場合のthListの作成
   *
   * @return thList
   */
  private _createReplacementTimeThList(): Object[] {
    const thList = [
      {
        path: 'flag_condition.flag_kind_code',
        name: 'flag_condition.flag_kind_label',
      },
      { path: 'flag_condition.flag_code', name: 'flag_condition.flag' },
      {
        path:
          'flag_condition.event_condition.time_identification.remaining_time_threshold',
        name:
          'flag_condition.event_condition.time_identification.remaining_time_threshold_label',
      },
      { path: 'flag_condition.free_memo', name: 'flag_condition.free_memo' },
    ];

    if (this.isRegionAdmin()) {
      thList.unshift({
        path: 'flag_condition.group_id',
        name: 'flag_condition.group_label',
      });
    }

    return thList;
  }
}
