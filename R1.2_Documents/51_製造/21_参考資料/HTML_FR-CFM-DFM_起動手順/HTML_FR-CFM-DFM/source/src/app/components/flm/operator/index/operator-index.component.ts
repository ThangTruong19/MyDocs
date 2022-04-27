import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import {
  OperatorIndexParams,
  OperatorUpdateParams,
  OperatorDeleteParams,
} from '../../../../types/flm/operator';
import { RequestHeaderParams } from '../../../../types/request';
import { ModalValues, Resources, Labels } from '../../../../types/common';

import { KbaMimeType } from '../../../../constants/mime-types';
import { ProcessingType } from '../../../../constants/download';
import { Apis } from '../../../../constants/apis';

import { KbaAbstractIndexComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-index-component';

import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { OperatorService } from '../../../../services/flm/operator/operator.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';

@Component({
  selector: 'app-operator-index',
  templateUrl: './operator-index.component.html',
  styleUrls: [
    './operator-index.component.scss',
    '../shared/operator_identification_setting_modal.scss',
  ],
})
export class OperatorIndexComponent extends KbaAbstractIndexComponent
  implements OnInit {
  @ViewChild('historyModalContent', { static: false })
  historyModalContent: TemplateRef<null>;
  @ViewChild('resetModalContent', { static: false })
  resetModalContent: TemplateRef<null>;
  @ViewChild('submitModalContent', { static: false })
  submitModalContent: TemplateRef<null>;
  @ViewChild('deleteModalContent', { static: false })
  deleteModalContent: TemplateRef<null>;

  params: OperatorIndexParams;
  registerCollapsed = true;
  optionalTableColumn = ['header_history'];
  checkIdName = 'operators.id';
  disableHistories: Object = {};
  initList: any[] = [];
  existingOperatorLabels: string[] = [];
  isOperatorLabelDuplicate: boolean;
  isOperatorFetching = false;
  currentCustomerId = '';
  deleteModalValues: ModalValues;
  historyModalValues: ModalValues;
  editModalValues: ModalValues;
  downloadFieldPaths: string[];
  registResource: Resources;
  registLabels: Labels;
  batchDeleteLimit: number;
  checkedItems: { [key: string]: boolean } = {};
  warningColumns = ['operators.current_label.label'];

  deleteModalPromise: Promise<void>;
  historyModalPromise: Promise<void>;
  editModalPromise: Promise<void>;
  downloadFieldsPromise: Promise<void>;

  get selectedList() {
    return _.map(this.checkedItems, (value, key) =>
      value ? key : null
    ).filter(Boolean);
  }

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    modalService: KbaModalService,
    private operatorService: OperatorService,
    private alertService: KbaAlertService,
    private api: ApiService
  ) {
    super(navigationService, title, router, ref, header, modalService);
    this.batchDeleteLimit = (window as any).settings.carBatchDeleteLimit;
  }

  /**
   * テーブルに表示するデータを取得
   */
  async fetchList(sort_key?: string): Promise<void> {
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    this.isFetching = true;
    const res = await this.operatorService.fetchIndexList(
      this.searchParams,
      this.requestHeaderParams
    );
    const formatted = this._formatList(res.result_data.operators, this.thList);
    this._setDisables(res.result_data.operators);
    this._fillLists(res.result_header, formatted);
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * ID 登録アコーディオンの開閉変更時の処理
   * @param isCollapsed 開閉状態
   */
  onChangeRegisterAccordionState(isCollapsed: boolean) {
    this.registerCollapsed = !this.registerCollapsed;
  }

  /**
   * 検索処理
   */
  onClickSearch(): void {
    super.onClickSearch();
    this.fetchList(this.sortingParams['sort']);
    this.checkedItems = {};
  }

  /**
   * 変更ボタン押下コールバック
   *
   * 確認モーダルを表示し、確認後に変更APIをリクエストする。
   * リクエスト成功時にアラートメッセージを表示し、一覧を初期化する。
   */
  async onClickSubmit(): Promise<void> {
    if (this.editModalValues == null) {
      this._showLoadingSpinner();
      await this.editModalPromise;
      this._hideLoadingSpinner();
    }

    const customerId = this.resource.customer_id
      ? this.searchParams.customer_id
      : null;
    const operators = (await this.operatorService.fetchAllOperatorLabels(
      customerId,
      this.editModalValues.requestHeaderParams['X-Fields']
    )).result_data.operators;
    this.existingOperatorLabels = operators.map(
      operator => operator.current_label.label
    );

    this.editModalValues.listVal = await this._createEditListVal(
      this.selectedList,
      operators
    );
    const updateParams = this._createUpdateParams(
      this.editModalValues.listVal,
      this.searchParams['customer_id']
    );

    this.modalService.open({
      title: this.labels.update_modal_body,
      labels: this.labels,
      content: this.submitModalContent,
      closeBtnLabel: this.labels.cancel,
      ok: async () => {
        const res = await this.operatorService.updateOperators(updateParams);
        this._resultModalOpen(
          this.labels.operator_id_edit_result_label,
          this.editModalValues.listDesc,
          this.editModalValues.listVal,
          res['responses'],
          () => {
            this.fetchList(this.sortingParams['sort']);
          },
          {
            size: 'lg',
          }
        );
      },
    });
  }

  /**
   * 削除ボタン押下コールバック
   *
   * 確認モーダルを表示し、確認後に変更APIをリクエストする。
   * リクエスト成功時にアラートメッセージを表示し、一覧を初期化する。
   *
   * @param operator オペレータ
   */
  onClickDelete(operator: object): void {
    const ids = [operator['operators.id']];
    this.deleteOperators(ids);
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
   * 履歴ボタン押下時の処理
   * @param operatorId 対象オペレータのID
   */
  async onClickHistory(operatorId: string): Promise<void> {
    // 履歴なしの場合は何もしない
    if (this.disableHistories[operatorId]) {
      return;
    }

    if (this.historyModalValues == null) {
      this._showLoadingSpinner();
      await this.historyModalValues;
      this._hideLoadingSpinner();
    }

    const operators = await this._getOperators(
      [operatorId],
      this.historyModalValues.requestHeaderParams
    );
    const modalTitle = `${
      this._labelMaps(this.thList, ['operators.code'])[0]
    } : ${operators[0].code}`;
    this.historyModalValues.listVal = this._createHistoryModalListVal(
      operators[0]
    );
    this.modalService.open({
      title: modalTitle,
      labels: this.labels,
      content: this.historyModalContent,
    });
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
   * 登録処理完了時コールバック
   *
   * 検索処理を実行する
   */
  onRegisterdOperator(): void {
    this.fetchList(this.sortingParams['sort']);
  }

  /**
   * 一括削除ボタン押下コールバック
   *
   * 一括削除APIをリクエストする
   */
  onClickDeleteAll(): void {
    this.deleteOperators(this.selectedList);
  }

  /**
   * 一括ダウンロードボタン押下時の処理
   */
  async onClickDownload(): Promise<void> {
    const header = _.clone(this.requestHeaderParams);
    header['X-Sort'] = this.sortingParams['sort'];
    header['X-Fields'] = this.downloadFieldPaths;
    header['X-Count'] = null;
    header['X-From'] = null;

    this._showLoadingSpinner();

    try {
      const res: any = await this.operatorService.createFile(
        Apis.getOperatorsFileCreate,
        {
          ...this.searchParams,
          file_content_type: KbaMimeType.excel,
          processing_type: ProcessingType.sync,
        },
        header
      );
      await this.api.downloadFile(res.result_data.file_id, KbaMimeType.excel);
    } finally {
      this._hideLoadingSpinner();
    }
  }

  /**
   * オペレータ情報の削除処理
   * @param ids 対象オペレータのID
   */
  async deleteOperators(ids: string[]): Promise<void> {
    if (this.deleteModalValues == null) {
      this._showLoadingSpinner();
      await this.deleteModalPromise;
      this._hideLoadingSpinner();
    }

    this.deleteModalValues.listVal = this._formatList(
      await this._getOperators(ids, this.deleteModalValues.requestHeaderParams),
      this.deleteModalValues.listDesc
    );
    this._openDeleteConfirmModal();
  }

  /**
   * テーブルの初期化に必要なデータを取得
   */
  protected async _fetchDataForInitialize(): Promise<void> {
    const res = await this.operatorService.fetchOperatorInitData();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this._reflectXFields(res.fields);
    this.thList = this._createThList(res.fields);
    this.sortableThList = this.sortableThLists(this.thList);
    this.displayableThList = this.displayableThLists(this.thList);
    this.deletable = res.deletable;
    if (!this.resource.operator_label && !this.resource.customer_id) {
      this.collapsed = true;
    }
  }

  protected _afterInitFetchList() {
    this.deleteModalPromise = this._buildDeleteModalValues();
    this.historyModalPromise = this._buildHistoryModalValues();
    this.editModalPromise = this._buildEditModalValues();
    this.downloadFieldsPromise = this._buildDownloaFields();
    this._fetchRegstResources();
  }

  /**
   * データ取得後、リストにデータを挿入します。
   * @param resultHeader API のレスポンスヘッダ
   * @param resultData API のレスポンスデータ
   */
  protected _fillLists(resultHeader: any, resultData: any) {
    super._fillLists(resultHeader, resultData);
    this.initList = _.cloneDeep(this.lists.originList);
  }

  /**
   * 画面上のボタン（履歴）の有効・無効状態をセットする
   * @param operators オペレータ情報
   */
  protected _setDisables(operators: any[]): void {
    operators.forEach(operator => {
      this.disableHistories[operator.id] = _.isEmpty(operator.label_histories);
    });
  }

  /**
   * 各確認モーダル表示用にオペレータ情報を取得する
   * @param ids ID
   * @param requestHeaderParams リクエストヘッダ情報
   */
  private async _getOperators(
    ids: string[],
    requestHeaderParams: RequestHeaderParams
  ) {
    const res = await this.operatorService.fetchIndexList(
      this.searchParams,
      _.merge({}, this.requestHeaderParams, requestHeaderParams, {
        'X-From': null,
        'X-Count': null,
      })
    );
    return this._reduceOperators(res.result_data.operators, ids);
  }

  /**
   * 履歴モーダルの表示値を作成
   * @param operator オペレータ情報
   */
  private _createHistoryModalListVal(operator) {
    return _.map(operator.label_histories, h =>
      _.reduce(
        ['label', 'start_datetime'],
        (result, label) => {
          if (label === 'start_datetime') {
            result[`operators.label_histories.${label}`] = `${this.dateFormat(
              h.start_datetime
            )} 〜 ${this.dateFormat(h.end_datetime)}`;
          } else {
            result[`operators.label_histories.${label}`] = h[label];
          }
          return result;
        },
        {}
      )
    );
  }

  /**
   * 確認モーダルに表示する値の取得
   * @param ids ID
   */
  private async _createEditListVal(ids: string[], operators: any[]) {
    this.isOperatorLabelDuplicate = false;
    const editList = this._formatList(
      this._reduceOperators(operators, ids),
      this.editModalValues.listDesc
    );

    const list = this.lists.visibleList;

    return editList.map(operator => {
      const index = _.findIndex(
        list,
        row => row[this.checkIdName] === operator[this.checkIdName]
      );
      const currentLabel = list[index]['operators.current_label.label'];
      if (
        this.initList[index]['operators.current_label.label'] !== currentLabel
      ) {
        if (this._isDuplicateLabel(currentLabel)) {
          operator['css_class'] = 'warning';
          this.isOperatorLabelDuplicate = true;
        }
        operator['operators.current_label.label'] = currentLabel;
      }
      return operator;
    });
  }

  /**
   * 更新用パラメタを設定します。
   * @param list 更新対象データ
   */
  private _createUpdateParams(
    list: object[],
    customerId: string
  ): OperatorUpdateParams {
    return {
      customer_id: customerId,
      operators: _.map(list, listItem => ({
        id: listItem['operators.id'],
        current_label: {
          label: listItem['operators.current_label.label'],
        },
        update_datetime: listItem['operators.update_datetime'],
      })),
    };
  }

  /**
   * 削除確認モーダルを開きます.
   */
  private _openDeleteConfirmModal() {
    const deleteParams = this._getDeleteParams(this.deleteModalValues.listVal);

    this.modalService.open({
      title: this.labels.delete_modal_body,
      labels: this.labels,
      content: this.deleteModalContent,
      okBtnLabel: this.labels.delete,
      okBtnClass: 'btn-delete',
      closeBtnLabel: this.labels.cancel,
      ok: async () => {
        const res = await this.operatorService.deleteOperators(deleteParams);
        this._resultModalOpen(
          this.labels.operator_id_delete_result_label,
          this.deleteModalValues.listDesc,
          this.deleteModalValues.listVal,
          res['responses'],
          () => {
            this.pageParams.pageNo = 1;
            this.pageParams.dispPageNo = 1;
            this._reflectPageParams();
            this.fetchList(this.sortingParams['sort']);
            this.checkedItems = {};
          }
        );
      },
    });
  }

  /**
   * 削除用パラメタを取得します。
   * @param list 更新対象データ
   */
  private _getDeleteParams(list: object[]): OperatorDeleteParams {
    return {
      operator: _.map(
        list,
        listItem =>
          `${listItem['operators.id']},${listItem['operators.update_datetime']}`
      ),
    };
  }

  /**
   * オペレータ入力欄初期化
   */
  private _setInitialOperators(): void {
    this.lists.visibleList = _.cloneDeep(this.initList);
    this.checkedItems = {};
  }

  /**
   * フォームのリセット
   *
   * @param f フォーム
   */
  private _resetForm(f: NgForm) {
    this._setInitialOperators();
    f.form.markAsPristine();
  }

  /**
   * オペレータ情報をIDで絞り込む
   * @param operators オペレータ情報
   * @param ids ID
   */
  private _reduceOperators(operators, ids: string[]) {
    return _.filter(operators, operator => _.includes(ids, operator.id));
  }

  /**
   * 登録されているオペレータ名に対して重複があるかどうかを返す
   * @param label オペレータ名
   */
  private _isDuplicateLabel(label) {
    return !_.isEmpty(label) && this.existingOperatorLabels.includes(label);
  }

  /**
   * 削除モーダル用ヘッダ項目生成
   */
  private _buildDeleteModalValues() {
    return new Promise<void>(async (resolve) => {
      const res = await this.operatorService.fetchIndexDeleteFields();
      this.deleteModalValues = this._getModalValues(res, null, {
        noOptionTableColumn: true,
      });
      resolve();
    });
  }

  /**
   * 履歴モーダル用ヘッダ項目生成
   */
  private _buildHistoryModalValues() {
    return new Promise<void>(async (resolve) => {
      const res = await this.operatorService.fetchIndexHistoryFields();
      this.historyModalValues = this._getModalValues(res, null, {
        noOptionTableColumn: true,
      });
      resolve();
    });
  }

  /**
   * 変更モーダル用ヘッダ項目生成
   */
  private _buildEditModalValues() {
    return new Promise<void>(async (resolve) => {
      const res = await this.operatorService.fetchIndexEditFields();
      this.editModalValues = this._getModalValues(res, null, {
        noOptionTableColumn: true,
      });
      resolve();
    });
  }

  /**
   * ダウンロード用指定項目取得
   */
  private _buildDownloaFields() {
    return new Promise<void>(async (resolve) => {
      const res = await this.operatorService.fetchIndexDownloadFields();
      this.downloadFieldPaths = _.map(res, 'path');
      resolve();
    });
  }

  /**
   * 登録用ラベル・リソース取得
   */
  private async _fetchRegstResources() {
     this.operatorService.fetchIndexRegistResources().then(res => this.registResource = res);
     this.operatorService.fetchIndexRegistLabels().then(res => this.registLabels = res);
  }
}
