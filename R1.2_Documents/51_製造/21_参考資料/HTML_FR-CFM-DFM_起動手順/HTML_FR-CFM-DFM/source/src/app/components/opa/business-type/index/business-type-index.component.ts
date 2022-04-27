import * as _ from 'lodash';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { ModalValues, Fields } from '../../../../types/common';
import {
  BusinessTypeIndexParams,
  BusinessTypeFileCreateParams,
} from '../../../../types/opa/business-type';

import { ProcessingType } from '../../../../constants/download';
import { KbaMimeType } from '../../../../constants/mime-types';

import { KbaAbstractIndexComponent } from '../../../shared/kba-abstract-component/kba-abstract-index-component';

import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { BusinessTypeService } from '../../../../services/opa//business-type/business-type.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

@Component({
  selector: 'app-business-type-index',
  templateUrl: './business-type-index.component.html',
  providers: [BusinessTypeService, KbaModalService],
})
export class BusinessTypeIndexComponent extends KbaAbstractIndexComponent
  implements OnInit {
  @ViewChild('deleteModalContent', { static: false })
  deleteModalContent: TemplateRef<null>;

  params: BusinessTypeIndexParams;
  fields: Fields;
  deleteModalValues: ModalValues;
  downloadFields: string[];

  deleteModalPromise: Promise<void>;
  downloadFieldsPromise: Promise<void>;

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    private businessTypeService: BusinessTypeService,
    private api: ApiService,
    protected modalService: KbaModalService,
    private alertService: KbaAlertService,
    private userSettingService: UserSettingService
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
    const res = await this.businessTypeService.fetchIndexList(
      this.searchParams,
      this.requestHeaderParams
    );
    const list = this._formatList(res.result_data.business_types, this.thList);
    this._fillLists(res.result_header, list);
    this.isFetching = false;
    this._afterFetchList();
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
    this.router.navigate(['business_types', item['business_types.id'], 'edit']);
  }

  /**
   * 一括ダウンロードボタン押下時の処理
   */
  async onClickDownloadTemplate(): Promise<void> {
    this._showLoadingSpinner();

    if (this.downloadFields == null) {
      await this.downloadFieldsPromise;
    }

    const params: BusinessTypeFileCreateParams = {
      ...this.searchParams,
      file_content_type: KbaMimeType.excel,
      processing_type: ProcessingType.sync,
    };
    const header = _.cloneDeep(this.requestHeaderParams);
    header['X-Sort'] = this.sortingParams['sort'];
    header['X-Fields'] = this.downloadFields;

    try {
      const res = await this.businessTypeService.createFile(params, header);
      await this.api.downloadFile(res.result_data.file_id, KbaMimeType.excel);
    } finally {
      this._hideLoadingSpinner();
    }
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

    const res = await this._getBusinessTypeDetailValues(
      item['business_types.id'],
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
   * 初期化 API を呼ぶ
   */
  protected async _fetchDataForInitialize() {
    const res = await this.businessTypeService.fetchIndexInitData();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this.updatable = res.updatable;
    this.deletable = res.deletable;
    this._updateFields(res.fields);
    this._setTitle();
  }

  protected _afterInitFetchList() {
    this.deleteModalPromise = this._buildDeleteModalValues();
    this.downloadFieldsPromise = this._buildDownloadFields();
  }

  /**
   * モーダルのデータを作成する追加処理
   * @param data 行データ
   */
  protected _formatListAdditional(data) {
    if (_.has(data, 'item_names')) {
      data['item_names'] = {
        label: data.item_names[0].label,
      };
    }
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
   *  業種の詳細情報を取得する
   * @param id  業種ID
   * @param values モーダルデータ
   */
  private async _getBusinessTypeDetailValues(id: string, values: ModalValues) {
    const res = await this.businessTypeService.fetchBusinessTypeDetail(
      id,
      values.requestHeaderParams
    );

    // X-Langと一致する言語の業種名称を削除モーダルに表示する
    const filtered = res.result_data.business_type.item_names.filter(
      (itemName) => itemName.lang_code === this.userSettingService.getLang()
    );

    if (filtered.length > 0) {
      res.result_data.business_type.item_names = filtered;
    }

    return {
      listVal: this._formatList(
        [res.result_data.business_type],
        values.listDesc
      )[0],
      id: res.result_data.business_type.id,
      updateDatetime: res.result_data.business_type.update_datetime,
    };
  }

  /**
   * 削除 API を呼ぶ
   * @param id 削除対象 業種ID
   * @param update_datetime 更新日時
   */
  private async _delete(id: string, update_datetime: string) {
    await this.businessTypeService.deleteBusinessType(id, update_datetime);
    this.fetchList(this.sortingParams['sort']);
    this.alertService.show(this.labels.finish_message);
  }

  /**
   * 詳細モーダル用ヘッダ項目生成
   */
  private _buildDeleteModalValues() {
    return new Promise<void>(async (resolve) => {
      const res = await this.businessTypeService.fetchIndexDeleteFields();
      this.deleteModalValues = this._getModalValues(res);
      resolve();
    });
  }

  /**
   * ダウンロード用指定項目生成
   */
  private _buildDownloadFields() {
    return new Promise<void>(async (resolve) => {
      const res = await this.businessTypeService.fetchIndexDownloadFields();
      this.downloadFields = this._createXFields(res);
      resolve();
    });
  }
}
