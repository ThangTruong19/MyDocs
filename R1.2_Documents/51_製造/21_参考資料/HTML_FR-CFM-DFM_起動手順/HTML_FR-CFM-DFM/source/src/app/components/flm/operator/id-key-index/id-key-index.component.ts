import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import { Api, ModalValues } from '../../../../types/common';
import { RequestHeaderParams } from '../../../../types/request';
import {
  OperatorIdKeyIndexParams as IndexParams,
  OperatorIdKeyUpdateParams as UpdateParams,
  OperatorIndexParams,
} from '../../../../types/flm/operator';

import { ProcessingType } from '../../../../constants/download';
import { FunctionCode } from '../../../../constants/flm/function-codes/operator-management';
import { InitialOperatorCodePattern } from '../../../../constants/flm/operator';
import { Apis } from '../../../../constants/apis';

import { KbaAbstractIndexComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-index-component';

import { OperatorService } from '../../../../services/flm/operator/operator.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { KbaAutocompleteComponent } from '../../../shared/kba-autocomplete/kba-autocomplete.component';

@Component({
  selector: 'app-id-key-index',
  templateUrl: './id-key-index.component.html',
  styleUrls: ['./id-key-index.component.scss'],
})
export class OperatorIdKeyIndexComponent extends KbaAbstractIndexComponent
  implements OnInit {
  @ViewChild('historyModalContent', { static: false })
  historyModalContent: TemplateRef<null>;
  @ViewChild('resetModalContent', { static: false })
  resetModalContent: TemplateRef<null>;
  @ViewChild('submitModalContent', { static: false })
  submitModalContent: TemplateRef<null>;
  @ViewChild('unlinkModalContent', { static: false })
  unlinkModalContent: TemplateRef<null>;
  @ViewChildren(KbaAutocompleteComponent) autoCompleteList: QueryList<
    KbaAutocompleteComponent
  >;

  checkIdName = 'id_keys.code';

  params: IndexParams;
  optionalTableColumn = [
    // 履歴列は不要のため一旦コメントアウト
    // 'header_history',
    'header_unlink',
  ];
  listDesc: string[];
  listVal: string[];
  disableHistories: Object = {};
  disableUnlinks: Object = {};
  initList: any[] = [];
  operatorGetparams: OperatorIndexParams = { customer_id: '' };
  operatorRequestHeaderParams: RequestHeaderParams = {};
  seletecOperatorCodeItemList: string[] = [];
  seletecOperatorLabelItemList: string[] = [];
  operators: {
    operator_code: string;
    operator_label: string;
  }[] = [];
  isEditting: boolean;
  operatorXFields = null;
  fixedColumns = [];
  downloadPopoverVisible = false;
  scrollAmount: object = {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  };
  fetchTimeOut;
  searchDebounceTime = 50;
  historyModalValues: ModalValues;
  editModalValues: ModalValues;
  unlinkModalValues: ModalValues;
  checkedItems: { [key: string]: boolean } = {};

  unlinkModalPromise: Promise<void>;
  editModalPromise: Promise<void>;

  get selectedList() {
    return _.map(this.checkedItems, (value, key) =>
      value ? key : null
    ).filter(Boolean);
  }

  get isUnlinkAllBtnDisabled() {
    return this.selectedList.some((code: string) => this.disableUnlinks[code]);
  }

  get editedList() {
    return this.autoCompleteList
      .toArray()
      .filter(autoComplete => autoComplete.isEdited());
  }

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    router: Router,
    header: CommonHeaderService,
    modalService: KbaModalService,
    ref: ChangeDetectorRef,
    private operatorService: OperatorService,
    private alertService: KbaAlertService,
    private api: ApiService
  ) {
    super(navigationService, title, router, ref, header, modalService);
  }

  /**
   * 検索ボタン押下時の処理
   */
  onClickSearch(): void {
    if (this.isFetching) {
      return;
    }
    clearTimeout(this.fetchTimeOut);
    super.onClickSearch();
    this.fetchList(this.sortingParams['sort']);
    this.checkedItems = {};
  }

  /**
   * 履歴ボタン押下時の処理
   * @param idKeyCode IDキー番号
   */
  async onClickHistory(idKeyCode: string): Promise<void> {
    // 履歴なしの場合は何もしない
    if (this.disableHistories[idKeyCode]) {
      return;
    }
    const idKeys = await this._getIdKeys(
      [idKeyCode],
      this.historyModalValues.requestHeaderParams
    );
    const modalTitle = `${
      this._labelMaps(this.thList, ['id_keys.code'])[0]
      } : ${idKeys[0].code}`;
    this.historyModalValues.listVal = this._createHistoryModalListVal(
      idKeys[0]
    );
    this.modalService.open({
      title: modalTitle,
      labels: this.labels,
      content: this.historyModalContent,
    });
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

    this.editModalValues.listVal = await this._createEditListVal(
      this.selectedList.filter((code: string) =>
        this.editedList.some(autoComplete => autoComplete.identifier === code)
      )
    );
    const updateParams = this._createUpdateParams(
      this.editModalValues.listVal,
      this.searchParams['customer_id']
    );

    this.modalService.open({
      title: this.labels.submit_modal_title,
      labels: this.labels,
      content: this.submitModalContent,
      closeBtnLabel: this.labels.cancel,
      ok: async () => {
        const res = await this.operatorService.updateIdKeys(updateParams);
        this._resultModalOpen(
          this.labels.id_key_edit_result_label,
          this.editModalValues.listDesc,
          this.editModalValues.listVal,
          res['responses'],
          () => {
            this._reloadList();
          }
        );
      },
    });
  }

  /**
   * 一括解除ボタン押下コールバック
   *
   * 確認モーダルを表示し、確認後に変更APIをリクエストする。
   * リクエスト成功時にアラートメッセージを表示し、一覧を初期化する。
   */
  onClickAllUnlink(): void {
    this.unlinkIdKeys(this.selectedList);
  }

  /**
   * 解除ボタン押下コールバック
   *
   * 確認モーダルを表示し、確認後に変更APIをリクエストする。
   * リクエスト成功時にアラートメッセージを表示し、一覧を初期化する。
   *
   * @param id_key_code IDキー番号
   */
  onClickUnlink(idKeyCode: string): void {
    // 履歴なしの場合は何もしない
    if (this.disableUnlinks[idKeyCode]) {
      return;
    }
    this.unlinkIdKeys([idKeyCode]);
  }

  /**
   * 一括ダウンロードボタン押下コールバック
   */
  onClickAllDownload(event): void {
    this.downloadPopoverVisible = !this.downloadPopoverVisible;
  }

  /**
   * ダウンロードポップアップの OK ボタン押下時の処理
   * @param event.fields ダウンロード対象項目
   * @param event.fileType ダウンロード形式
   */
  async onDownloadOk(event) {
    await this.api.updateField(
      FunctionCode.idKeyListDownloadFunction,
      event.fields
    );
    await this._downloadTemplate(event.fields.map(f => f.path), event.fileType);
  }

  /**
   * 入力リセットボタン押下コールバック
   *
   * 確認モーダルを表示し、確認後にフォームの内容を初期化する。
   *
   * @param f フォーム
   */
  onClickReset(f: NgForm) {
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      closeBtnLabel: this.labels.cancel,
      ok: () => this._resetForm(f),
    });
  }

  /**
   * スクロール時のコールバック
   * @param scrollObj スクロール情報 { top, left, width, height }
   */
  onScroll(scrollObj: object): void {
    const completerDropdown = document.querySelector('.completer-dropdown');
    if (completerDropdown) {
      completerDropdown.classList.add('hidden');
    }
    this.scrollAmount = scrollObj;
  }

  /**
   * オペレータコードが変更された場合
   * @param operator_code オペレータコード
   */
  changeOperatorCode(operator_code: string, f: NgForm, idx: number): void {
    this.isEditting = true;

    this.lists.visibleList[idx][
      'id_keys.current_operator.code'
    ] = operator_code;
    if (
      (this.isChecked(this.lists.visibleList[idx]['id_keys.code']) &&
        _.includes(this.seletecOperatorCodeItemList, operator_code)) ||
      _.isEmpty(operator_code)
    ) {
      f.form.controls[`hidden-operator-code-${idx}`].markAsDirty();
      this.setOperatorLabel(
        operator_code,
        'id_keys.current_operator.current_label.label',
        idx
      );
      this.isEditting = false;
    }
  }

  /**
   * オペレータ名が変更された場合
   * @param operator_label オペレータ名
   */
  changeOperatorLabel(operator_label: string, f: NgForm, idx: number): void {
    this.isEditting = true;
    this.lists.visibleList[idx][
      'id_keys.current_operator.current_label.label'
    ] = operator_label;
    if (
      (this.isChecked(this.lists.visibleList[idx]['id_keys.code']) &&
        _.includes(this.seletecOperatorLabelItemList, operator_label)) ||
      _.isEmpty(operator_label)
    ) {
      f.form.controls[`hidden-operator-label-${idx}`].markAsDirty();
      this.setOperatorCode(
        operator_label,
        'id_keys.current_operator.code',
        idx
      );
      this.isEditting = false;
    }
  }

  /**
   * オペレータコードに対応するオペレータ名を設定します。
   * @param operator_code オペレータコード
   * @param name プロパティ名
   * @param idx インデックス
   */
  setOperatorLabel(operator_code: string, name: string, idx: number): void {
    if (_.isEmpty(operator_code)) {
      this.lists.visibleList[idx][name] = '';
      return;
    }

    this.lists.visibleList[idx][name] = _.find(this.operators, operator => {
      return operator['operator_code'] === operator_code;
    })['operator_label'];
  }

  /**
   * オペレータ名に対応するオペレータコードを設定します。
   * @param operator_label オペレータ名
   * @param name プロパティ名
   * @param idx インデックス
   */
  setOperatorCode(operator_label: string, name: string, idx: number): void {
    if (_.isEmpty(operator_label)) {
      return;
    }
    this.lists.visibleList[idx][name] = _.find(this.operators, operator => {
      return operator['operator_label'] === operator_label;
    })['operator_code'];
  }

  /**
   * 該当行がチェックされているかを返却します。
   * @param idKeyCode IDキー番号
   * @return true: チェック済/ false: 未チェック
   */
  isChecked(idKeyCode: string): boolean {
    return _.includes(this.selectedList, idKeyCode);
  }

  /**
   * IDキーの解除処理
   * @param idKeyCodes IDキー番号
   */
  async unlinkIdKeys(idKeyCodes: string[]): Promise<void> {
    if (this.unlinkModalValues == null) {
      this._showLoadingSpinner();
      await this.unlinkModalPromise;
      this._hideLoadingSpinner();
    }

    this.unlinkModalValues.listVal = this._formatList(
      await this._getIdKeys(
        idKeyCodes,
        this.unlinkModalValues.requestHeaderParams
      ),
      this.unlinkModalValues.listDesc
    );

    this._openUnlinkConfirmModal(this.unlinkModalValues.listVal);
  }

  /**
   * テーブルに表示するデータを取得
   */
  async fetchList(sort_key?: string): Promise<void> {
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    this.isFetching = true;
    const res = await this.operatorService.fetchIdKeyIndexList(
      this.searchParams,
      this.requestHeaderParams
    );
    const formatted = this._formatList(res.result_data.id_keys, this.thList);
    this._setDisables(res.result_data.id_keys);
    this._fillLists(res.result_header, formatted);
    this._createOperatorsList();
    this.safeDetectChanges();
    this.fetchTimeOut = setTimeout(() => {
      this.isFetching = false;
      this._afterFetchList();
    }, this.searchDebounceTime);
  }

  /**
   * オペレータIDがIDキー形式であるかを判定する
   */
  checkIsIdKeyDisabled(operatorId?: string) {
    return operatorId == null;
  }

  /**
   * リストを整形する
   * @override
   */
  protected _formatList(listBody: any[], thList: any[]) {
    const hideOperatorIdKeyList = listBody.map(item => ({
      ...item,
      current_operator: {
        ...item.current_operator,
        code:
          item.current_operator.code == null ||
            this.checkIsIdKeyDisabled(item.current_operator.code)
            ? ''
            : item.current_operator.code,
      },
    }));

    return super._formatList(hideOperatorIdKeyList, thList);
  }

  /**
   * テーブルの初期化に必要なデータを取得
   */
  protected async _fetchDataForInitialize(): Promise<void> {
    const res = await this.operatorService.fetchIdKeyInitData();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this._reflectXFields(res.fields);
    this.thList = this._createThList(res.fields);
    this.operatorXFields = this._createXFields(res.operatorXFields);
    if (!this.resource.operator_label && !this.resource.customer_id) {
      this.collapsed = true;
    }
    this.sortableThList = this.sortableThLists(this.thList);
    this.displayableThList = this.displayableThLists(this.thList);
  }

  protected _afterInitFetchList() {
    this.unlinkModalPromise = this._buildUnlinkModalValues();
    this.editModalPromise = this._buildEditModalValues();
  }
  /**
   * データ取得後、リストにデータを挿入します。
   * @param resultHeader API のレスポンスヘッダ
   * @param resultData API のレスポンスデータ
   */
  protected _fillLists(resultHeader: any, resultData: any): void {
    super._fillLists(resultHeader, resultData);
    this.initList = _.cloneDeep(this.lists.originList);
  }

  /**
   * 画面上のボタン（履歴・解除）の有効・無効状態をセットする
   * @param idKeys IDキー情報
   */
  private _setDisables(idKeys): void {
    idKeys.forEach(idKey => {
      this.disableUnlinks[idKey.code] = this.checkIsIdKeyDisabled(
        idKey.current_operator.code
      );
    });
  }

  /**
   * 各確認モーダル表示用にオペレータ情報を取得する
   * @param idKeyCodes IDキー番号
   * @param requestHeaderParams リクエストヘッダ情報
   */
  private async _getIdKeys(
    idKeyCodes: string[],
    requestHeaderParams: RequestHeaderParams
  ) {
    const res = await this.operatorService.fetchIdKeyIndexList(
      this.searchParams,
      _.merge({}, this.requestHeaderParams, requestHeaderParams, {
        'X-From': null,
        'X-Count': null,
      })
    );
    return this._reduceIdKeys(res.result_data.id_keys, idKeyCodes);
  }

  /**
   * 履歴モーダルの表示値を作成
   * @param idKey IDキー情報
   */
  private _createHistoryModalListVal(idKey) {
    return _.map(idKey.operator_histories, h =>
      _.reduce(
        ['code', 'current_label.label', 'start_datetime'],
        (result, label) => {
          if (label === 'start_datetime') {
            result[`id_keys.operator_histories.${label}`] = `${this.dateFormat(
              h.start_datetime
            )} 〜 ${this.dateFormat(h.end_datetime)}`;
          } else {
            result[`id_keys.operator_histories.${label}`] = _.get(h, label);
          }
          return result;
        },
        {}
      )
    );
  }

  /**
   * 確認モーダルに表示する値の取得
   * @param idKeyCodes IDキー番号
   */
  private async _createEditListVal(idKeyCodes: string[]) {
    const idKeys = this._formatList(
      await this._getIdKeys(
        idKeyCodes,
        this.editModalValues.requestHeaderParams
      ),
      this.editModalValues.listDesc
    );
    const list = this.lists.visibleList;

    return idKeys.map(idKey => {
      const index = _.findIndex(
        list,
        row => row[this.checkIdName] === idKey[this.checkIdName]
      );
      idKey['id_keys.current_operator.code'] =
        list[index]['id_keys.current_operator.code'];
      idKey['id_keys.current_operator.current_label.label'] =
        list[index]['id_keys.current_operator.current_label.label'];
      return idKey;
    });
  }

  /**
   * オペレータ情報取得のリクエストヘッダーを設定します。
   */
  private setOperatorRequestHeader(): void {
    this.operatorRequestHeaderParams['X-Fields'] = _.join(
      this.operatorXFields,
      ','
    );
    this.operatorRequestHeaderParams['X-From'] = 1;
    this.operatorRequestHeaderParams['X-Count'] = 0;
  }

  /**
   * 解除確認モーダルを開きます.
   */
  private _openUnlinkConfirmModal(list: object[]): void {
    const unlinkParams = this._createUpdateParams(
      list,
      this.searchParams['customer_id'],
      ''
    );

    this.modalService.open({
      title: this.labels.unlink_modal_body,
      labels: this.labels,
      content: this.unlinkModalContent,
      okBtnLabel: this.labels.unlink_btn,
      okBtnClass: 'btn-unlink',
      closeBtnLabel: this.labels.cancel,
      ok: async () => {
        const res = await this.operatorService.unlinkIdKeys(unlinkParams);
        this._resultModalOpen(
          this.labels.unlink_result_label,
          this.unlinkModalValues.listDesc,
          this.unlinkModalValues.listVal,
          res['responses'],
          () => {
            this._reloadList();
          }
        );
      },
    });
  }

  /**
   * リストを再読み込みする
   */
  private _reloadList() {
    this.pageParams.pageNo = 1;
    this.pageParams.dispPageNo = 1;
    this._reflectPageParams();
    this.fetchList(this.sortingParams['sort']);
    this.checkedItems = {};
  }

  /**
   * IDキーとオペレータの連結情報更新APIのリクエストパラメータを作成
   * @param list IDキー情報のリスト
   * @param customerId 顧客ID
   * @param operaorCode オペレータID
   */
  private _createUpdateParams(
    list: object[],
    customerId: string,
    operaorCode: string = null
  ): UpdateParams {
    return {
      customer_id: customerId,
      id_keys: _.map(list, listItem => ({
        code: listItem['id_keys.code'],
        current_operator: {
          code: _.isNull(operaorCode)
            ? listItem['id_keys.current_operator.code']
            : operaorCode,
        },
        update_datetime: listItem['id_keys.update_datetime'],
      })),
    };
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
   * オペレータの対応表を作成します
   */
  private _createOperatorsList(): void {
    this.setOperatorRequestHeader();
    this.operatorGetparams['customer_id'] = this.searchParams['customer_id'];
    this.operatorService
      .fetchIndexList(this.operatorGetparams, this.operatorRequestHeaderParams)
      .then((res: any) => {
        this.operators = this._operatorFormatData(res.result_data.operators);
        this.seletecOperatorCodeItemList = _.map(
          this.operators,
          'operator_code'
        ).filter(Boolean);
        this.seletecOperatorLabelItemList = _.map(
          this.operators,
          'operator_label'
        ).filter(Boolean);
      });
  }

  /**
   * オペレータ入力欄初期化
   */
  private _setInitialOperators(): void {
    this.lists.visibleList = _.cloneDeep(this.initList);
    this.checkedItems = {};
    this.safeDetectChanges();
  }

  /**
   * フォームのリセット
   *
   * @param f フォーム
   */
  private _resetForm(f: NgForm): void {
    this._setInitialOperators();
    f.form.markAsPristine();
  }

  /**
   * テンプレートダウンロード
   * @param fields ダウンロード対象項目
   * @param accept ダウンロード形式
   */
  private async _downloadTemplate(fields, accept) {
    const header = _.clone(this.requestHeaderParams);
    header['X-Sort'] = this.sortingParams['sort'];
    header['X-Fields'] = fields;
    header['X-Count'] = null;
    header['X-From'] = null;

    this._showLoadingSpinner();

    try {
      const res: any = await this.operatorService.createFile(
        Apis.getOperatorsIdKeysFileCreate,
        {
          ...this.searchParams,
          file_content_type: accept,
          processing_type: ProcessingType.sync,
        },
        header
      );
      await this.api.downloadFile(res.result_data.file_id, accept);
    } finally {
      this._hideLoadingSpinner();
    }
  }

  /**
   * IDキー情報をIDキー番号で絞り込む
   * @param idKeys IDキー情報
   * @param idKeyCodes IDキー番号
   */
  private _reduceIdKeys(idKeys, idKeyCodes: string[]) {
    return _.filter(idKeys, idKey => _.includes(idKeyCodes, idKey.code));
  }

  /**
   * 解除モーダル用ヘッダ項目生成
   */
  private _buildUnlinkModalValues() {
    return new Promise<void>(async (resolve) => {
      const res = await this.operatorService.fetchIdKeyIndexUnlinkFields();
      this.unlinkModalValues = this._getModalValues(res, null, {
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
      const res = await this.operatorService.fetchIdKeyIndexEditFields();
      this.editModalValues = this._getModalValues(res, null, {
        noOptionTableColumn: true,
      });
      resolve();
    });
  }
}
