import {
  Component,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import { Fields, TableHeader } from '../../../../../types/common';

import { PublishGroupKind } from '../../../../../constants/publish-group-kind';
import { ProcessingType } from '../../../../../constants/download';
import { FunctionCode } from '../../../../../constants/opa/function-codes/management-car-setting';

import { KbaAbstractIndexComponent } from '../../../../shared/kba-abstract-component/kba-abstract-index-component';

import { KbaNavigationService } from '../../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../../services/shared/kba-modal.service';
import { ManagementCarSettingService } from '../../../../../services/opa/management-car-setting/management-car-setting.service';
import { CustomDivisionData } from '../../../../../types/opa/management-car-setting/custom-division';
import { KbaAlertService } from '../../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../../services/api/api.service';

@Component({
  selector: 'app-custom-division-index',
  templateUrl: './custom-division-index.component.html',
  styleUrls: ['./custom-division-index.component.scss'],
})
export class CustomDivisionIndexComponent extends KbaAbstractIndexComponent {
  @ViewChild('deleteModalContent', { static: false })
  deleteModalContent: TemplateRef<null>;
  @ViewChild('detailModalContent', { static: false })
  detailModalContent: TemplateRef<null>;

  selectedItem: CustomDivisionData;
  downloadPopoverVisible = false;
  downloadFields: Fields;
  downloadFieldResources: Fields;
  sortKeyWithLangCode: String = 'custom_divisions.names.label';

  constructor(
    navigation: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    modal: KbaModalService,
    private managementCarSettingService: ManagementCarSettingService,
    private alertService: KbaAlertService,
    private api: ApiService
  ) {
    super(navigation, title, router, ref, header, modal);
  }

  async fetchList(sort_key?: string): Promise<void> {
    this.isFetching = true;

    this.requestHeaderParams['X-Sort'] = sort_key || '';

    const res = await this.managementCarSettingService.fetchCustomDivisions(
      this.searchParams,
      this.requestHeaderParams
    );

    this._fillLists(res.result_header, res.result_data.custom_divisions);
    this.thList = this._buildTableHeader();
    this.sortableThList = this.sortableThLists(this.thList);
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * 検索ボタン押下時の処理
   */
  onClickSearch() {
    super.onClickSearch();

    this.fetchList(this.sortingParams['sort']);
  }

  /**
   * 詳細ボタン押下時の処理
   * @param item 対象項目
   */
  async onClickDetail(item: CustomDivisionData) {
    this.selectedItem = (await this.managementCarSettingService.fetchCustomDivisions(
      {
        group_id: this.searchParams.group_id,
        custom_division_id: item.id,
      },
      this.detailModalValues.requestHeaderParams
    )).result_data.custom_divisions[0];

    this.modalService.open(
      {
        title: this.labels.detail_modal_title,
        labels: this.labels,
        content: this.detailModalContent,
      },
      {
        size: 'lg',
      }
    );
  }

  /**
   * 変更ボタン押下時の処理
   * @param item 対象項目
   */
  onClickEdit(item: CustomDivisionData) {
    this.router.navigate(
      ['/management_car_setting/custom_divisions', item.id, 'edit'],
      {
        queryParams: { group_id_param: this.searchParams.group_id },
      }
    );
  }

  /**
   * 削除ボタン押下時の処理
   * @param item 対象項目
   */
  async onClickDelete(item: CustomDivisionData) {
    this.selectedItem = (await this.managementCarSettingService.fetchCustomDivisions(
      {
        group_id: this.searchParams.group_id,
        custom_division_id: item.id,
      },
      this.deleteModalValues.requestHeaderParams
    )).result_data.custom_divisions[0];

    this.modalService.open({
      title: this.labels.delete_modal_title,
      labels: this.labels,
      content: this.deleteModalContent,
      okBtnLabel: this.labels.delete,
      okBtnClass: 'btn-delete',
      closeBtnLabel: this.labels.cancel,
      ok: () => this._delete(item),
    });
  }

  /**
   * 編集アイコンの表示判定
   * @param item 項目
   */
  editIconHidden(item: CustomDivisionData) {
    return (
      !this.resource.group_id && item.group_kind_id === PublishGroupKind.region
    );
  }

  /**
   * 削除アイコンの表示判定
   * @param item 項目
   */
  deleteIconHidden(item: CustomDivisionData) {
    return (
      !this.resource.group_id && item.group_kind_id === PublishGroupKind.region
    );
  }

  /**
   * 一括ダウンロードボタン押下時の処理
   */
  handleClickDownload() {
    this.downloadPopoverVisible = !this.downloadPopoverVisible;
  }

  /**
   * ソートが可能なヘッダーをソートキーで設定
   */
  sortableThLists(thList) {
    return thList.filter(th => th.sortable).map(th => th.sortKey);
  }

  /**
   * ダウンロードOK押下時の処理
   * @param event イベント
   */
  async handleDownloadOk(event: { fields: Fields; fileType: string }) {
    await this.api.updateField(
      FunctionCode.customDivisionListDownloadFunction,
      event.fields
    );
    await this._downloadTemplate(event.fields.map(f => f.path), event.fileType);
  }

  protected async _fetchDataForInitialize() {
    const res = await this.managementCarSettingService.fetchCustomDivisionIndexInitData();
    this.initialize(res);
    this.resource = res.resource;
    this.labels = res.label;
    this._setTitle();
    this.updatable = res.updatable;
    this.deletable = res.deletable;
    this._reflectXFields(res.fields);
    this.thList = this._createThList(res.fields);
    this.sortableThList = this.sortableThLists(this.thList);
    this.deleteModalValues = this._getModalValues(res.deleteFields);
    this.detailModalValues = this._getDetailModalValues(res.detailFields);

    this.collapsed = this.resource.group_id == null;
    this.downloadFields = res.downloadFields;
    this.downloadFieldResources = res.downloadFieldResources;
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
   * テーブルのヘッダーを再設定
   * カスタム車両名称に言語コードを付与する
   */
  private _buildTableHeader() {
    const lang_code = _.get(this.lists, 'originList[0].names[0].lang_code');
    return this.thList.map(th => {
      return {
        ...th,
        sortKey:
          th.sortKey === this.sortKeyWithLangCode
            ? `${th.sortKey}:${lang_code}`
            : th.sortKey,
      };
    });
  }

  /**
   * 項目を削除する
   * @param item 対象項目
   */
  private async _delete(item: CustomDivisionData) {
    await this.managementCarSettingService.deleteCustomDivision(
      item.id,
      item.update_datetime
    );
    this.alertService.show(this.labels.finish_message);
    this.fetchList(this.sortingParams['sort']);
  }

  /**
   * 詳細モーダルのヘッダ・XFieldsを作成する
   * @param fields 指定項目
   */
  private _getDetailModalValues(fields: Fields) {
    const modalValues = super._getModalValues(fields);
    let modelDisplayable = false;
    let typeDisplayable = false;
    const labels = {
      model: '',
      type: '',
    };

    modalValues.listDesc.map((desc: TableHeader) => {
      if (desc.name === 'custom_divisions.models.model') {
        modelDisplayable = true;
        desc.displayable = false;
        labels.model = desc.label;
      }

      if (desc.name === 'custom_divisions.models.types.type_rev') {
        typeDisplayable = true;
        desc.displayable = false;
        labels.type = desc.label;
      }

      return desc;
    });

    if (modelDisplayable && typeDisplayable) {
      modalValues.listDesc.push({
        displayable: true,
        label: this.labels.model_type_rev,
        name: 'model_type_rev',
        optional: false,
      });
      this.labels = {
        ...this.labels,
        ...labels,
      };
    }

    return modalValues;
  }

  /**
   * テンプレートダウンロード
   * @param fields ダウンロード対象項目
   * @param accept ダウンロード形式
   */
  private async _downloadTemplate(fields, accept) {
    const header = _.cloneDeep(this.requestHeaderParams);
    header['X-Sort'] = this.sortingParams['sort'];
    header['X-Fields'] = fields;

    this._showLoadingSpinner();

    try {
      const res = await this.managementCarSettingService.createCustomDivisionFile(
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
}
