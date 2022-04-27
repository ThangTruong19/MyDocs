import * as _ from 'lodash';
import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  TemplateRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { Api, Fields } from '../../../../types/common';
import { TableHeader, ModalValues } from '../../../../types/common';
import { RequestHeaderParams } from '../../../../types/request';
import {
  CustomerIndexParams,
  CustomerParams,
} from '../../../../types/flm/customer';

import { FunctionCode } from '../../../../constants/flm/function-codes/customer-management';
import { CommonState } from '../../../../constants/common-state';
import { KbaMimeType } from '../../../../constants/mime-types';
import { ProcessingType } from '../../../../constants/download';

import { KbaSelectedComponent } from '../../../shared/kba-selected/kba-selected.component';
import { KbaAbstractIndexComponent } from '../../../shared/kba-abstract-component/kba-abstract-index-component';

import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CustomerService } from '../../../../services/flm/customer/customer.service';
import { ApiService } from '../../../../services/api/api.service';

@Component({
  selector: 'app-customer-index',
  templateUrl: './customer-index.component.html',
  providers: [CustomerService, KbaModalService],
})
export class CustomerIndexComponent extends KbaAbstractIndexComponent
  implements OnInit {
  @ViewChild('deleteModalContent', { static: false })
  deleteModalContent: TemplateRef<null>;

  params: CustomerIndexParams;
  template: 'list' | 'detail' = 'list';
  fields: Fields;
  detailValues: ModalValues;
  deleteModalValues: ModalValues;
  fieldSelectPopoverVisible = false;
  carListFields: Fields;
  downloadFields: Fields;

  detailPromise: Promise<void>;
  deleteModalPromise: Promise<void>;
  carListPromise: Promise<void>;
  fieldResourcesPromise: Promise<void>;
  downloadFieldsPromise: Promise<void>;

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    private customerService: CustomerService,
    private api: ApiService,
    protected modalService: KbaModalService,
    private alertService: KbaAlertService
  ) {
    super(navigationService, title, router, ref, header);
  }

  /**
   * 現在のパラメータを一覧取得APIに引き渡し、一覧画面に表示するリストを取得する
   * @param sort_key ソートキー
   */
  async fetchList(sort_key?: string) {
    this.isFetching = true;
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    const res = await this.customerService.fetchIndexList(
      this.searchParams,
      this.requestHeaderParams
    );
    const list = this._formatList(res.result_data.customers, this.thList);
    this._fillLists(res.result_header, list);
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * 削除処理
   * @param item 削除対象
   */
  async onClickDelete(item) {
    if (this.deleteModalValues == null) {
      this._showLoadingSpinner();
      await this.deleteModalPromise;
      this._hideLoadingSpinner();
    }

    const res = await this._getCustomerDetailValues(
      item['customers.identification.id'],
      this.deleteModalValues
    );
    this.deleteModalValues.listVal = res.listVal;
    this.modalService.open({
      title: this.labels.delete_modal_title,
      labels: this.labels,
      content: this.deleteModalContent,
      okBtnLabel: this.labels.delete,
      okBtnClass: 'btn-delete',
      ok: () => this._delete(res.id, res.updateDatetime),
    });
  }

  /**
   * 検索ボタン押下時の処理
   * 現在のパラメータを更新してリストを取得する
   */
  onClickSearch(): void {
    super.onClickSearch();
    this.fetchList(this.sortingParams['sort']);
  }

  /**
   * 変更画面遷移
   * @param item 変更対象
   */
  onClickEdit(item): void {
    this.router.navigateByUrl(
      `/customers/${item['customers.identification.id']}/edit`
    );
  }

  /**
   * 表示項目設定ボタン押下時の処理
   * @param event イベント
   */
  onClickFieldSelect(event): void {
    this.fieldSelectPopoverVisible = !this.fieldSelectPopoverVisible;
  }

  /**
   * 更新用テンプレート一括DLボタン押下時の処理
   */
  async onClickDownloadTemplate(): Promise<void> {
    if (this.downloadFields == null) {
      this._showLoadingSpinner();
      await this.downloadFieldsPromise;
    }

    const params = {
      ...this.searchParams,
      file_content_type: KbaMimeType.excel,
      processing_type: ProcessingType.sync,
    };
    const header = _.cloneDeep(this.requestHeaderParams);
    header['X-Sort'] = this.sortingParams['sort'];
    header['X-Fields'] = this._createXFields(this.downloadFields);

    this._showLoadingSpinner();
    try {
      const res = await this.customerService.createFile(params, header);
      await this.api.downloadFile(res.result_data.file_id, KbaMimeType.excel);
    } finally {
      this._hideLoadingSpinner();
    }
  }

  /**
   * 表示項目設定 OK ボタン押下時の処理
   * @param event イベント
   */
  async onFieldSelectOk(event) {
    await this.api.updateField(FunctionCode.listFunction, event.fields);
    const res = await new Promise(resolve =>
      this.api
        .fetchFields(FunctionCode.listFunction)
        .subscribe(_res => resolve(_res))
    );
    this._updateFields(res);
    this.fetchList(this.sortingParams['sort']);
  }

  /**
   * 詳細アイコン押下時の処理
   * @param item 詳細画面表示対象
   */
  async onClickDetail(item) {
    if (this.detailValues == null || this.carListFields == null) {
      this._showLoadingSpinner();
      await this.detailPromise;
      this._hideLoadingSpinner();
    }

    const res = await this._getCustomerDetailValues(
      item['customers.identification.id'],
      this.detailValues
    );
    this.detailValues.listVal = res.listVal;
    this.template = 'detail';
  }

  /**
   * 詳細画面の戻るボタン押下時の処理
   */
  onClickBack(): void {
    this.template = 'list';
    this._updateFields(this.fields);
    this.fetchList();
  }

  /**
   * 初期化 API を呼ぶ
   */
  protected async _fetchDataForInitialize() {
    // 通常の初期化処理
    const res = await this.customerService.fetchIndexInitData();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this.updatable = res.updatable;
    this.deletable = res.deletable;
    this._updateFields(res.fields);
  }

  protected _afterInitFetchList() {
    // 非同期処理
    this.detailPromise = this._buildDetailValues();
    this.deleteModalPromise = this._buildDeleteModalValues();
    this.carListPromise = this._buildCarListFields();
    this.downloadFieldsPromise = this._buildDownloadFields();
    this.fieldResourcesPromise = this._buildFieldResources();
  }

  /**
   * 指定項目を更新
   * @param fields 指定項目
   */
  private _updateFields(fields): void {
    this.fields = fields;
    this.thList = this._createThList(fields);
    this.sortableThList = this.sortableThLists(this.thList);
    this._reflectXFields(fields);
  }

  /**
   * モーダル用の情報を取得する
   * @param fields モーダル用の指定項目
   */
  private _getModalDetailValues(fields): ModalValues {
    return {
      requestHeaderParams: {
        'X-Fields': this._createXFields(fields),
      },
      listDesc: this._createThList(fields),
      listVal: {},
    };
  }

  /**
   * 顧客の詳細情報を取得する
   * @param id 顧客ID
   * @param values モーダルデータ
   */
  private async _getCustomerDetailValues(id: string, values: ModalValues) {
    const res = await this.customerService.fetchCustomerDetail(
      id,
      values.requestHeaderParams
    );
    return {
      listVal: this._formatList([res.result_data.customer], values.listDesc)[0],
      id: res.result_data.customer.identification.id,
      updateDatetime: res.result_data.customer.identification.update_datetime,
    };
  }

  /**
   * 削除 API を呼ぶ
   * @param id 削除対象顧客ID
   * @param update_datetime 更新日時
   */
  private async _delete(id: string, update_datetime: string) {
    const res = await this.customerService.deleteCustomer(id, update_datetime);
    this.fetchList(this.sortingParams['sort']);
    this.alertService.show(this.labels.finish_message);
  }

  /**
   * 詳細画面のヘッダを生成する
   */
   private _buildDetailValues() {
    return new Promise<void>(async (resolve) => {
      const res = await this.customerService.fetchIndexDetailFields();
      this.detailValues = this._getModalDetailValues(res);
      resolve();
    });
  }

  /**
   * 削除モーダルのヘッダを生成する
   */
  private _buildDeleteModalValues() {
    return new Promise<void>(async (resolve) => {
      const res = await this.customerService.fetchIndexDeleteFields();
      this.deleteModalValues = this._getModalDetailValues(res);
      resolve();
    });
  }

  /**
   * 車両一覧の指定項目を生成する
   */
  private _buildCarListFields() {
    return new Promise<void>(async (resolve) => {
      const res = await this.customerService.fetchCarListFields();
      this.carListFields = res;
      resolve();
    });
  }

  /**
   * 指定項目リソースを生成する
   */
  private _buildFieldResources() {
    return new Promise<void>(async (resolve) => {
      const res = await this.customerService.fetchIndexFieldResources();
      this.fieldResources = res;
      resolve();
    });
  }

  /**
   * 指定項目リソースを生成する
   */
  private _buildDownloadFields() {
    return new Promise<void>(async (resolve) => {
      const res = await this.customerService.fetchIndexDownloadFields();
      this.downloadFields = res;
      resolve();
    });
  }
}
