import {
  OnInit,
  ViewChild,
  TemplateRef,
  ChangeDetectorRef,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import {
  DivisionList,
  ModelRevParams,
} from '../../../../../types/flm/model-rev-modal';
import {
  SmrIntervalParams,
  SmrModalListVal,
} from '../../../../../types/flm/smr-interval';
import {
  ModalValues,
  ModalDescItem,
  TableHeader,
} from '../../../../../types/common';
import { RequestHeaderParams } from '../../../../../types/request';

import {
  KindSetting,
  TargetModelKind,
  SmrConfirmModalParams,
} from '../../../../../constants/flm/smr-interval';

import { KbaFormTableSelectComponent } from '../../../../shared/kba-form-table-select/kba-form-table-select.component';
import { KbaAbstractRegisterComponent } from '../../../../shared/kba-abstract-component/kba-abstract-register-component';

import { KbaNavigationService } from '../../../../../services/shared/kba-navigation.service';
import { KbaModalService } from '../../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../../../services/shared/common-header.service';
import { SmrIntervalService } from '../../../../../services/flm/smr-interval/smr-interval.service';
import { ModelSelectType } from '../../../../../constants/flm/flag';
import { validationPattern } from '../../../../../constants/validation-patterns';

export abstract class SmrIntervalFormComponent
  extends KbaAbstractRegisterComponent
  implements OnInit {
  @ViewChild(KbaFormTableSelectComponent, { static: false })
  supportDistributorSelect: KbaFormTableSelectComponent;
  @ViewChild('modelRevModalContent', { static: false })
  modelRevModalContent: TemplateRef<any>;
  @ViewChild('refModalContent', { static: false }) refModalContent: TemplateRef<
    any
  >;

  isUpdate: boolean;

  params: SmrIntervalParams;

  smrIntervalForm = new FormGroup({
    inspectionStartSmr: new FormControl('', Validators.required),
    smrInterval: new FormControl('', Validators.required),
    threshold: new FormControl('', Validators.required),
  });

  smrIntervalKindSetting = KindSetting;
  thresholdKindSetting = KindSetting;
  thresholdPattern = validationPattern.numeric;

  // 登録確認モーダル用のヘッダと値を格納する
  desc: ModalDescItem[];
  val: SmrModalListVal;

  modelSelectType = TargetModelKind;

  // 機種型式選択モーダル用のパラメータ
  modelRevParams: ModelRevParams = {
    modelSelectType: this.modelSelectType.select,
  };

  selectedDivisions: DivisionList = {};

  tempSelectedDivisions: DivisionList = {};

  divisionsForDisplay = [];

  tempModelRevParams: ModelRevParams;
  divisionList: DivisionList = {};
  refModalData;
  allModels = false;
  modelRevOk = false;
  refModalHeaderParams: ModalValues;
  screenCode: string;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    protected alertService: KbaAlertService,
    protected modalService: KbaModalService,
    protected smrIntervalService: SmrIntervalService,
    protected router: Router,
    protected header: CommonHeaderService,
    protected ref: ChangeDetectorRef
  ) {
    super(nav, title, header);
  }

  /**
   * SMRインターバルの入力欄の活性/非活性を制御する
   */
  onSelectSmrIntervalKind() {
    if (
      this.params.smr_interval_item.smr_interval_kind ===
      this.smrIntervalKindSetting.on
    ) {
      this.smrIntervalForm.controls.smrInterval.enable();
    } else if (
      this.params.smr_interval_item.smr_interval_kind ===
      this.smrIntervalKindSetting.off
    ) {
      this.smrIntervalForm.controls.smrInterval.disable();
    }
  }

  /**
   * オレンジフラグ閾値の入力の活性/非活性を制御する
   */
  onSelectThresholdKind() {
    if (
      this.params.smr_interval_item.threshold_kind ===
      this.thresholdKindSetting.on
    ) {
      this.smrIntervalForm.controls.threshold.enable();
    } else if (
      this.params.smr_interval_item.threshold_kind ===
      this.thresholdKindSetting.off
    ) {
      this.smrIntervalForm.controls.threshold.disable();
    }
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
   * 続けて登録ボタン押下時の処理
   */
  onClickContinue() {
    this._registerModalOpen('smr_interval/new');
  }

  /**
   * 登録ボタン押下時の処理
   */
  onClickSubmit() {
    const path = this.isUpdate ? 'smr_interval' : '';
    this._registerModalOpen(path);
  }

  /**
   * 機種型式選択モーダルを開く
   */
  showModelRevModal() {
    if (this.resource.smr_interval_item.support_distributor_id) {
      this.modelRevParams.support_distributor_id = this.params.smr_interval_item.support_distributor_id;
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
   * 参照モーダルを開く
   * @param params 機種型式モーダルから渡されたパラメータ
   */
  showRefModal = params => {
    this.smrIntervalService
      .fetchModelTypesSmrIntervalList(
        params,
        this.refModalHeaderParams.requestHeaderParams
      )
      .then(res => {
        this.refModalData = res.result_data.smr_interval_item_links;
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
   * オレンジフラグ閾値フォーカスアウト
   * @param value 値
   */
  handleBlurThreshold(value: string) {
    this.params.smr_interval_item.threshold = Array.from(value)
      .filter(char => /\d/.test(char))
      .join('');
    this.safeDetectChanges();
    this.smrIntervalForm.get('threshold').setValue(this.params.smr_interval_item.threshold);
  }

  /**
   * 担当DB変更時の処理
   * @param value 担当DBID
   * @param reset 機種型式をリセットする
   */
  async handleSupportDistributorChange(value, reset = true) {
    this.resource.smr_interval_item.division_code = (await this.smrIntervalService.fetchDivisionResource(
      this.screenCode,
      value
    )).division_code;

    if (reset) {
      this.selectedDivisions = {};
      this._formatSelectedDivisionsForDisplay();
      this.modelRevOk = false;
      this.allModels = false;
      this.modelRevParams.modelSelectType = ModelSelectType.select;
      this.safeDetectChanges();
    }
  }

  /**
   * API にデータを投げる
   * @param requestParams API に渡すパラメータ
   * @param path 処理後に遷移するパス
   */
  protected abstract _register(): Promise<any>;

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
          divisions: _.sortBy(d.divisions, ['rev']),
        };
      });
    this.divisionsForDisplay = _.cloneDeep(divisions);
    this.allModels =
      this.modelRevParams.modelSelectType === this.modelSelectType.all;
    this.modelRevOk = this.modalService.enableOk;
  }

  /**
   * フォームの選択内容をリセットする
   */
  protected abstract _reset(): void;

  /**
   * 登録・更新時のリクエストパラメータを作成
   */
  protected buildRegistParams(): SmrIntervalParams {
    const params = _.cloneDeep(this.params);

    // SMRインターバルとオレンジフラグ閾値は、それぞれ区分が'なし'のときはリクエストボディに含まない。
    if (params.smr_interval_item.smr_interval_kind === KindSetting.off) {
      delete params.smr_interval_item.smr_interval;
    }

    // さらに、オレンジフラグ閾値はマイナス値にする。
    if (params.smr_interval_item.threshold_kind === KindSetting.on) {
      params.smr_interval_item.threshold =
        '-' + params.smr_interval_item.threshold;
    } else {
      delete params.smr_interval_item.threshold;
    }

    // 全選択時は car_conditions を送らない
    if (params.smr_interval_item.target_model_kind === TargetModelKind.all) {
      delete params.smr_interval_item.car_conditions;
    }

    return params;
  }

  /**
   * 登録モーダルオープン
   * @param path 処理後に遷移するパス
   */
  private _registerModalOpen(path: string) {
    this._buildModelTypeParams();
    this.desc = this._buildConfirmModalHeader();
    this.val = this._buildConfirmModalValues();
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

  /**
   * API に投げる機種型式のパラメータを作成する。
   */
  private _buildModelTypeParams() {
    this.params.smr_interval_item.car_conditions = [];

    if (this.modelRevParams.modelSelectType === this.modelSelectType.all) {
      this.params.smr_interval_item.target_model_kind = TargetModelKind.all;
    } else if (
      this.modelRevParams.modelSelectType === this.modelSelectType.select
    ) {
      this.params.smr_interval_item.target_model_kind = TargetModelKind.select;

      this.params.smr_interval_item.car_conditions = (() => {
        if (
          this.modelRevParams.modelSelectType === this.modelSelectType.select
        ) {
          return this.divisionsForDisplay.reduce(
            (result, item) =>
              result.concat(
                _.map(item.divisions, d =>
                  _.pick(d, [
                    'maker_code',
                    'division_code',
                    'model',
                    'type_rev',
                  ])
                )
              ),
            []
          );
        }
        return [];
      })();
    }
    return this.params.smr_interval_item;
  }

  /**
   * 確認モーダルのヘッダを作成する。
   */
  private _buildConfirmModalHeader() {
    const desc = _.cloneDeep(SmrConfirmModalParams.descNames);
    if (this.resource.smr_interval_item.support_distributor_id) {
      desc.unshift('support_distributor_id');
    }
    return desc.map(name => {
      const label = this.resource.smr_interval_item[name].name;
      const displayable = !!label;
      return {
        label,
        name,
        displayable,
      };
    });
  }

  /**
   * 確認モーダルに表示する値を整形する。
   */
  private _buildConfirmModalValues() {
    const valResource = _.omit(
      this.params.smr_interval_item,
      'smr_interval_kind',
      'threshold_kind'
    );
    // 担当DBには値に名前を表示する
    if (_.has(valResource, 'support_distributor_id')) {
      valResource.support_distributor_id = this._getResourceValueName(
        'smr_interval_item.support_distributor_id',
        valResource.support_distributor_id
      );
    }
    valResource.inspection_start_smr += this.labels.hour;
    valResource.smr_interval = this._buildKindValue(
      'smr_interval_kind',
      valResource.smr_interval
    );
    valResource.threshold = this._buildKindValue(
      'threshold_kind',
      '-' + valResource.threshold
    );
    return valResource;
  }

  /**
   * SMRインターバル区分とオレンジフラグ閾値区分の確認モーダル用の表示を整形する
   * @param kind 区分
   * @param val 区分に該当する値
   */
  private _buildKindValue(kind: string, val: string) {
    const targetKindValue = _.find(
      this.resource.smr_interval_item[kind].values,
      item => {
        return item.value === this.params.smr_interval_item[kind];
      }
    );

    if (this.params.smr_interval_item[kind] === KindSetting.off) {
      return targetKindValue.name;
    }

    return val + this.labels.hour;
  }
}
