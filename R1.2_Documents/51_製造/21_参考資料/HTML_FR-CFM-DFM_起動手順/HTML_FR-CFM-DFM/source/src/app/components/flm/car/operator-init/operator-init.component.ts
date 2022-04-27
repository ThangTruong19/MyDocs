import * as _ from 'lodash';
import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewChildren,
  QueryList,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { OperatorInitSearchParams } from '../../../../types/flm/car';
import { ModalValues, Fields } from '../../../../types/common';
import { SearchItems } from '../../../../types/search';

import { FunctionCode } from '../../../../constants/flm/function-codes/car-management';
import { ScreenCode } from '../../../../constants/flm/screen-codes/car-management';

import { KbaAbstractIndexComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-index-component';
import { KbaSelectedComponent } from '../../../shared/kba-selected/kba-selected.component';
import { KbaTableComponent } from '../../../shared/kba-table/kba-table.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CarService } from '../../../../services/flm/car/car.service';
import { OperatorService } from '../../../../services/flm/operator/operator.service';
import { ApiService } from '../../../../services/api/api.service';

@Component({
  selector: 'app-operator-init',
  templateUrl: './operator-init.component.html',
  styleUrls: ['./operator-init.component.scss'],
})
export class CarOperatorInitComponent extends KbaAbstractIndexComponent
  implements OnInit {
  @ViewChild(KbaTableComponent, { static: false }) table: KbaTableComponent;
  @ViewChild('resetModalContent', { static: false })
  resetModalContent: TemplateRef<null>;
  @ViewChild('customerSelector', { static: false })
  customerSelector: KbaSelectedComponent;
  @ViewChild('initModalContent', { static: false })
  initModalContent: TemplateRef<null>;
  @ViewChildren(KbaSelectedComponent) selectors: QueryList<
    KbaSelectedComponent
  >;

  checkIdName = 'cars.car_identification.id';
  fieldSelectPopoverVisible = false;
  _searchParams: OperatorInitSearchParams;
  xFields: string[];
  fields: Fields;
  fixedThList;
  scrollableThList;
  stringParamList = ['common.target_car_group_id'];
  lineBreakColumns = [
    'cars.user_permission.sub_groups_label',
    'cars.user_permission.sub_groups_label_english',
  ];
  initParams: OperatorInitSearchParams = {
    common: {
      support_distributor: {},
      service_distributor: {},
      customer: {},
      car_identification: {
        models: '',
        type_revs: '',
        serials: '',
      },
      customer_attribute: {
        customer_management_no: '',
      },
    },
    car_management: {},
  };
  initModalValues: ModalValues;
  enableInit: boolean;
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
    private alertService: KbaAlertService,
    private carService: CarService,
    private operatorService: OperatorService,
    private api: ApiService
  ) {
    super(navigationService, title, router, ref, header, modalService);
  }

  async fetchList(sort_key?: string): Promise<void> {
    this.isFetching = true;
    this.requestHeaderParams['X-Sort'] = sort_key || '';
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

  /**
   * 検索ボタン押下時の処理
   */
  onClickSearch(): void {
    super.onClickSearch();
    const nestedKeys = this._getNestedKeys(this.params);
    this._searchParams = this._buildSearchParams(nestedKeys);
    this.carService.updateCarOperatorSearchCondition(
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
        this.carService.initCarOperatorSearchCondition();
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
   * 初期化ボタン押下時の処理
   */
  async onClickInit(): Promise<void> {
    const carList = await this.carService.fetchCarIndexList(
      { common: { car_identification: { car_ids: this.selectedList } } },
      this.initModalValues.requestHeaderParams
    );
    this.initModalValues.listVal = this._formatList(
      carList.result_data.cars,
      this.initModalValues.listDesc
    );

    this.modalService.open({
      title: this.labels.car_operator_init,
      labels: this.labels,
      content: this.initModalContent,
      closeBtnLabel: this.labels.cancel,
      ok: () => {
        this.operatorService
          .disableOperatorIdentification({ car_id: this.selectedList })
          .then(res => {
            this._resultModalOpen(
              this.labels.init_result_label,
              this.initModalValues.listDesc,
              this.initModalValues.listVal,
              res['responses'],
              () => {
                this.pageParams.pageNo = 1;
                this.pageParams.dispPageNo = 1;
                this._reflectPageParams();
                this.fetchList(this.sortingParams['sort']);
                this.checkedItems = {};
              },
              { size: 'lg' }
            );
          });
      },
    });
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
      .updateField(FunctionCode.operatorInitializeFunction, event.fields)
      .then((res: any) => {
        return new Promise(resolve => {
          this.api
            .fetchFields(FunctionCode.operatorInitializeFunction)
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
      .getCustomers(value, ScreenCode.operatorInitialize)
      .then(async res => {
        let r;
        if ((r = _.get(res, 'common.customer.ids'))) {
          _.set(this.resource, 'common.customer.ids', r);
          this.safeDetectChanges();
          if (this.customerSelector) {
            await this.customerSelector.refresh();
          }
          this.safeDetectChanges();
        }
      });
  }

  /**
   * カラムが改行を含むかの判定
   * @param name カラム名
   */
  isLineBreak(name: string): boolean {
    return _.includes(this.lineBreakColumns, name);
  }

  protected async _fetchDataForInitialize(): Promise<void> {
    const res = await this.carService.fetchCarOperatorInitInitData();
    this.initialize(res);
    this.params = _.cloneDeep(this.initParams);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this.enableInit = res.enableInit;
    this.selectable = this.enableInit;
    this.fieldResources = res.fieldResources;
    this.initModalValues = this._getModalValues(res.initFields);
    this._updateFields(res.fields);
    this._setSearchCondition(res.searchCondition);
    this.safeDetectChanges();
    const nestedKeys = this._getNestedKeys(this.params);
    this._searchParams = this._buildSearchParams(nestedKeys);
  }

  /**
   * 検索欄データの値を配列形式に変換する
   * @param 検索欄データ
   */
  protected _transrateSearchParams(
    params,
    nestedKeys: string[]
  ): OperatorInitSearchParams {
    const result = {};
    let value;
    _.each(nestedKeys, path => {
      if ((value = _.get(params, path))) {
        if (_.includes(this.stringParamList, path)) {
          _.set(result, path, value);
        } else {
          _.set(result, path, _.split(value, ','));
        }
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
  private _buildSearchParams(nestedKeys: string[]): OperatorInitSearchParams {
    return this._transrateSearchParams(this.params, nestedKeys);
  }
}
