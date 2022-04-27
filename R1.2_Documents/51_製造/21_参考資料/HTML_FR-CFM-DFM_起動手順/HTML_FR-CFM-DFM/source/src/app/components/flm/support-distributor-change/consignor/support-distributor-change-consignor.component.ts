import * as _ from 'lodash';
import {
  Component,
  ViewChild,
  ViewChildren,
  QueryList,
  TemplateRef,
  ChangeDetectorRef,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { SupportDistributorChangeConsignorSearchParams } from '../../../../types/flm/support-distributor-change';
import { TableHeader } from '../../../../types/common';
import { Fields } from '../../../../types/common';

import { CarAssignStatus } from '../../../../constants/flm/support-distributor-change';

import { KbaAbstractIndexComponent } from '../../../shared/kba-abstract-component/kba-abstract-index-component';
import { KbaSelectedComponent } from '../../../shared/kba-selected/kba-selected.component';
import { KbaTableComponent } from '../../../shared/kba-table/kba-table.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { ApiService } from '../../../../services/api/api.service';
import { SupportDistributorChangeService } from '../../../../services/flm/support-distributor-change/support-distributor-change.service';
import { FunctionCode } from '../../../../constants/flm/function-codes/support-distributor-change-management';
import { ScreenCode } from '../../../../constants/flm/screen-codes/support-distributor-change-management';
import { CarService } from '../../../../services/flm/car/car.service';

@Component({
  selector: 'app-car-support-distributor-change-consignor',
  templateUrl: './support-distributor-change-consignor.component.html',
  styleUrls: ['./support-distributor-change-consignor.component.scss'],
})
export class CarSupportDistributorChangeConsignorComponent extends KbaAbstractIndexComponent {
  @ViewChild(KbaTableComponent, { static: false }) table: KbaTableComponent;
  @ViewChild('resetModalContent', { static: false })
  resetModalContent: TemplateRef<null>;
  @ViewChild('customerSelector', { static: false })
  customerSelector: KbaSelectedComponent;
  @ViewChildren(KbaSelectedComponent) selectors: QueryList<
    KbaSelectedComponent
  >;

  isOpenConsignor = false;
  checkIdName = 'cars.car_identification.id';
  fieldSelectPopoverVisible = false;
  _searchParams: SupportDistributorChangeConsignorSearchParams;
  xFields: string[];
  fields: Fields;
  applyFields: Fields;
  applyConfirmFields: Fields;
  fixedThList: TableHeader[];
  scrollableThList: TableHeader[];
  initParams: SupportDistributorChangeConsignorSearchParams = {
    common: {
      support_distributor: {},
      service_distributor: {},
      customer: {},
      car_identification: {
        models: '',
        type_revs: '',
        serials: '',
      },
    },
    car_management: {},
  };
  enableConsignor: boolean;
  checkedItems: { [key: string]: boolean } = {};

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
    private alert: KbaAlertService,
    private api: ApiService,
    private supportDistributorChangeService: SupportDistributorChangeService,
    private carService: CarService
  ) {
    super(navigationService, title, router, ref, header, modalService);
  }

  /**
   * 検索ボタン押下時の処理
   */
  onClickSearch(): void {
    super.onClickSearch();
    const nestedKeys = this._getNestedKeys(this.params);
    this._searchParams = this._buildSearchParams(nestedKeys);

    this.supportDistributorChangeService.updateSupportDistributorChangeConsignorSearchCondition(
      this._createSearchCondition(this._searchParams, nestedKeys)
    );
    this.fetchList(this.sortingParams['sort']);
    this.checkedItems = {};
  }

  /**
   * リセット押下時の処理
   */
  onClickReset(): void {
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      closeBtnLabel: this.labels.cancel,
      ok: () => {
        this.supportDistributorChangeService.initSupportDistributorChangeConsignorSearchCondition();
        this.params = _.cloneDeep(this.initParams);
        this.safeDetectChanges();
        this.selectors.forEach((s: KbaSelectedComponent) => {
          if (s) {
            s.refresh();
          }
        });
      },
    });
  }

  /**
   * 担当DB変更申請ボタン押下時コールバック
   */
  onClickSupportDistributorChangeConsignor(): void {
    this.isOpenConsignor = true;
  }

  /**
   * 表示項目設定ボタン押下時の処理
   */
  onClickFieldSelect(): void {
    this.fieldSelectPopoverVisible = !this.fieldSelectPopoverVisible;
  }

  /**
   * 指定項目設定ボタン押下時の処理
   * @param event イベント
   */
  onFieldSelectOk(event): void {
    this.api
      .updateField(
        FunctionCode.supportDistributorChangeConsignorFunction,
        event.fields
      )
      .then((res: any) => {
        return new Promise(resolve => {
          this.api
            .fetchFields(FunctionCode.supportDistributorChangeConsignorFunction)
            .subscribe(_res => resolve(_res));
        });
      })
      .then((res: any) => {
        this._updateFields(res);
        this.fetchList(this.sortingParams['sort']);
      });
  }

  /**
   * 担当DB変更時コールバック
   * @param value 変更値
   */
  onChangeSupportDistributor(value: string): void {
    this.carService
      .getCustomers(value, ScreenCode.supportDistributorChangeConsignor)
      .then(res => {
        let r;
        if ((r = _.get(res, 'common.customer.ids'))) {
          _.set(this.resource, 'common.customer.ids', r);
          this.safeDetectChanges();
          if (this.customerSelector) {
            this.customerSelector.refresh();
          }
          this.safeDetectChanges();
        }
      });
  }

  /**
   * 担当DB変更申請画面の申請登録完了時の処理
   */
  onSubmit(): void {
    this.isOpenConsignor = false;
    this.checkedItems = {};
    this.safeDetectChanges();
    this.kbaPaginationComponent.initOptions();
    this.kbaPaginationComponent.onChangePageNo(true);
  }

  /**
   * 担当DB変更申請画面から戻る時の処理
   */
  returnFromChangeConsignor(): void {
    this.isOpenConsignor = false;
    this.checkedItems = {};
    this.safeDetectChanges();
    this.kbaPaginationComponent.buildOptions();
    setTimeout(() => this.fetchList());
  }

  /**
   * 一覧のチェックボックスを非表示にするかどうかを返却します。
   * @return true:非表示にする/false:非表示にしない
   */
  checkBoxHidden(data: object[]): boolean {
    return (
      data['cars.car_management_attribute.car_assign_status'] ===
      CarAssignStatus.applied
    );
  }

  async fetchList(sort_key?: string): Promise<void> {
    this.isFetching = true;
    this.requestHeaderParams['X-Sort'] = sort_key || '';

    // 「申請状況」にて「すべて」が選択された場合、[0, 1]の配列に置き換えて送信する
    if (_.isEqual(this._searchParams.car_management.car_assign_statuses, ['-99'])) {
      this._searchParams.car_management.car_assign_statuses = ['0', '1'];
    }

    const res = await this.carService.fetchCarIndexList(
      this._searchParams,
      this.requestHeaderParams
    );
    this._fillLists(
      res.result_header,
      this._formatList(res.result_data.cars, this.thList)
    );
    this.isFetching = false;
    this._afterFetchList();
  }

  protected async _fetchDataForInitialize(): Promise<void> {
    const res = await this.supportDistributorChangeService.fetchCarSupportDistributorChangeConsignorInitData();
    this.initialize(res);
    this.params = _.cloneDeep(this.initParams);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this.fieldResources = res.fieldResources;
    this._updateFields(res.fields);
    this._setSearchCondition(res.searchCondition);
    this.applyFields = res.applyFields;
    this.applyConfirmFields = res.applyConfirmFields;
    this.enableConsignor = res.enableConsignor;
    this.selectable = this.enableConsignor;
    this.safeDetectChanges();
    const nestedKeys = this._getNestedKeys(this.params);
    this._searchParams = this._buildSearchParams(nestedKeys);
  }

  /**
   * 検索欄データの値を配列形式に変換する
   * @param 検索欄データ
   */
  protected _transrateSearchParams(
    params: SupportDistributorChangeConsignorSearchParams,
    nestedKeys: string[]
  ): SupportDistributorChangeConsignorSearchParams {
    const result = {};
    let value;
    _.each(nestedKeys, path => {
      if ((value = _.get(params, path))) {
        _.set(result, path, _.split(value, ','));
      }
    });
    return result;
  }

  /**
   * 指定項目取得 API の結果を反映
   * @param fields 指定項目
   */
  private _updateFields(fields: Fields): void {
    this.fields = fields;
    this.thList = this._createThList(fields);
    const xFields = this._createXFields(fields);
    this.sortableThList = this.sortableThLists(this.thList);
    this._setXFields(xFields);
    this.xFields = this._createXFields(fields);
    const thLists = this._createThList(fields, { scrollable: true });
    this.fixedThList = thLists.fixed;
    this.scrollableThList = thLists.scrollable;
    this.sortableThList = this.sortableThLists(this.thList);
  }

  /**
   * 検索用のパラメータを作成
   * @param nestedKeys キー
   */
  private _buildSearchParams(
    nestedKeys: string[]
  ): SupportDistributorChangeConsignorSearchParams {
    return this._transrateSearchParams(this.params, nestedKeys);
  }
}
