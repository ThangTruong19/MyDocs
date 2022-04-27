import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { clone, groupBy, map } from 'lodash';

import { ModalValues, Fields } from '../../../../types/common';
import { Api } from '../../../../types/common';

import { FlagType } from '../../../../constants/flm/flag';
import { FunctionCode } from '../../../../constants/flm/function-codes/flag-condition-management';
import { ProcessingType } from '../../../../constants/download';

import { KbaAbstractIndexComponent } from '../../../shared/kba-abstract-component/kba-abstract-index-component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { FlagService } from '../../../../services/flm/flag/flag.service';
import { ApiService } from '../../../../services/api/api.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';

@Component({
  selector: 'app-flag-index',
  templateUrl: './flag-index.component.html',
  styleUrls: ['./flag-index.component.scss'],
})
export class FlagIndexComponent extends KbaAbstractIndexComponent {
  @ViewChild('detailDeleteModalContent', { static: false })
  detailDeleteModalContent: TemplateRef<any>;

  notSortingColumns = ['flag_conditions.flag_code'];
  fieldSelectPopoverVisible = false;
  downloadPopoverVisible = false;
  fields: Fields;
  downloadFields: Fields;
  downloadFieldResources;
  desc;
  val;
  divisionsForDisplay;

  private get _params() {
    return {
      group_id: this.searchParams.support_distributor_id,
    };
  }

  constructor(
    navigation: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    modal: KbaModalService,
    private flagService: FlagService,
    private api: ApiService,
    private alertService: KbaAlertService
  ) {
    super(navigation, title, router, ref, header, modal);
  }

