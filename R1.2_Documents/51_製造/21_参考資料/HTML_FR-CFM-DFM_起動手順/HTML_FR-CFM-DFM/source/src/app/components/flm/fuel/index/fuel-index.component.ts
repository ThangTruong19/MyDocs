import {
  Component,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import { Fields } from '../../../../types/common';

import { FunctionCode } from '../../../../constants/flm/function-codes/fuel-management';
import { ProcessingType } from '../../../../constants/download';
import { KindSetting, TargetModelKind } from '../../../../constants/flm/fuel';

import { KbaAbstractIndexComponent } from '../../../shared/kba-abstract-component/kba-abstract-index-component';

import { ApiService } from '../../../../services/api/api.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { FuelService } from '../../../../services/flm/fuel/fuel.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

@Component({
  selector: 'app-fuel-index',
  templateUrl: './fuel-index.component.html',
  styleUrls: ['./fuel-index.component.scss'],
})
export class FuelIndexComponent extends KbaAbstractIndexComponent {
  @ViewChild('detailModalContent', { static: false })
  detailModalContent: TemplateRef<any>;
  @ViewChild('deleteModalContent', { static: false })
  deleteModalContent: TemplateRef<any>;

  fieldSelectPopoverVisible = false;
  downloadPopoverVisible = false;
  fields: Fields;
  downloadFields: Fields;
  downloadFieldResources: Fields;
  countCarFields: string[];
  isDeleteModal: boolean;
  fuelSettedCarsNum: number;
  divisionsForDisplay;
  unit: string;
  allModels = false;

  constructor(
    navigation: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    modal: KbaModalService,
    private fuelService: FuelService,
    private api: ApiService,
    private alertService: KbaAlertService,
    private userSettingService: UserSettingService
  ) {
    super(navigation, title, router, ref, header, modal);
  }

  /**
   * リスト表示処理
   * @param sort_key ソートキー
   * @override
   */
  async fetchList(sort_key?: string): Promise<void> {
    this.isFetching = true;
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    const res = await this.fuelService.fetchIndexList(
      this.searchParams,
      this.requestHeaderParams
    );
    this._fillLists(
      res.result_header,
      res.result_data.accumulate_fuel_interval_items
    );
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * 検索ボタン押下時の処理
   * @override
   */
  onClickSearch(): void {
    super.onClickSearch();
    this.fetchList(this.sortingParams['sort']);
  }

  /**
   * 詳細ボタン押下時の処理
   * @param item 対象項目
   */
  async onClickDetail(item): Promise<void> {
    const res = await this.fuelService.fetchIndexList(
      {
        ...this.searchParams,
        accumulate_fuel_interval_item_id: item.id,
      },
      this.detailModalValues.requestHeaderParams
    );
    this.detailModalValues.listVal =
      res.result_data.accumulate_fuel_interval_items[0];

    if (this.detailModalValues.listVal) {
      this.allModels =
        this.detailModalValues.listVal.target_model_kind ===
        TargetModelKind.all;
      this.divisionsForDisplay = this._formatDivisionsForDisplay(
        this.detailModalValues.listVal.car_conditions
      );
    } else {
      this.divisionsForDisplay = null;
      this.allModels = false;
    }

    this.modalService.open({
      title: this.labels.detail_modal_title,
      labels: this.labels,
      content: this.detailModalContent,
    });
  }

  /**
   * 削除ボタン押下時の処理
   * @param item 対象項目
   */
  async onClickDelete(item): Promise<void> {
    const res = await this.fuelService.fetchIndexList(
      {
        ...this.searchParams,
        accumulate_fuel_interval_item_id: item.id,
      },
      this.deleteModalValues.requestHeaderParams
    );
    this.deleteModalValues.listVal =
      res.result_data.accumulate_fuel_interval_items[0];

    if (this.deleteModalValues.listVal) {
      const cars = await this.fuelService.fetchCarsFuelList(
        {
          accumulate_fuel_interval_item: {
            id: res.result_data.accumulate_fuel_interval_items[0].id,
          },
        },
        {
          'X-Fields': this.countCarFields.join(','),
        }
      );
      this.fuelSettedCarsNum = cars.result_data.cars.length;
    }

    this.modalService.open({
      title: this.labels.delete_modal_title,
      labels: this.labels,
      content: this.deleteModalContent,
      okBtnLabel: this.labels.delete,
      okBtnClass: 'btn-delete',
      closeBtnLabel: this.labels.cancel,
      ok: async () => {
        await this.fuelService.deleteFuel(item.id, item.update_datetime);
        this.fetchList();
        this.alertService.show(this.labels.complete_message);
      },
    });
  }

  /**
   * 変更ボタン押下時の処理
   * @param item 対象項目
   */
  onClickEdit(item): void {
    this.router.navigate(['fuel_interval_items', item.id, 'edit']);
  }

  /**
   * 表示項目設定ボタン押下時の処理
   */
  onClickFieldSelect(): void {
    this.fieldSelectPopoverVisible = !this.fieldSelectPopoverVisible;
  }

  /**
   * 表示項目設定ボタン押下時の処理
   * @param event イベント
   */
  async onFieldSelectOk(event): Promise<void> {
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
   * 一括ダウンロードボタン押下時の処理
   */
  onClickDownloadAll(): void {
    this.downloadPopoverVisible = !this.downloadPopoverVisible;
  }

  /**
   * ダウンロードOKボタン押下時の処理
   * @param event イベント
   */
  async onDownloadOk(event): Promise<void> {
    await this.api.updateField(FunctionCode.listDownloadFunction, event.fields);
    await this._downloadTemplate(event.fields.map(f => f.path), event.fileType);
  }

  /**
   * 区分を判定する
   * @param item リストのデータ
   * @param name パス
   */
  checkKind(item, name) {
    return item[name + '_kind'] && item[name + '_kind'] === KindSetting.on;
  }

  /**
   * 初期化データ取得
   * @override
   */
  protected async _fetchDataForInitialize(): Promise<void> {
    const res = await this.fuelService.fetchIndexInitData();
    this.initialize(res);
    this.resource = res.resource;
    this.labels = res.label;
    this._setTitle();
    this.updatable = res.updatable;
    this.deletable = res.deletable;
    this._updateFields(res.fields);
    this.fieldResources = res.fieldResources;
    this.downloadFields = res.downloadFields;
    this.downloadFieldResources = res.downloadFieldResources;
    this.countCarFields = this._createXFields(res.countCarFields);
    this.detailModalValues = this._getModalValues(res.detailFields);
    this._formatDetailModalHeader();
    this.deleteModalValues = this._getModalValues(res.deleteFields);
    this.unit = this.labels[this.userSettingService.getVolumeUnit()];
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
    return _.slice(key.split('.'), 1).join('.');
  }

  /**
   * テンプレートダウンロード
   * @param fields ダウンロード対象項目
   * @param accept ダウンロード形式
   */
  private async _downloadTemplate(fields, accept): Promise<void> {
    const header = _.clone(this.requestHeaderParams);
    header['X-Sort'] = this.sortingParams['sort'];
    header['X-Fields'] = fields;
    this._showLoadingSpinner();
    try {
      const res = await this.fuelService.createFile(
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
   * 指定項目取得 API の結果を反映
   * @param fields 指定項目
   */
  private _updateFields(fields): void {
    this.fields = fields;
    this.thList = this._createThList(fields);
    this.sortableThList = this.sortableThLists(this.thList);
    this._setXFields(this._createXFields(fields));
  }

  /**
   * 機種・型式を表示用にフォーマット
   * @param carConditions 機種・型式
   */
  private _formatDivisionsForDisplay(carConditions) {
    return _.map(_.groupBy(carConditions, 'model'), (divisions, model) => ({
      model,
      divisions,
    }));
  }

  /**
   * 機種・型式表示のため詳細モーダルのヘッダをフォーマットする
   */
  private _formatDetailModalHeader() {
    return this.detailModalValues.listDesc.map(h => {
      switch (h.name) {
        case 'accumulate_fuel_interval_items.car_conditions.model':
          h.label = this.labels.model_type_rev;
          h.displayable = true;
          break;
        case 'accumulate_fuel_interval_items.car_conditions.type_rev':
          h.displayable = false;
          break;
      }
      return h;
    });
  }
}
