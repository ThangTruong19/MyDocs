import {
  Component,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import {
  ApproveRejectParams,
  ApproveRejectListData,
} from '../../../../types/flm/service-contract';
import {
  ModalValues,
  Fields,
  TableHeader,
  Labels,
} from '../../../../types/common';
import { DatePickerParams } from '../../../../types/calendar';

import { ServiceContractRequestStatus } from '../../../../constants/flm/service-contract';
import { DateFormat } from '../../../../constants/date-format';

import { KbaAbstractIndexComponent } from '../../../shared/kba-abstract-component/kba-abstract-index-component';
import { KbaTableComponent } from '../../../shared/kba-table/kba-table.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaDatePickerService } from '../../../../services/shared/kba-date-picker.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ServiceContractService } from '../../../../services/flm/service-contract/service-contract.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

@Component({
  selector: 'app-service-contract-approve-reject',
  templateUrl: './service-contract-approve-reject.component.html',
  styleUrls: ['./service-contract-approve-reject.component.scss'],
})
export class ServiceContractApproveRejectComponent extends KbaAbstractIndexComponent {
  @ViewChild(KbaTableComponent, { static: false })
  kbaTableComponent: KbaTableComponent;
  @ViewChild('rejectConfirmContent', { static: false })
  rejectConfirmContent: TemplateRef<null>;
  @ViewChild('approveConfirmContent', { static: false })
  approveConfirmContent: TemplateRef<null>;

  initParams: ApproveRejectParams = {
    service_contract_request_status: '',
  };

  // 承認モーダル
  approveModalValues: ModalValues;

  // 却下モーダル
  rejectModalValues: ModalValues;

  listCollapsed = true;
  fields: Fields;
  fieldSelectPopoverVisible = false;
  fixedThList: TableHeader[];
  scrollableThList: TableHeader[];
  initList: ApproveRejectListData[] = [];
  checkAll = false;
  checkIdName = 'service_contract_requests.id';
  datePickerParams: DatePickerParams;
  _dateFormat = '';
  timeZone = '';
  enableDateRange: string[] = [];
  beginningWday: number;
  excludeSearchParams: string[] = [
    'receive_date_from_formatted',
    'receive_date_to_formatted',
  ];
  commentedCarsCountMessage: string;
  datePickerLabels: Labels;
  checkedItems: { [key: string]: boolean } = {};

  approveModalPromise: Promise<void>;
  rejectModalPromise: Promise<void>;

