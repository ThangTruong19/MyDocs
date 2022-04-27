import {
  Component,
  Input,
  Output,
  OnInit,
  EventEmitter,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import * as _ from 'lodash';

import { Resources, TableHeader } from '../../../../types/common';
import { OperatorRegistParams } from '../../../../types/flm/operator';

import { OperatorRegisterSize } from '../../../../constants/flm/operator';

import { KbaSelectedComponent } from '../../../shared/kba-selected/kba-selected.component';

import { OperatorService } from '../../../../services/flm/operator/operator.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';

interface OperatorData {
  operator_id?: string;
  operator_label?: string;
  dirty_flg?: boolean;
}

interface SimpleTableHeader {
  name: string;
  label: string;
  displayable: boolean;
}

@Component({
  selector: 'app-operator-register',
  templateUrl: './operator-register.component.html',
  styleUrls: [
    './operator-register.component.scss',
    '../shared/operator_identification_setting_modal.scss',
  ],
})
export class OperatorRegisterComponent implements OnInit {
  @ViewChild(KbaSelectedComponent, { static: false })
  customerLabelSelect: KbaSelectedComponent;
  @ViewChild('submitModalContent', { static: false })
  submitModalContent: TemplateRef<null>;
  @ViewChild('resetModalContent', { static: false })
  resetModalContent: TemplateRef<null>;
  @ViewChild('resultModalContent', { static: false })
  resultModalContent: TemplateRef<null>;

  @Input() labels;
  @Input() resource;
  @Input() thList;
  @Input() collapsed: boolean; // アコーディオンの開閉状態
  @Output() registered = new EventEmitter();

  params: OperatorRegistParams = { customer_id: '', operators: [] };
  operators: OperatorData[] = [];
  baseOperator: OperatorData = {};
  listDesc: SimpleTableHeader[];
  listVal;
  customerDesc: SimpleTableHeader[];
  customerVal;
  resultVal = [];
  resultDesc: SimpleTableHeader[] = [];
  resultCountMessage: string;
  fullResource = ['customer_id', 'operator_id', 'operator_label'];
  availableResource: string[];
  operatorIdName: string;
  operatorLabelName: string;
  existingOperatorLabels: string[] = [];
  isOperatorFetching: boolean;
  isOperatorLabelDuplicate: boolean;
  currentCustomerId: string;
  isDisplayCustomer = false;
  warningColumns = ['operator_label'];

  constructor(
    private operatorService: OperatorService,
    private modalService: KbaModalService,
    private alertService: KbaAlertService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.operatorIdName = this._getThLabel('operators.code');
    this.operatorLabelName = this._getThLabel('operators.current_label.label');
    if (_.get(this.resource, 'operators.code')) {
      this.resource.operator_id = this.resource.operators.code;
    }
    if (_.get(this.resource, 'operators.current_label.label')) {
      this.resource.operator_label = this.resource.operators.current_label.label;
    }

    this.availableResource = _.filter(this.fullResource, name => {
      return _.has(this.resource, name);
    });

    if (_.includes(this.availableResource, 'customer_id')) {
      this.isDisplayCustomer = true;
      this.customerDesc = this._createCustomerDesc(this.resource);
    }

    // 入力欄追加用の空の要素を作成
    _.each(this.availableResource, name => {
      if (name !== 'customer_id') {
        this.baseOperator[name] = '';
      }
    });

    this.setInitialOperators();
  }

  /**
   * 入力欄追加ボタン押下コールバック
   *
   * 入力欄を指定サイズ分、追加する。
   */
  onClickAddOperator() {
    this._extensionOperators(OperatorRegisterSize.extendSize);
  }

  /**
   * 登録ボタン押下コールバック
   *
   * 確認モーダルを表示し、確認後に登録APIをリクエストする。
   * リクエスト成功時にアラートメッセージを表示し、フォームの内容を初期化する。
   *
   * @param f フォーム
   */
  async onClickSubmit(f: NgForm): Promise<void> {
    await this._refreshOperatorLabels(this.params.customer_id);
    this.listDesc = this._createListDesc();
    this.listVal = this._createListVal();
    if (this.isDisplayCustomer) {
      this.customerVal = this._createCustomerVal(this.resource, this.params);
    }

    const params = this._createParams(this.params, this.operators);
    this.modalService.open({
      title: this.labels.submit_modal_title,
      labels: this.labels,
      content: this.submitModalContent,
      closeBtnLabel: this.labels.cancel,
      ok: () => {
        this.operatorService.createOperatorId(params).then(res => {
          this._resetForm(f);
          this._resultModalOpen(
            this.labels.operator_id_register_result_label,
            this.listDesc,
            this.listVal,
            res['responses'],
            () => {
              this.registered.emit();
            }
          );
        });
      },
    });
  }

  /**
   * 入力リセットボタン押下コールバック
   *
   * 確認モーダルを表示し、確認後にフォームの内容を初期化する。
   *
   * @param f フォーム
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
   * オペレータID入力時コールバック
   *
   * オペレータ名を入力必須状態にする
   *
   * @param f フォーム
   * @param i オペレータの番号
   */
  onChangeId(f: NgForm, i: number): void {
    if (
      _.has(this.resource, 'operator_label') &&
      !_.isEmpty(this.operators[i]['operator_id'])
    ) {
      f.form.controls[`operator-name-${i}`].markAsDirty();
      this.operators[i]['dirty_flg'] = true;
    } else if (
      !_.has(this.resource, 'operator_label') &&
      !_.isEmpty(this.operators[i]['operator_id'])
    ) {
      this.operators[i]['dirty_flg'] = true;
    } else {
      if (_.isEmpty(this.operators[i]['operator_label'])) {
        this.operators[i]['dirty_flg'] = false;
      }
    }
  }

  /**
   * オペレータ名入力時コールバック
   *
   * オペレータIDを入力必須状態にする
   *
   * @param f フォーム
   * @param i オペレータの番号
   */
  onChangeName(f: NgForm, i: number): void {
    if (
      _.has(this.resource, 'operator_id') &&
      !_.isEmpty(this.operators[i]['operator_label'])
    ) {
      f.form.controls[`operator-id-${i}`].markAsDirty();
      this.operators[i]['dirty_flg'] = true;
    } else {
      if (_.isEmpty(this.operators[i]['operator_id'])) {
        this.operators[i]['dirty_flg'] = false;
      }
    }
  }

  /**
   * オペレータ入力欄初期化
   */
  setInitialOperators(): void {
    this.operators = [];
    this._extensionOperators(OperatorRegisterSize.extendSize);
  }

  /**
   * オペレータ登録に領域が未入力状態かどうか
   */
  isNotInputOperators(): boolean {
    return _.every(this.operators, operator => !operator['dirty_flg']);
  }

  /**
   * 指定した顧客の既存オペレータ名を取得
   * @param customerId 顧客ID
   */
  private async _refreshOperatorLabels(
    customerId: string = null
  ): Promise<void> {
    this.isOperatorFetching = true;
    this.currentCustomerId = customerId;
    if (this.availableResource.includes('operator_label')) {
      const res = await this.operatorService.fetchAllOperatorLabels(customerId);
      this.existingOperatorLabels = res.result_data.operators.map(
        ope => ope.current_label.label
      );
    }
    this.isOperatorFetching = false;
  }

  /**
   * オペレータ入力欄を増やす
   *
   * @param size 増加数
   */
  private _extensionOperators(size: number): void {
    _.times(size, () => {
      if (this.operators.length < OperatorRegisterSize.maxSize) {
        this.operators.push(_.cloneDeep(this.baseOperator));
      }
    });
  }

  /**
   * 確認モーダルに表示する顧客情報ヘッダを返す
   * @param resource リソース情報
   */
  private _createCustomerDesc(resource: Resources): SimpleTableHeader[] {
    return [
      {
        name: 'customer_id',
        label: resource.customer_id.name,
        displayable: true,
      },
    ];
  }

  /**
   * 確認モーダルに表示する顧客情報内容を返す
   * @param resource リソース情報
   * @param params パラメータ
   */
  private _createCustomerVal(
    resource: Resources,
    params: OperatorRegistParams
  ) {
    const customer_id = _.find(
      resource.customer_id.values,
      v => v.value === params.customer_id
    );
    return {
      customer_id: (customer_id || resource.customer_id.values[1]).name,
    };
  }

  /**
   * 確認モーダルに表示するヘッダラベルの取得
   */
  private _createListDesc(): SimpleTableHeader[] {
    const res = _.without(this.availableResource, 'customer_id');
    return _.map(res, name => ({
      name: name,
      label: this.resource[name].name,
      displayable: true,
    }));
  }

  /**
   * 確認モーダルに表示する値の取得
   */
  private _createListVal() {
    this.isOperatorLabelDuplicate = false;
    return _.filter(this.operators, o => o.operator_id).map(o => {
      const result = _.cloneDeep(o);
      if (
        !_.isEmpty(o.operator_label) &&
        _.includes(this.existingOperatorLabels, o.operator_label)
      ) {
        result['css_class'] = 'warning';
        this.isOperatorLabelDuplicate = true;
      }
      return result;
    });
  }

  /**
   * フォームのリセット
   *
   * @param f フォーム
   */
  private _resetForm(f: NgForm): void {
    this.setInitialOperators();
    if (this.resource.customer_id) {
      this.customerLabelSelect.reset();
    }
    f.form.markAsPristine();
  }

  /**
   * 更新用パラメタを設定します。
   * @param operatorList 更新対象データ
   */
  private _createParams(
    params: OperatorRegistParams,
    operatorList: OperatorData[]
  ): OperatorRegistParams {
    const operators = _.chain(operatorList)
      .filter(operator => operator.operator_id !== '')
      .reduce((array, o) => {
        array.push({
          code: o.operator_id,
          current_label: {
            label: o.operator_label,
          },
        });
        return array;
      }, [])
      .value();
    return { customer_id: params.customer_id, operators };
  }

  /**
   * ヘッダリストからキー名で指定したラベル名を取得する
   * @param name ヘッダリストのキー名
   * @return ラベル名
   */
  private _getThLabel(name: string): string {
    const t = _.find(this.thList, th => th.name === name);
    return t ? t.label : '';
  }

  /**
   * 一括操作結果モーダルのオープン
   * @param title モーダルのタイトル
   * @param desc 確認モーダルのヘッダ
   * @param requestData リスエストデータ（確認モーダルの内容）
   * @param responseData レスポンスデータ
   * @param closeCallback 一括操作結果モーダルを閉じた時のコールバック
   */
  private _resultModalOpen(
    title: string,
    desc: SimpleTableHeader[],
    requestData: any[],
    responseData: any[],
    closeCallback: () => void
  ): void {
    if (!this.resultModalContent) {
      return;
    }

    [
      this.resultDesc,
      this.resultVal,
      this.resultCountMessage,
    ] = this.modalService.createResultModalResource(
      this.labels,
      <TableHeader[]>desc,
      requestData,
      responseData,
      this.resource
    );
    this.modalService.open({
      title: title,
      labels: this.labels,
      content: this.resultModalContent,
      close: closeCallback,
    });
  }
}