  /**
   * リスト表示処理
   * @param sort_key ソートキー
   * @override
   */
  async fetchList(sort_key?: string): Promise<void> {
    this._updateFields(this.fields);
    this.isFetching = true;
    this.requestHeaderParams['X-Sort'] = sort_key || '';

    const res: any = await this.flagService.fetchIndexList(
      this._params,
      this.requestHeaderParams
    );

    this._fillLists(res.result_header, res.result_data.flag_conditions);
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * 検索ボタン押下時の処理
   * @override
   */
  onClickSearch() {
    super.onClickSearch();
    this.fetchList(this.sortingParams['sort']);
  }

  /**
   * 詳細ボタン押下時の処理
   * @param item 対象項目
   */
  async onClickDetail(item) {
    const res: any = await this.flagService.fetchIndexList(
      {
        flag_condition_id: item.id,
        group_id: item.support_distributor_id,
      },
      this.detailModalValues.requestHeaderParams
    );

    this._showDetailModal(res.result_data.flag_conditions[0], {
      title: this.labels.detail_modal_title,
    });
  }

  /**
   * 削除ボタン押下時の処理
   * @param item 対象項目
   */
  async onClickDelete(item) {
    const res: any = await this.flagService.fetchIndexList(
      {
        flag_condition_id: item.id,
        group_id: item.support_distributor_id,
      },
      this.deleteModalValues.requestHeaderParams
    );

    const target = res.result_data.flag_conditions[0];
    this._showDeleteModal(target, {
      title: this.labels.delete_modal_title,
      okBtnClass: 'btn-delete',
      okBtnLabel: this.labels.delete,
      ok: () => {
        this.flagService.deleteFlag(item.id, item.update_datetime).then(() => {
          this.fetchList(this.sortingParams['sort']);
          this.alertService.show(this.labels.complete_message);
        });
      },
    });
  }

  /**
   * 変更ボタン押下時の処理
   * @param item 対象項目
   */
  onClickEdit(item) {
    const params = this.resource.support_distributor_id
      ? {
          queryParams: {
            group_id_param: this._params.group_id,
          },
        }
      : {};

    this.router.navigate(['flags', item.id, 'edit'], params);
  }

  /**
   * 表示項目設定ボタン押下時の処理
   */
  onClickFieldSelect() {
    this.fieldSelectPopoverVisible = !this.fieldSelectPopoverVisible;
  }

  /**
   * 指定項目設定ボタン押下時の処理
   * @param event イベント
   */
  onFieldSelectOk(event) {
    this.api
      .updateField(FunctionCode.listFunction, event.fields)
      .then((res: any) => {
        return new Promise(resolve => {
          this.api
            .fetchFields(FunctionCode.listFunction)
            .subscribe(_res => resolve(_res));
        });
      })
      .then((res: any) => {
        this._updateFields(res);
        this.fetchList(this.sortingParams['sort']);
      });
  }

  /**
   * 一括ダウンロードボタン押下時の処理
   */
  onClickDownloadAll() {
    this.downloadPopoverVisible = !this.downloadPopoverVisible;
  }

  /**
   * ダウンロードOKボタン押下時の処理
   * @param event イベント
   */
  async onDownloadOk(event) {
    await this.api.updateField(FunctionCode.listDownloadFunction, event.fields);
    await this._downloadTemplate(event.fields.map(f => f.path), event.fileType);
  }

  /**
   * 初期化データ取得
   * @override
   */
  protected async _fetchDataForInitialize(): Promise<void> {
    const res: any = await this.flagService.fetchIndexInitData();

    this.initialize(res);
    this.resource = res.resource;
    this.labels = res.label;
    this._setTitle();
    this._reflectXFields(res.fields);
    this.updatable = res.updatable;
    this.deletable = res.deletable;
    this.fieldResources = res.fieldResources;
    this.downloadFields = res.downloadFields;
    this.downloadFieldResources = res.downloadFieldResources;
    this.detailModalValues = this._getModalValues(res.detailFields);
    this.deleteModalValues = this._getModalValues(res.deleteFields);
    this._updateFields(res.fields);
    if (!this.resource.support_distributor_id) {
      this.collapsed = true;
    }
  }

  /**
   * データキー取得
   * @param key キー（指定項目のパス）
   * @override
   */
  protected _dataKey(key: string): string {
    return key
      .split('.')
      .slice(1)
      .join('.');
  }

  /**
   * データ取得後、リストにデータを挿入します。
   * @param resultHeader API のレスポンスヘッダ
   * @param resultData API のレスポンスデータ
   */
  protected _fillLists(resultHeader, resultData) {
    return super._fillLists(
      resultHeader,
      resultData.map(data => ({
        ...data,
        latest_update_datetime: data.latest_update_datetime
          ? data.latest_update_datetime.split(/\s/)[0]
          : '',
      }))
    );
  }

  /**
   * 確認モーダル用の情報を取得
   * @param fields 確認モーダル用のデータ
   * @param xCount 取得対象件数
   */
  protected _getModalValues(fields, xCount = null): ModalValues {
    const requestHeaderParams = { 'X-Fields': this._createXFields(fields) };

    if (xCount) {
      requestHeaderParams['X-Count'] = xCount;
    }

    return {
      requestHeaderParams,
      listDesc: this._createDetailModalHeader(fields),
      listVal: [],
    };
  }

  /**
   * テンプレートダウンロード
   * @param fields ダウンロード対象項目
   * @param accept ダウンロード形式
   */
  private async _downloadTemplate(fields, accept) {
    const header = clone(this.requestHeaderParams);
    header['X-Sort'] = this.sortingParams['sort'];
    header['X-Fields'] = fields;

    this._showLoadingSpinner();

    try {
      const res: any = await this.flagService.createFile(
        {
          ...this._params,
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
   * 指定項目取得 API の結果を反映
   * @param fields 指定項目
   */
  private _updateFields(fields) {
    this.fields = fields;
    this.thList = this._createThList(fields);
    this.sortableThList = this.sortableThLists(this.thList);
  }

  /**
   * 詳細モーダルを表示
   * @param item 対象項目
   * @param opt モーダル表示時のオプション
   */
  private _showDetailModal(item, opt) {
    this.desc = this.detailModalValues.listDesc;
    this.val = item;
    this.divisionsForDisplay = item
      ? this._formatDivisionsForDisplay(item.car_conditions)
      : null;

    this.modalService.open({
      title: opt.title,
      labels: this.labels,
      content: this.detailDeleteModalContent,
    });
  }

  /**
   * 削除モーダルを表示
   * @param item 対象項目
   * @param opt モーダル表示時のオプション
   */
  private _showDeleteModal(item, opt) {
    this.desc = this.deleteModalValues.listDesc;
    this.val = item;

    this.modalService.open({
      title: opt.title,
      labels: this.labels,
      content: this.detailDeleteModalContent,
      okBtnLabel: opt.okBtnLabel,
      okBtnClass: opt.okBtnClass,
      closeBtnLabel: this.labels.cancel,
      ok: opt.ok,
    });
  }

  /**
   * 詳細モーダルのヘッダを作成
   * @param fields 詳細モーダルに表示する項目
   */
  private _createDetailModalHeader(fields) {
    const header = this._createThList(fields);
    const isModelDisplayable = header
      .filter(
        h =>
          [
            'flag_conditions.car_conditions.model',
            'flag_conditions.car_conditions.type_rev',
          ].indexOf(h.name) >= 0
      )
      .every(h => h.displayable);

    return header.map(h => {
      switch (h.name) {
        case 'flag_conditions.car_conditions.model':
          h.label = this.labels.model_type_rev;
          h.displayable = isModelDisplayable;
          break;
        case 'flag_conditions.car_conditions.type_rev':
          h.displayable = false;
          break;
      }

      return h;
    });
  }

  /**
   * 機種・型式を表示用にフォーマット
   * @param carConditions 機種・型式
   */
  private _formatDivisionsForDisplay(carConditions) {
    return map(groupBy(carConditions, 'model'), (divisions, model) => ({
      model,
      divisions,
    }));
  }
}
