import {
  Component,
  ViewChild,
  TemplateRef,
  ChangeDetectorRef,
} from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
  pick,
  cloneDeep,
  sortBy,
  template,
  isEmpty,
  reduce,
  get,
  merge,
} from 'lodash';

import { CommonState } from '../../../../constants/common-state';
import { SvmNotManagement } from '../../../../constants/flm/smr-interval';

import { KbaAbstractRegisterComponent } from '../../../shared/kba-abstract-component/kba-abstract-register-component';

import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { SmrIntervalService } from '../../../../services/flm/smr-interval/smr-interval.service';
import { validationPattern } from '../../../../constants/validation-patterns';

@Component({
  selector: 'app-smr-interval-car-edit',
  templateUrl: './smr-interval-car-edit.component.html',
  styleUrls: ['./smr-interval-car-edit.component.scss'],
})
export class SmrIntervalCarEditComponent extends KbaAbstractRegisterComponent {
  @ViewChild('submitResultModalContent', { static: false })
  submitResultModalContent: TemplateRef<null>;

  params;
  isPresent = false;
  latestSmr: string;
  carConditions: {
    model: string;
    type_rev: string;
    serial: string;
  };
  thList = [
    'select',
    'management_kind',
    'smr_label',
    'inspection_start_smr',
    'last_inspection_smr',
    'smr_interval',
    'threshold',
  ];
  confirmModalThList: string[];
  resultModalThList: string[];
  submitResultModalThList: string[];
  confirmModalList: any[];
  checkStates: boolean[] = [];
  list;
  tempList;
  state = CommonState;
  managementStatusLabels: string[];
  carId: string;
  form: FormArray;
  resultCountMessage: string;
  thresholdPattern = validationPattern.numeric;

  get lists() {
    return {
      originList: this.list,
      visibleList: this.list,
    };
  }

