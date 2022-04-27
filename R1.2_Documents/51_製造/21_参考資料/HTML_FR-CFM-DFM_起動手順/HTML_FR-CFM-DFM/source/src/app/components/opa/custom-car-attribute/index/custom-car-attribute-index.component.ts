import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import { TableHeader, ModalValues } from '../../../../types/common';
import { Api } from '../../../../types/common';

import { KbaAbstractIndexComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-index-component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { CustomCarAttributeService } from '../../../../services/opa/custom-car-attribute/custom-car-attribute.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';

@Component({
  selector: 'app-custom-car-attribute-index',
  templateUrl: './custom-car-attribute-index.component.html',
  styleUrls: ['./custom-car-attribute-index.component.scss'],
})
export class CustomCarAttributeIndexComponent extends KbaAbstractIndexComponent {
  @ViewChild('detailDeleteModalContent', { static: false })
  detailDeleteModalContent: TemplateRef<void>;

  params: {
    block_id: string;
  };
  val: any;
  detailDeleteHeaders: {
    label: string;
    name: string;
    index?: number;
  }[];
  isDeleteModal = false;

  deleteModalPromise: Promise<void>;
  detailModalPromise: Promise<void>;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    modal: KbaModalService,
    private customCarAttributeService: CustomCarAttributeService,
    private alertService: KbaAlertService
  ) {
    super(nav, title, router, ref, header, modal);
  }

  async fetchList(sort_key?: string): Promise<void> {
    this.isFetching = true;
    this.requestHeaderParams['X-Sort'] = sort_key || '';

    const res: Api = await this.customCarAttributeService.fetchIndexList(
      this.searchParams,
      this.requestHeaderParams
    );

    this._fillLists(res.result_header, res.result_data.custom_car_attributes);
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * 検索ボタン押下時の処理
   */
  onClickSearch(): void {
    super.onClickSearch();
    this.fetchList(this.sortingParams['sort']);
  }

  /**
   * 詳細ボタン押下時の処理
   * @param item 対象項目
   */
  onClickDetail(item): void {
    this.isDeleteModal = false;

    this._openDetailDeleteModal(this.detailModalValues, item, {
      title: this.labels.detail_modal_title,
      labels: this.labels,
      content: this.detailDeleteModalContent,
    });
  }

  /**
   * 変更ボタン押下時の処理
   * @param item 対象項目
   */
  onClickEdit(item): void {
    this.router.navigate(['custom_car_attributes', item.id, 'edit']);
  }

  /**
   * 削除ボタン押下時の処理
   * @param item 対象項目
   */
  onClickDelete(item): void {
    this.isDeleteModal = true;

    this._openDetailDeleteModal(this.deleteModalValues, item, {
      title: this.labels.delete_modal_title,
      labels: this.labels,
      content: this.detailDeleteModalContent,
      okBtnLabel: this.labels.delete,
      okBtnClass: 'btn-delete',
      closeBtnLabel: this.labels.cancel,
      ok: async () => {
        this._showLoadingSpinner();

        await this.customCarAttributeService.deleteCustomCarAttribute(
          item.id,
          item.update_datetime
        );
        this.fetchList(this.sortingParams['sort']);

        this._hideLoadingSpinner();
        this.alertService.show(this.labels.finish_message);
      },
    });
  }

  protected async _fetchDataForInitialize(): Promise<void> {
    const res: any = await this.customCarAttributeService.fetchIndexInitData();

    this.initialize(res);
    this.resource = res.resource;
    this.labels = res.label;
    this._setTitle();
    this.updatable = res.updatable;
    this.deletable = res.deletable;
    this.thList = this._createThList(res.fields) as TableHeader[];
    this.sortableThList = this.sortableThLists(this.thList);
    this._reflectXFields(res.fields);
    this.collapsed = this.resource.block_id == null;
  }

  protected _afterInitFetchList() {
    this.deleteModalPromise = this._buildDeleteModalValues();
    this.detailModalPromise = this._buildDetailModalValues();
  }

  /**
   * データ取得用のキーを設定
   * @param key キー
   * @override
   */
  protected _dataKey(key: string): string {
    return key
      .split('.')
      .slice(-1)
      .pop();
  }

  /**
   * 詳細・削除モーダルを開く
   * @param modalValues ヘッダ・指定項目
   * @param item 対象項目
   * @param opt モーダルのオプション
   */
  private async _openDetailDeleteModal(
    modalValues: ModalValues,
    item,
    opt
  ): Promise<void> {
    this._showLoadingSpinner();

    const desc = modalValues.listDesc;
    const res: Api = await this.customCarAttributeService.fetchCustomCarAttributeDetail(
      item.id,
      modalValues.requestHeaderParams
    );
    this.val = res.result_data;

    const result = desc.filter(d => d.displayable);

    this.detailDeleteHeaders = _.chain(result)
      .compact()
      .sort((d1, d2) => d1.display_sequence_no - d2.display_sequence_no)
      .map(d => ({
        label: d.label,
        name: d.name
          .split('.')
          .slice(1)
          .join('.'),
      }))
      .map(d =>
        d.name === 'details' ? this._createDetailsHeaders(this.val, d.label) : d
      )
      .flatten()
      .value();

    this._hideLoadingSpinner();
    this.modalService.open(opt);
  }

  /**
   * 詳細モーダルに表示する詳細項目のヘッダを作成
   * @param item 詳細取得APIで取得したデータ
   * @param label ラベル
   */
  private _createDetailsHeaders(item, label) {
    return item.custom_car_attribute.details.map((di, index) => ({
      label: `${label}${di.order}`,
      name: 'details',
      index,
    }));
  }

  /**
   * 削除モーダル用ヘッダ項目生成
   */
  private _buildDeleteModalValues() {
    return new Promise<void>(async (resolve) => {
      const res = await this.customCarAttributeService.fetchIndexDeleteFields();
      this.deleteModalValues = this._getModalValues(res);
      resolve();
    });
  }

  /**
   * 削除モーダル用ヘッダ項目生成
   */
  private _buildDetailModalValues() {
    return new Promise<void>(async (resolve) => {
      const res = await this.customCarAttributeService.fetchIndexDetailFields();
      this.detailModalValues = this._getModalValues(res);
      resolve();
    });
  }
}