  get selectedList() {
    return _.map(this.checkedItems, (value, key) =>
      value ? key : null
    ).filter(Boolean);
  }

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    router: Router,
    header: CommonHeaderService,
    modalService: KbaModalService,
    private serviceContractService: ServiceContractService,
    ref: ChangeDetectorRef,
    private datePickerService: KbaDatePickerService,
    private userSettingService: UserSettingService
  ) {
    super(navigationService, title, router, ref, header, modalService);
  }

  /**
   * テーブルに表示するデータを取得
   */
  async fetchList(sort_key?: string) {
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    this.isFetching = true;
    const searchParams: ApproveRejectParams = _.omit(
      this.searchParams,
      this.excludeSearchParams
    );
    const res = await this.serviceContractService.fetchApproveRejectList(
      searchParams,
      this.requestHeaderParams
    );
    const formatted = this._formatList(
      res.result_data.service_contract_requests,
      this.thList
    );
    this._fillLists(res.result_header, formatted);
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * 検索ボタン押下時の処理
   */
  onClickSearch() {
    super.onClickSearch();
    this.fetchList(this.sortingParams['sort']);
    this.checkedItems = {};
  }

  /**
   * 該当行がチェックされているかを返す
   * @param id サービス委託申請ID
   * @return true: チェック済/ false: 未チェック
   */
  isChecked(id: string): boolean {
    return _.includes(this.selectedList, id);
  }

  /**
   * 承認却下ボタン押下時の処理
   */
  async onClickReject() {
    if (this.rejectModalValues == null) {
      this._showLoadingSpinner();
      await this.rejectModalPromise;
      this._hideLoadingSpinner();
    }

    const res = await this.serviceContractService.fetchApproveRejectList(
      _.omit(this.searchParams, this.excludeSearchParams),
      this.rejectModalValues.requestHeaderParams
    );
    this.rejectModalValues.listVal = _.filter(
      this._formatList(
        res.result_data.service_contract_requests,
        this.rejectModalValues.listDesc
      ),
      list => this.isChecked(list[this.checkIdName])
    );
    this._openRejectConfirmModal();
  }

  /**
   * 承認ボタン押下時の処理
   */
  async onClickApprove() {
    if (this.approveModalPromise == null) {
      this._showLoadingSpinner();
      await this.approveModalPromise;
      this._hideLoadingSpinner();
    }

    const res = await this.serviceContractService.fetchApproveRejectList(
      _.omit(this.searchParams, this.excludeSearchParams),
      this.approveModalValues.requestHeaderParams
    );
    this.approveModalValues.listVal = _.filter(
      this._formatList(
        res.result_data.service_contract_requests,
        this.approveModalValues.listDesc
      ),
      list => this.isChecked(list[this.checkIdName])
    );
    this._openApproveConfirmModal();
  }

  /**
   * チェックボックスを非表示にするかどうかを返す
   * @param data 選択したデータ
   * @return true:非表示にする/false:非表示にしない
   */
  checkBoxHidden(data: ApproveRejectListData[]): boolean {
    return (
      data['service_contract_requests.status'] !==
      ServiceContractRequestStatus.unapproved
    );
  }

  /**
   * テーブルの初期化に必要なデータを取得
   */
  protected async _fetchDataForInitialize() {
    const res = await this.serviceContractService.fetchApproveRejectInitData();
    this.initialize(res);
    this.params = _.cloneDeep(this.initParams);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this._datePickerInitialize();
    this._updateFields(res.fields);
  }

  protected _afterInitFetchList() {
    this.approveModalPromise = this._buildApproveFields();
    this.rejectModalPromise = this._buildRejectFields();
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
   * 指定項目取得 API の結果を反映
   * @param fields 指定項目
   */
  private _updateFields(fields: Fields) {
    this.fields = fields;
    this.thList = this._createThList(fields);
    const xFields = this._createXFields(fields);
    this.sortableThList = this.sortableThLists(this.thList);
    this._setXFields(xFields);
    const thLists = this._createThList(fields, { scrollable: true });
    this.fixedThList = thLists.fixed;
    this.scrollableThList = thLists.scrollable;
  }

  /**
   * コメント付きの車両数を計算する
   * @param data: 対象データ
   */
  private _countCommentedCar(data: ApproveRejectListData[]) {
    const carsCount = _.filter(
      data,
      item => item['service_contract_requests.free_memo'] != null
    ).length;
    const compiled = _.template(this.labels.commented_cars_count_message);
    this.commentedCarsCountMessage =
      carsCount > 0 ? compiled({ count: String(carsCount) }) : null;
  }

  /**
   * 承認確認モーダルを開く
   */
  private _openApproveConfirmModal() {
    this._countCommentedCar(this.approveModalValues.listVal);
    this.modalService.open(
      {
        title: this.labels.approve_modal_body,
        labels: this.labels,
        content: this.approveConfirmContent,
        okBtnLabel: this.labels.modal_approve_btn,
        closeBtnLabel: this.labels.cancel,
        ok: () => {
          this._showLoadingSpinner();
          this._openResultModal(
            this.approveModalValues,
            ServiceContractRequestStatus.approved,
            'approve'
          );
        },
      },
      { size: 'lg' }
    );
  }

  /**
   * 却下確認モーダルを開く
   */
  private _openRejectConfirmModal() {
    this._countCommentedCar(this.rejectModalValues.listVal);
    this.modalService.open(
      {
        title: this.labels.reject_modal_body,
        labels: this.labels,
        content: this.rejectConfirmContent,
        okBtnLabel: this.labels.reject_btn,
        okBtnClass: 'btn-delete',
        closeBtnLabel: this.labels.cancel,
        ok: () => {
          this._showLoadingSpinner();
          this._openResultModal(
            this.rejectModalValues,
            ServiceContractRequestStatus.rejected,
            'reject'
          );
        },
      },
      { size: 'lg' }
    );
  }

  /**
   * デートピッカーの初期化
   */
  private async _datePickerInitialize(): Promise<any> {
    const datePickerConfig = this.userSettingService.getDatePickerConfig();
    this.beginningWday = datePickerConfig.first_day_of_week_kind;
    const _window = window as any;
    this.enableDateRange = _window.settings.datePickerRange.other;
    this._dateFormat = datePickerConfig.date_format_code;
    this.timeZone = datePickerConfig.time_difference;

    this.datePickerParams = {
      timeZone: this.timeZone,
      dateFormat: this._dateFormat,
    };

    this.datePickerService.initialize(this.datePickerParams);

    const today = this.datePickerService.toMoment();

    _.set(
      this.params,
      'receive_date_from',
      today
        .clone()
        .subtract(1, 'month')
        .format(DateFormat.hyphen)
    );
    _.set(
      this.params,
      'receive_date_from_formatted',
      today
        .clone()
        .subtract(1, 'month')
        .format(this.datePickerService.inputDateFormat(this._dateFormat))
    );
    _.set(this.params, 'receive_date_to', today.format(DateFormat.hyphen));
    _.set(
      this.params,
      'receive_date_to_formatted',
      today.format(this.datePickerService.inputDateFormat(this._dateFormat))
    );
  }

  /**
   * サービス受託承認却下API用のパラメータを作成
   * @param services 対象のサービス情報
   * @param status 申請状態
   */
  private _createConsigneeParams(
    services: ApproveRejectListData[],
    status: string
  ) {
    const paths = ['id', 'car.car_identification.update_datetime'];
    return {
      service_contract_requests: services.map(item => {
        const params = { status };
        paths.forEach(path =>
          _.set(params, path, item['service_contract_requests.' + path])
        );
        return params;
      }),
    };
  }

  /**
   * サービス受託の承認・却下処理
   * @param modalValues 確認モーダルで表示したデータ
   * @param status 申請状態
   * @param caller 呼び出し元
   */
  private async _openResultModal(
    modalValues: ModalValues,
    status: string,
    caller: string
  ) {
    const params = this._createConsigneeParams(modalValues.listVal, status);
    const res = await this.serviceContractService.updateConsignee(params);
    this._hideLoadingSpinner();
    this._resultModalOpen(
      caller === 'approve'
        ? this.labels.approve_result_label
        : this.labels.reject_result_label,
      modalValues.listDesc,
      modalValues.listVal,
      res['responses'],
      () => this._refreshList(),
      { size: 'lg' }
    );
  }

  /**
   * 承認・却下後にリストを更新する
   */
  private _refreshList() {
    this.checkedItems = {};
    this.pageParams.pageNo = 1;
    this.pageParams.dispPageNo = 1;
    this.fetchList();
  }

  /**
   * 承認モーダル用ヘッダ項目を生成
   */
  private _buildApproveFields() {
    return new Promise<void>(async (resolve) => {
      const res = await this.serviceContractService.fetchApproveFields();
      this.approveModalValues = this._getModalValues(res);
      resolve();
    });
  }

  /**
   * 却下モーダル用指定項目を生成
   */
  private _buildRejectFields() {
    return new Promise<void>(async (resolve) => {
      const res = await this.serviceContractService.fetchRejectFields();
      this.rejectModalValues = this._getModalValues(res);
      resolve();
    });
  }
}