  get submitButtonEnabled() {
    return (
      this.checkStates.filter(state => state).length > 0 && this.form.valid
    );
  }

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    private smrIntervalService: SmrIntervalService,
    private activatedRoute: ActivatedRoute,
    private modalService: KbaModalService,
    private alertService: KbaAlertService,
    private router: Router,
    private ref: ChangeDetectorRef
  ) {
    super(nav, title, header);
  }

  /**
   * リセットボタン押下時の処理
   */
  onClickReset() {
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      closeBtnLabel: this.labels.cancel,
      ok: () => {
        this.checkStates = [];
        this.list = cloneDeep(this.tempList);
        this.list.forEach((data, i) => this.onCheck(data, i, false));
      },
    });
  }

  /**
   * 変更ボタン押下時の処理
   */
  onClickSubmit() {
    this.confirmModalList = this.list.filter((_item, i) => this.checkStates[i]);
    this.submitResultModalThList = this.confirmModalThList;

    new Promise(resolve => {
      this.modalService.open(
        {
          title: this.labels.submit_modal_title,
          labels: this.labels,
          content: this.submitResultModalContent,
          closeBtnLabel: this.labels.cancel,
          ok: () => {
            this.smrIntervalService
              .updateCarsSmrIntervalItems(
                this.carId,
                this._createParams(this.confirmModalList)
              )
              .then((res: any) => {
                this.submitResultModalThList = this.resultModalThList;
                this.confirmModalList = this._createResultModalList(
                  this.confirmModalList,
                  res.responses
                );
                resolve();
              });
          },
        },
        {
          size: 'lg',
        }
      );
    }).then(() => {
      this.modalService.open(
        {
          title: this.labels.result_modal_title,
          labels: this.labels,
          content: this.submitResultModalContent,
          close: () => this.router.navigateByUrl('smr_interval/cars'),
        },
        {
          size: 'lg',
        }
      );
    });
  }

  /**
   * チェックボックス切り替え時の処理
   * @param data 対象項目
   * @param i インデックス
   * @param check チェック状態
   */
  onCheck(data, i, check) {
    this.checkStates[i] = check;
    const smrIntervalEnabled =
      check && data.smr_interval_kind === CommonState.on;
    const thresholdEnabled = check && data.threshold_kind === CommonState.on;

    this.form.get([i, 'inspection_start_smr'])[check ? 'enable' : 'disable']();
    this.form
      .get([i, 'smr_interval'])
      [smrIntervalEnabled ? 'enable' : 'disable']();
    this.form.get([i, 'threshold'])[thresholdEnabled ? 'enable' : 'disable']();
  }

  /**
   * SMR インターバル種別変更時の処理
   * @param data 対象項目
   * @param i インデックス
   * @param bool あり / なし
   */
  onSmrIntervalKindChange(data, i, bool) {
    data.smr_interval_kind = bool;
    this.form
      .get([i, 'smr_interval'])
      [bool === CommonState.on ? 'enable' : 'disable']();
  }

  /**
   * オレンジフラグ域値種別変更時の処理
   * @param data 対象項目
   * @param i インデックス
   * @param bool あり / なし
   */
  onThresholdKindChange(data, i, bool) {
    data.threshold_kind = bool;
    this.form
      .get([i, 'threshold'])
      [bool === CommonState.on ? 'enable' : 'disable']();
  }

  /**
   * オレンジフラグ閾値フォーカスアウト
   * @param value 値
   */
  handleBlurThreshold(value: string | number, index: number) {
    this.list[index].threshold = Array.from('' + value)
      .filter(char => /\d/.test(char))
      .join('');
    this.safeDetectChanges();
  }

  /**
   * 初期化処理
   */
  protected async _fetchDataForInitialize(): Promise<void> {
    this.activatedRoute.params.subscribe(params => (this.carId = params.id));
    const res = await this.smrIntervalService.fetchCarEditInitData(this.carId);
    this.initialize(res);
    this.labels = res.label;
    this.resource = merge(res.resource, res.resource.car.smr_interval_items);
    this._setTitle();

    if (res.items.result_data.cars[0] == null) {
      return;
    }

    this.isPresent = true;
    this.judgeSvmTarget(res.items.result_data.cars[0]);
    this.list = res.items.result_data.cars[0].smr_interval_items;
    this.list.forEach(
      item =>
        item.threshold_kind === CommonState.on &&
        (item.threshold = -item.threshold)
    );
    this.tempList = cloneDeep(this.list);
    this.latestSmr = res.latestCarCondition.result_data.car.latest_status.smr;
    this.carConditions = pick(
      res.items.result_data.cars[0].car_identification,
      ['model', 'type_rev', 'serial']
    );
    this.confirmModalThList = this.thList.filter(th => th !== 'select');
    this.resultModalThList = ['result']
      .concat(this.thList.filter(th => !/select|last_inspection_smr/.test(th)))
      .concat(['result_detail']);
    this.managementStatusLabels = sortBy(
      this.resource.management_kind.values,
      'value'
    ).map(v => v.name);
    this.form = this._buildFormControls(this.list);
    this.list.forEach((data, i) => this.onCheck(data, i, false));
    this.onLoad();
  }

  /**
   * メッセージ内のリソースパスをリソース名に置き換える
   * @override
   * @param message メッセージ
   * @param keys エラーレスポンスのキー情報（リソースパスに対応）
   */
  protected _replacePath(message: string, keys: string[]): string {
    return reduce(
      keys,
      (mesg, key) => {
        const res = get(
          this.resource,
          key.replace('car.smr_interval_items.', '')
        );
        if (res) {
          return mesg.replace(`{{${key}}}`, res.name);
        } else {
          return mesg;
        }
      },
      message
    );
  }

  /**
   * 結果モーダルの内容を作成
   * @param list リスト
   * @param res レスポンス
   */
  private _createResultModalList(list, res) {
    const errorsLength = res.filter(item => !isEmpty(item.error_data)).length;
    const compiledResultCountMessage = template(
      this.labels.result_count_message
    );
    this.resultCountMessage = compiledResultCountMessage({
      total: res.length,
      success: res.length - errorsLength,
      fail: errorsLength,
    });
    return list.map((item, i) => {
      item.result = res[i].result_data != null;
      item.result_detail = this._createErrorMessages(res[i].error_data);
      return item;
    });
  }

  /**
   * パラメータを作成
   * @param items SMR 管理項目の配列
   */
  private _createParams(items) {
    const headers = [
      'update_datetime',
      'threshold_kind',
      'threshold',
      'smr_interval_kind',
      'smr_interval',
      'inspection_start_smr',
      'management_kind',
      'id',
    ];

    const result = {
      car: {
        smr_interval_items: items.map(item => {
          const _result = pick(
            item,
            headers.filter(header => {
              if (
                (item.smr_interval_kind === CommonState.off &&
                  header === 'smr_interval') ||
                (item.threshold_kind === CommonState.off &&
                  header === 'threshold')
              ) {
                return false;
              }

              return true;
            })
          );

          if (_result.threshold != null) {
            _result.threshold = '-' + _result.threshold;
          }

          return _result;
        }),
      },
    };

    return result;
  }

  /**
   * フォーム部品を作成
   * @param list リスト
   */
  private _buildFormControls(list: any[]) {
    const form = new FormArray([]);
    list.forEach((item, i) => {
      const fg = new FormGroup({
        inspection_start_smr: new FormControl('', Validators.required),
        smr_interval: new FormControl('', Validators.required),
        threshold: new FormControl('', Validators.required),
      });

      form.push(fg);
    });

    return form;
  }

  /**
   * 変更対象がサービス管理対象かどうかを判別し、対象外ならばアラートを出して設定一覧画面に遷移させる。
   * @param data 変更対象データ
   */
  private judgeSvmTarget(data) {
    if (data.interval_management.service_target_kind === SvmNotManagement.on) {
      this.alertService.show(
        this.labels.svm_non_target_alert_message,
        true,
        'danger'
      );
      this.router.navigateByUrl('smr_interval/cars');
    }
  }
}
