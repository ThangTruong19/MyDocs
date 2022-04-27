import {
  Component,
  OnInit,
  Input,
  Output,
  ViewChild,
  TemplateRef,
  ChangeDetectorRef,
  EventEmitter,
} from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import { ModalValues, Fields, TableHeader } from '../../../../types/common';

import { OperatorIdentificationKind } from '../../../../constants/flm/operator';

import { KbaAbstractIndexComponent } from '../../../shared/kba-abstract-component/kba-abstract-index-component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { OperatorService } from '../../../../services/flm/operator/operator.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';

@Component({
  selector: 'app-operator-input-car-batch-delete',
  templateUrl: './operator-input-car-batch-delete.component.html',
  styleUrls: ['./operator-input-car-batch-delete.component.scss'],
})
export class OperatorInputCarBatchDeleteComponent
  extends KbaAbstractIndexComponent
  implements OnInit {
  @ViewChild('deleteModalContent', { static: false })
  deleteModalContent: TemplateRef<null>;

  @Input() selectedCarIds: string[];
  @Input() customerId: string;
  @Input() params;
  @Input() resource;
  @Input() labels;
  @Input() functions;
  @Input() operatorFields;
  @Input() listSettingFields;
  @Input() listSettingConfirmFields;
  @Output() return = new EventEmitter<any>();

  checkIdName = 'operators.id';
  customerLabel: string;
  thList: TableHeader[];
  carHeaders: TableHeader[];
  cars;
  operatorModalValues: ModalValues;
  carModalValues: ModalValues;
  checkedItems: { [key: string]: boolean } = {};
  _super_ngOnInit = super.ngOnInit;

  get selectedList() {
    return _.map(this.checkedItems, (value, key) =>
      value ? key : null
    ).filter(Boolean);
  }

  constructor(
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    modalService: KbaModalService,
    private operatorService: OperatorService,
    private alertService: KbaAlertService
  ) {
    super(null, null, router, ref, header, modalService);
  }

  async ngOnInit() {
    this.customerLabel = this._getResourceValueName(
      'common.customer.ids',
      this.customerId
    );
    // 詳細は単数のため配列の第一要素に挿入
    this.carHeaders = this._createThList(this.listSettingFields);
    this.cars = await this._getSelectedCars(
      this.selectedCarIds,
      this.listSettingFields,
      this.carHeaders
    );
    this._super_ngOnInit();
  }

  async fetchList(sort_key?: string): Promise<any> {
    this.isFetching = true;
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    const res = await this.operatorService.fetchIndexList(
      { customer_id: this.customerId, car_id: this.selectedCarIds },
      this.requestHeaderParams
    );
    this.lists.originList = this._formatList(
      res.result_data.operators,
      this.thList
    );
    this.lists.visibleList = this.lists.originList;
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * 該当行がチェックされているかを返却します。
   * @param operatorId オペレータID
   * @return true: チェック済/ false: 未チェック
   */
  isChecked(operatorId: string): boolean {
    return _.includes(this.selectedList, operatorId);
  }

  /**
   * 戻るボタン押下時コールバック
   */
  onClickReturn(): void {
    this.return.emit();
  }

  /**
   * 削除ボタン押下時コールバック
   */
  async onClickDelete(): Promise<void> {
    this.operatorModalValues.listVal = await this._selectedOperator();
    this.carModalValues = this._getModalValues(this.listSettingConfirmFields);
    this.carModalValues.listVal = await this._getSelectedCars(
      this.selectedCarIds,
      this.listSettingConfirmFields,
      this.carModalValues.listDesc
    );
    this.modalService.open({
      title: this.labels.delete_modal_body,
      labels: this.labels,
      content: this.deleteModalContent,
      okBtnLabel: this.labels.delete,
      okBtnClass: 'btn-delete',
      closeBtnLabel: this.labels.cancel,
      ok: () => {
        this.operatorService
          .deleteOperatorsIdInput({
            car_id: this.selectedCarIds,
            operator_code: this._selectedOperatorCode(),
          })
          .then(res => {
            this._resultModalOpen(
              this.labels.operator_id_batch_delete_result_label,
              this.carModalValues.listDesc,
              this.cars,
              res['responses'],
              () => {
                this.return.emit('reload');
              },
              { size: 'lg' }
            );
          });
      },
    });
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
   * 削除オペレータの選択済みチェック
   * @return true:未選択/false:選択済み
   */
  emptyOperatorParams(): boolean {
    return _.isEmpty(this.selectedList);
  }

  /**
   * IDキー設定がONかどうかを返却します。
   * @param idKeySettingKind IDキー設定
   * @return true:ON/false:OFF
   */
  isOperatorIdSettingKindOn(idKeySettingKind: string): boolean {
    return idKeySettingKind === OperatorIdentificationKind.idInput;
  }

  protected _fetchDataForInitialize(): Promise<any> {
    return new Promise(resolve => {
      const xFieldPaths = this._createXFields(this.operatorFields);
      this._setXFields(xFieldPaths);
      this.thList = this._createThList(this.operatorFields);
      this.sortableThList = this.sortableThLists(this.thList);
      this.operatorModalValues = this._getModalValues(this.operatorFields);
      resolve();
    });
  }

  /**
   * 一括操作結果モーダルのオープン
   * @param title モーダルのタイトル
   * @param desc ヘッダ
   * @param requestData リスエストデータ
   * @param responseData レスポンスデータ
   * @param closeCallback 一括操作結果モーダルを閉じた時のコールバック
   * @param modalOption NgbModalに渡すオプション
   */
  protected _resultModalOpen(
    title: string,
    desc: TableHeader[],
    requestData: any[],
    responseData: any[],
    closeCallback: () => void,
    modalOption = {}
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
      modalOption
    );
  }

  /**
   * 選択状態のオペレータのオペレータコードを取得
   */
  private _selectedOperatorCode(): string[] {
    return this.lists.originList
      .filter(row => this.selectedList.includes(row[this.checkIdName]))
      .map(operator => operator['operators.code']);
  }

  /**
   * 選択状態のオペレータの情報を取得（削除確認モーダル用）
   */
  private async _selectedOperator() {
    const res = await this.operatorService.fetchIndexList(
      {
        customer_id: this.customerId,
      },
      this.operatorModalValues.requestHeaderParams
    );
    const selectedData = res.result_data.operators.filter(list =>
      this.selectedList.includes(list.id)
    );
    return this._formatList(selectedData, this.operatorModalValues.listDesc);
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
}
