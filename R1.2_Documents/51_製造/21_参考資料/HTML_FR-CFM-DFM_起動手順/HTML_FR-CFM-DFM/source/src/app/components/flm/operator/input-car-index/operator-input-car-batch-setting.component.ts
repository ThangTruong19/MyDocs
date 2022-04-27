import {
  Component,
  OnInit,
  Input,
  Output,
  ViewChild,
  TemplateRef,
  EventEmitter,
  ViewChildren,
  QueryList,
  ChangeDetectorRef,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import * as _ from 'lodash';

import { OperatorCarIdInputUpdateParams } from '../../../../types/flm/operator';
import { RequestHeaderParams } from '../../../../types/request';
import {
  Fields,
  TableHeader,
  Resource,
  ModalValues,
} from '../../../../types/common';

import { validationPattern } from '../../../../constants/validation-patterns';
import {
  OperatorIdentificationKind,
  InputCarIndexOperatorRegisterSize,
  InitialOperatorCodePattern,
} from '../../../../constants/flm/operator';

import { KbaAbstractRegisterComponent } from '../../../shared/kba-abstract-component/kba-abstract-register-component';

import { OperatorService } from '../../../../services/flm/operator/operator.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { KbaAutocompleteComponent } from '../../../shared/kba-autocomplete/kba-autocomplete.component';
import { KbaSelectedComponent } from '../../../shared/kba-selected/kba-selected.component';

@Component({
  selector: 'app-operator-input-car-batch-setting',
  templateUrl: './operator-input-car-batch-setting.component.html',
  styleUrls: ['./operator-input-car-batch-setting.component.scss'],
})
export class OperatorInputCarBatchSettingComponent
  extends KbaAbstractRegisterComponent
  implements OnInit {
  @ViewChild('submitModalContent', { static: false })
  submitModalContent: TemplateRef<null>;
  @ViewChild('resetModalContent', { static: false })
  resetModalContent: TemplateRef<null>;
  @ViewChild('resultModalContent', { static: false })
  resultModalContent: TemplateRef<null>;
  @ViewChildren(KbaAutocompleteComponent) autoCompleteList: QueryList<
    KbaAutocompleteComponent
  >;
  @ViewChild('idHoldTimeSelect', { static: false }) idHoldTimeSelect: KbaSelectedComponent;

  @Input() selectedCarIds: string[];
  @Input() customerId;
  @Input() params;
  @Input() resource;
  @Input() labels;
  @Input() functions;
  @Input() operatorFields;
  @Input() listSettingFields;
  @Input() listSettingConfirmFields;
  @Output() return = new EventEmitter<any>();

  settingOnParams: OperatorCarIdInputUpdateParams = {
    id_hold_time: '',
    car_ids: [],
    operator_codes: [],
  };
  beginEndRepeatSpaceRegexp = validationPattern.beginEndRepeatSpace;
  operatorRequestHeaderParams: RequestHeaderParams = {};
  operators: any[];
  operatorParams: {
    operator_code?: string;
    operator_label?: string;
    dirty_flg?: boolean;
  }[] = [];
  baseOperatorParams: {
    operator_code?: string;
    operator_label?: string;
    dirty_flg?: boolean;
  } = {};
  listDesc: any[];
  listVal: any[];
  resultVal = [];
  resultDesc = [];
  resultCountMessage: string;
  availableResource: string[];
  selectedList: string[] = [];
  carHeaders: TableHeader[];
  idHoldTimeParams;
  idHoldTimeDesc;
  customerLabel: string;
  operatorCodeItemList: string[];
  operatorLabelItemList: string[];
  cars;
  carModalValues: ModalValues;

  constructor(
    private operatorService: OperatorService,
    private modalService: KbaModalService,
    private alertService: KbaAlertService,
    private ref: ChangeDetectorRef
  ) {
    super(null, null, null);
  }

  get isSubmitBtnEnabled() {
    const autoCompleteGroups = this._getAutoCompleteGroups();

    return (
      this.operatorParams.some(
        ({ operator_code }) => operator_code != null && operator_code.length > 0
      ) &&
      this.operatorParams.some((_param, index) => {
        const group = autoCompleteGroups[`operator-${index}`];

        return group && group.every(item => item.isValid);
      })
    );
  }

  async ngOnInit() {
    this.customerLabel = this._getResourceValueName(
      'common.customer.ids',
      this.customerId
    );
    this.availableResource = this._getAvailableResource(this.resource);
    this.idHoldTimeDesc = [
      {
        name: 'id_hold_time',
        label: this.resource.id_hold_time.name,
        displayable: true,
      },
    ];

    // 入力欄追加用の空の要素を作成
    _.each(
      this.availableResource,
      name => (this.baseOperatorParams[name] = '')
    );
    this._setOperatorRequestHeader();
    this.settingOnParams.car_ids = this.selectedCarIds;
    this.carHeaders = this._createThList(this.listSettingFields);
    this.cars = await this._getSelectedCars(
      this.selectedCarIds,
      this.listSettingFields,
      this.carHeaders
    );

    this.operatorService
      .fetchIndexList(
        {
          customer_id: this.customerId,
        },
        this.operatorRequestHeaderParams
      )
      .then((res: any) => {
        this.operators = this._operatorFormatData(res.result_data.operators);
        this.operatorCodeItemList = _.map(
          this.operators,
          'operator_code'
        ).filter(Boolean);
        this.operatorLabelItemList = _.map(
          this.operators,
          'operator_label'
        ).filter(Boolean);
        this.setInitialOperators();
      });
  }

  /**
   * オペレータコードが変更された場合
   * @param operatorCode オペレータコード
   * @param f フォーム
   * @param idx 変更オペレータのインデックス
   */
  changeOperatorCode(operatorCode: string, f: NgForm, idx: number): void {
    f.form.controls[`hidden-operator-code-${idx}`].markAsDirty();
    this.operatorParams[idx]['operator_code'] = operatorCode;
    if (
      _.includes(this.operatorCodeItemList, operatorCode) ||
      operatorCode === ''
    ) {
      this.setOperatorLabel(operatorCode, idx);
    }
  }

  /**
   * オペレータ名が変更された場合
   * @param operatorLabel オペレータ名
   * @param f フォーム
   * @param idx 変更オペレータのインデックス
   */
  changeOperatorLabel(operatorLabel: string, f: NgForm, idx: number): void {
    f.form.controls[`hidden-operator-label-${idx}`].markAsDirty();
    this.operatorParams[idx]['operator_label'] = operatorLabel;
    if (
      _.includes(this.operatorLabelItemList, operatorLabel) ||
      operatorLabel === ''
    ) {
      this.setOperatorCode(operatorLabel, idx);
    }
  }

  /**
   * 入力リセットボタン押下コールバック
   *
   * 確認モーダルを表示し、確認後にフォームの内容を初期化する。
   */
  onClickReset(f: NgForm): void {
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      closeBtnLabel: this.labels.cancel,
      ok: () => this._resetForm(f),
    });
  }

  /**
   * 戻るボタン押下時コールバック
   */
  onClickReturn(): void {
    this.return.emit();
  }

  /**
   * 入力欄追加ボタン押下時コールバック
   *
   * 入力欄を3つ分、追加する。
   */
  onClickAddOperator(): void {
    this._extensionOperators(InputCarIndexOperatorRegisterSize.extendSize);
  }

  /**
   * オペレータ入力欄初期化
   */
  setInitialOperators(): void {
    this.operatorParams = [];
    this._extensionOperators(InputCarIndexOperatorRegisterSize.extendSize);
  }

  /**
   * オペレータIDがすべて空であるかのチェック
   * @return true すべて空 / false 空でないものが一つはある
   */
  emptyOperatorParams(): boolean {
    return _.every(this.operatorParams, op => _.isEmpty(op.operator_code));
  }

  /**
   * 登録ボタン押下時コールバック
   */
  async onClickSubmit(): Promise<void> {
    const autoCompleteGroups = this._getAutoCompleteGroups();
    const operatorParams = this.operatorParams.filter((_param, index) =>
      autoCompleteGroups[`operator-${index}`].every(item => item.isValid)
    );
    this.listDesc = this._getListDesc();
    this.listVal = this._getListVal(operatorParams);
    this.carModalValues = this._getModalValues(this.listSettingConfirmFields);
    this.carModalValues.listVal = await this._getSelectedCars(
      this.selectedCarIds,
      this.listSettingConfirmFields,
      this.carModalValues.listDesc
    );
    this.idHoldTimeParams = {
      id_hold_time: this._getResourceValueName(
        'id_hold_time',
        this.settingOnParams.id_hold_time
      ),
    };

    this.modalService.open(
      {
        title: this.labels.submit_modal_title,
        labels: this.labels,
        content: this.submitModalContent,
        closeBtnLabel: this.labels.cancel,
        ok: () => {
          const params = _.merge({}, this.settingOnParams, {
            operator_codes: this._getOperatorCodes(operatorParams),
          });
          this.operatorService.updateIdInput(params).then(res => {
            this._resultModalOpen(
              this.labels.operator_id_batch_setting_result_label,
              this.carModalValues.listDesc,
              this.carModalValues.listVal,
              res['responses'],
              () => {
                this.return.emit('reload');
              }
            );
          });
        },
      },
      { size: 'lg' }
    );
  }

  /**
   * ID保持時間の表示データを取得
   * @param idHoldTime ID保持時間
   */
  displayIdHoldTime(idHoldTime: number): string {
    const res = _.get(this.resource, 'id_hold_time');
    if (res) {
      const v = _.find(res.values, item => +item.value === idHoldTime);
      return v ? v.name : idHoldTime;
    } else {
      return '';
    }
  }

  /**
   * オペレータコードに対応するオペレータ名を設定します。
   * @param operatorCode オペレータコード
   * @param name プロパティ名
   * @param idx インデックス
   */
  setOperatorLabel(operatorCode: string, idx: number): void {
    const op = _.find(this.operators, operator => {
      return operator['operator_code'] === operatorCode;
    });
    this.operatorParams[idx]['operator_label'] = op ? op['operator_label'] : '';
  }

  /**
   * オペレータ名に対応するオペレータコードを設定します。
   * @param operatorLabel オペレータ名
   * @param name プロパティ名
   * @param idx インデックス
   */
  setOperatorCode(operatorLabel: string, idx: number): void {
    if (operatorLabel === '') {
      this.operatorParams[idx]['operator_code'] = '';
      return;
    }

    this.operatorParams[idx]['operator_code'] = _.find(
      this.operators,
      operator => {
        return operator['operator_label'] === operatorLabel;
      }
    )['operator_code'];
  }

  /**
   * IDキー設定がONかどうかを返却します。
   * @param idKeySettingKind IDキー設定
   * @return true:ON/false:OFF
   */
  isOperatorIdSettingKindOn(idKeySettingKind: string): boolean {
    return idKeySettingKind === OperatorIdentificationKind.idInput;
  }

  protected _fetchDataForInitialize() { }

  /**
   * 更新確認モーダルに表示するリストヘッダを取得
   * @return リストヘッダ
   */
  private _getListDesc(): any[] {
    return this.availableResource.map(ar => ({
      name: ar,
      label: this._reverseAvalableResource(ar).name,
      displayable: true,
    }));
  }

  /**
   * 更新確認モーダルに表示する内容を取得
   * @return 確認内容
   */
  private _getListVal(operatorParams): any[] {
    return _.chain(operatorParams)
      .filter(op => !_.isEmpty(op.operator_code))
      .map(op => {
        const result = { operator_code: op.operator_code };
        if (_.includes(this.availableResource, 'operator_label')) {
          result['operator_label'] = op.operator_label;
        }
        return result;
      })
      .uniqBy(op => op['operator_code'])
      .value();
  }

  /**
   * 更新対象オペレータコードを取得
   * @return 更新対象オペレータコード
   */
  private _getOperatorCodes(operatorParams): string[] {
    return _.chain(operatorParams)
      .filter(op => !_.isEmpty(op.operator_code))
      .map(op => op.operator_code)
      .uniq()
      .value();
  }

  /**
   * オペレータ入力欄を増やす
   *
   * @param size 増加数
   */
  private _extensionOperators(size: number): void {
    _.times(size, () => {
      if (
        this.operatorParams.length < InputCarIndexOperatorRegisterSize.maxSize
      ) {
        this.operatorParams.push(_.cloneDeep(this.baseOperatorParams));
      }
    });
  }

  /**
   * フォームのリセット
   *
   * @param f フォーム
   */
  private _resetForm(f: NgForm): void {
    this.setInitialOperators();
    this.idHoldTimeSelect.reset();
    f.form.markAsPristine();
  }

  /**
   * オペレータ情報取得のリクエストヘッダーを設定します。
   */
  private _setOperatorRequestHeader(): void {
    this.operatorRequestHeaderParams['X-Fields'] = _.chain(this.operatorFields)
      .map('path')
      .join(',');
    this.operatorRequestHeaderParams['X-From'] = 1;
    this.operatorRequestHeaderParams['X-Count'] = 0;
  }

  /**
   * 顧客IDキー・オペレータ情報 API で取得した値を見出しに合わせて整形します。
   * @param operators 顧客IDキー・オペレータ情報
   */
  private _operatorFormatData(operators): any[] {
    return _.chain(operators)
      .filter(operator => !InitialOperatorCodePattern.test(operator.code))
      .map(operator => ({
        operator_code: operator.code,
        operator_label: operator.current_label.label,
      }))
      .value();
  }

  /**
   * オペレータ情報のうちで利用可能なリソースを取得
   * @param resource リソース情報
   */
  private _getAvailableResource(resource: Resource): string[] {
    const result = [];
    if (_.has(resource, 'car_operator_id_input.operator_codes')) {
      result.push('operator_code');
    }
    if (_.has(resource, 'car_operator_id_input.operator_labels')) {
      result.push('operator_label');
    }
    return result;
  }

  private _reverseAvalableResource(key: string) {
    switch (key) {
      case 'operator_code':
        return _.get(this.resource, 'car_operator_id_input.operator_codes');
      case 'operator_label':
        return _.get(this.resource, 'car_operator_id_input.operator_labels');
    }
  }

  /**
   * 一括操作結果モーダルのオープン
   * @param title モーダルのタイトル
   * @param desc ヘッダ
   * @param requestData リスエストデータ
   * @param responseData レスポンスデータ
   * @param closeCallback 一括操作結果モーダルを閉じた時のコールバック
   */
  private _resultModalOpen(
    title: string,
    desc: TableHeader[],
    requestData: any[],
    responseData: any[],
    closeCallback: () => void
  ) {
    if (!this.resultModalContent) {
      return;
    }

    [
      this.resultDesc,
      this.resultVal,
      this.resultCountMessage,
    ] = this.modalService.createResultModalResource(
      this.labels,
      desc,
      requestData,
      responseData,
      this.resource
    );
    this.modalService.open(
      {
        title: title,
        labels: this.labels,
        content: this.resultModalContent,
        close: closeCallback,
      },
      { size: 'lg' }
    );
  }

  /**
   * 車両を取得し、表示用に整形する
   * @param selectedCarIds 車両ID
   * @param xFields 指定項目情報
   * @param thList ヘッダ情報
   */
  private async _getSelectedCars(
    selectedCarIds: string[],
    xFields: Fields,
    thList: TableHeader[]
  ) {
    let params = {
      common: { car_identification: { car_ids: selectedCarIds } },
    };
    if (this.exists('common.customer.ids')) {
      params = _.merge(params, {
        common: { customer: { ids: [this.customerId] } },
      });
    }
    const res = await this.operatorService.fetchInputCarIndexList(params, {
      'X-Fields': this._createXFields(xFields).join(','),
    });
    return this._formatList(res.result_data.cars, thList);
  }

  /**
   * API から取得したデータをテーブルで表示できる形に成形して返す。
   *
   * ネストしたオブジェクトをデータを指定項目のパス（ネスト関係をドット区切りの文字列で表現したもの）を
   * キーとしたオブジェクトに成形する。
   *
   * @param listBody APIから取得したリストデータ
   * @param thList テーブルヘッダ情報
   */
  private _formatList(listBody: any[], thList: any[]) {
    return listBody.map(data => {
      return _.reduce(
        thList,
        (result, th) => {
          result[th.name] = _.get(data, th.formatKey);
          return result;
        },
        {}
      );
    });
  }

  /**
   * オートコンプリートをグループ化する
   */
  private _getAutoCompleteGroups() {
    return _.groupBy(
      this.autoCompleteList.toArray(),
      item => item.containerElement.className
    );
  }
}
