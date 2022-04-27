import {
  Component,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import { Api, Fields } from '../../../../types/common';

import {
  ServiceContractIndexParams,
  ServiceContractEditParams,
} from '../../../../types/opa/service-contract';
import {
  ApplyIndexParams,
  CarIdSearchParams,
} from '../../../../types/flm/service-contract';
import { ModalValues } from '../../../../types/common';

import { FunctionCode } from '../../../../constants/flm/function-codes/service-contract-management';
import { ServiceContractStatus } from '../../../../constants/flm/service-contract';

import { KbaAbstractIndexComponent } from '../../../shared/kba-abstract-component/kba-abstract-index-component';
import { KbaTableComponent } from '../../../shared/kba-table/kba-table.component';
import { KbaSelectedComponent } from '../../../shared/kba-selected/kba-selected.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ServiceContractService } from '../../../../services/flm/service-contract/service-contract.service';
import { ApiService } from '../../../../services/api/api.service';

@Component({
  selector: 'app-service-contract-apply-index',
  templateUrl: './service-contract-apply-index.component.html',
  styleUrls: ['./service-contract-apply-index.component.scss'],
})
export class ServiceContractApplyIndexComponent extends KbaAbstractIndexComponent {
  @ViewChild(KbaTableComponent, { static: false })
  kbaTableComponent: KbaTableComponent;
  @ViewChild('supportDistributorSelect', { static: false })
  supportDistributorSelect: KbaSelectedComponent;
  @ViewChild('customerSelect', { static: false })
  customerSelect: KbaSelectedComponent;
  @ViewChild('unlinkModalContent', { static: false })
  unlinkModalContent: TemplateRef<null>;

  isOpenApplyEdit = false;
  initParams: ApplyIndexParams = {
    common: {
      car_identification: {
        car_ids: '',
        maker_codes: '',
        division_codes: '',
        models: '',
        type_revs: '',
        serials: '',
      },
      support_distributor: {
        ids: '',
      },
      service_distributor: {
        ids: '',
      },
      customer: {
        ids: '',
      },
    },
    service_contract_status: '',
    service_contract_request: {
      service_distributor_id: '',
    },
  };

  commaSeparated = [
    'common.car_identification.models',
    'common.car_identification.type_revs',
    'common.car_identification.serials',
    'common.car_identification.division_codes',
  ];

  stringParamList = [
    'service_contract_status',
    'service_contract_request.service_distributor_id',
  ];

  // 解除モーダル
  unlinkModalValues: ModalValues;

  listCollapsed = true;
  fields: Fields;
  applyFields: Fields;
  applyConfirmFields: Fields;
  fieldSelectPopoverVisible = false;
  fixedThList: object[];
  scrollableThList: object[];
  initList: object[] = [];
  checkIdName = 'cars.car_identification.id';
  checkedItems: { [key: string]: boolean } = {};

  fieldResourcesPromise: Promise<void>;
  unlinkModalPromise: Promise<void>;
  applyFieldsPromise: Promise<void>;
  applyConfirmFieldsPromise: Promise<void>;

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
    private api: ApiService
  ) {
    super(navigationService, title, router, ref, header, modalService);
  }

  /**
   * テーブルに表示するデータを取得
   */
  fetchList(sort_key?: string) {
    return new Promise(resolve => {
      this.requestHeaderParams['X-Sort'] = sort_key || '';
      this.isFetching = true;
      const nestedKeys = this._getNestedKeys(this.params);
      const searchParams = this._transrateSearchParams(this.params, nestedKeys);
      this.serviceContractService
        .fetchApplyIndexList(searchParams, this.requestHeaderParams)
        .then((res: any) => {
          const formatted = this._formatList(res.result_data.cars, this.thList);
          this._fillLists(res.result_header, formatted);

          this.isFetching = false;
          this._afterFetchList();
          resolve();
        });
    });
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
      .updateField(FunctionCode.consignorListFunction, event.fields)
      .then((res: any) => {
        return new Promise(resolve => {
          this.api
            .fetchFields(FunctionCode.consignorListFunction)
            .subscribe(_res => resolve(_res));
        });
      })
      .then((res: any) => {
        this._updateFields(res);
        this.fetchList(this.sortingParams['sort']);
      });
  }

  /**
   * 該当行がチェックされているかを返却します。
   * @param carId 車両ID
   * @return true: チェック済/ false: 未チェック
   */
  isChecked(carId: string): boolean {
    return _.includes(this.selectedList, carId);
  }

  /**
   * サービスDB委託解除ボタン押下時の処理
   */
  async onClickUnlinkContract() {
    const res = await this.serviceContractService.fetchApplyIndexList(
      this._carIdsParams(this.selectedList),
      this.unlinkModalValues.requestHeaderParams
    );
    this.unlinkModalValues.listVal = this._formatList(
      res.result_data.cars,
      this.unlinkModalValues.listDesc
    );

    const checkedCars = _.filter(this.initList, list =>
      this.isChecked(list[this.checkIdName])
    );
    this._openUnlinkConfirmModal(checkedCars);
  }

  /**
   * サービスDB変更申請ボタン押下時の処理
   */
  async onClickApplyEdit() {
    if (this.applyFields == null || this.applyConfirmFields == null) {
      this._showLoadingSpinner();
      await this.applyFieldsPromise;
      await this.applyConfirmFieldsPromise;
      this._hideLoadingSpinner();
    }

    this.isOpenApplyEdit = true;
  }

  /**
   * サービスDB変更申請画面の申請登録完了時の処理
   */
  onSubmit(): void {
    this.isOpenApplyEdit = false;
    this.checkedItems = {};
    this.params = _.cloneDeep(this.initParams);
    this.ref.detectChanges();
    this.kbaPaginationComponent.initOptions();
    this.kbaPaginationComponent.onChangePageNo(true);
  }

  /**
   * サービスDB変更申請画面から戻る時の処理
   */
  returnFromChangeServiceDistributor(): void {
    this.isOpenApplyEdit = false;
    this.checkedItems = {};
    this.ref.detectChanges();
    this.kbaPaginationComponent.buildOptions();
    setTimeout(() => this.fetchList());
  }

  /**
   * 担当DB変更時コールバック
   * @param event イベント
   */
  async onSupportDistributorChange(supportDistributorId) {
    if (this.supportDistributorSelect) {
      await this._getCustomerResource(supportDistributorId);

      if (this.customerSelect) {
        await this.customerSelect.refresh();
        this.customerSelect.reset();
      }
    }
  }

  /**
   * 一覧のチェックボックスを非表示にするかどうかを返却します。
   * @return true:非表示にする/false:非表示にしない
   */
  checkBoxHidden(data: object[]): boolean {
    return (
      data['cars.service_contract.status'] === ServiceContractStatus.applied
    );
  }

  /**
   * 初期検索前に処理を行う。
   */
  protected async _beforeInitFetchList(): Promise<any> {
    if (this.exists('common.support_distributor.ids')) {
      await this._getCustomerResource(
        _.get(this.resource, 'common.support_distributor.ids.values[0].value')
      );
    }
  }

  /**
   * テーブルの初期化に必要なデータを取得
   */
  protected async _fetchDataForInitialize() {
    const res = await this.serviceContractService.fetchApplyIndexInitData();
    this.initialize(res);
    this.params = _.cloneDeep(this.initParams);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this._updateFields(res.fields);
  }

  protected _afterInitFetchList() {
    this.fieldResourcesPromise = this._buildFieldResouces();
    this.unlinkModalPromise = this._buildCancelModalValues();
    this.applyFieldsPromise = this._buildApplyFields();
    this.applyConfirmFieldsPromise = this._buildApplyConfirmFields();
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
   * 担当DB IDに対応する顧客リソースを取得する
   * @param supportDistributorId 担当DB ID
   */
  private async _getCustomerResource(
    supportDistributorId: string
  ): Promise<any> {
    const resource = await this.serviceContractService.getCustomerResource(
      supportDistributorId
    );
    _.merge(this.resource, resource);
    _.set(
      this.params,
      'common.customer.ids',
      _.get(resource, 'common.customer.ids.values[0].value')
    );
  }

  /**
   * 指定項目取得 API の結果を反映
   * @param fields 指定項目
   */
  private _updateFields(fields) {
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
   * サービス委託解除API用のパラメータを作成
   * @param cars 車両情報
   */
  private _createUnlinkParams(cars: object[]) {
    return _.reduce(
      cars,
      (result, car) => {
        result.car.push(
          `${car['cars.car_identification.id']},${car['cars.car_identification.update_datetime']}`
        );
        return result;
      },
      { car: [] }
    );
  }

  /**
   * 解除確認モーダルを開きます.
   */
  private async _openUnlinkConfirmModal(cars) {
    if (this.unlinkModalValues == null) {
      this._showLoadingSpinner();
      await this.unlinkModalPromise;
      this._hideLoadingSpinner();
    }

    const deleteParams = this._createUnlinkParams(cars);

    this.modalService.open(
      {
        title: this.labels.unlink_modal_body,
        labels: this.labels,
        content: this.unlinkModalContent,
        okBtnLabel: this.labels.unlink,
        okBtnClass: 'btn-unlink',
        closeBtnLabel: this.labels.cancel,
        ok: () => {
          this.serviceContractService
            .unlinkConsignors(deleteParams)
            .then(res => {
              this._resultModalOpen(
                this.labels.unlink_result_label,
                this.unlinkModalValues.listDesc,
                this.unlinkModalValues.listVal,
                res['responses'],
                () => {
                  this.fetchList(this.sortingParams['sort']);
                },
                { size: 'lg' }
              );
            });
        },
      },
      { size: 'lg' }
    );
  }

  /**
   * 車両一覧取得パラメータの作成
   * @param carIds 車両ID
   */
  private _carIdsParams(carIds: string[]): CarIdSearchParams {
    return { common: { car_identification: { car_ids: carIds } } };
  }

  /**
   * 指定項目リソースを生成
   */
  private _buildFieldResouces() {
    return new Promise<void>(async (resolve) => {
      const res = await this.serviceContractService.fetchApplyIndexFieldResources();
      this.fieldResources = res;
      resolve();
    });
  }

  /**
   * 解除モーダルのヘッダ情報を生成
   */
  private _buildCancelModalValues() {
    return new Promise<void>(async (resolve) => {
      const res = await this.serviceContractService.fetchApplyIndexCancelFields();
      this.unlinkModalValues = this._getModalValues(res);
      resolve();
    });
  }

  /**
   * 申請画面用ヘッダ項目を生成
   */
  private _buildApplyFields() {
    return new Promise<void>(async (resolve) => {
      const res = await this.serviceContractService.fetchApplyIndexApplyFields();
      this.applyFields = res;
      resolve();
    });
  }

  /**
   * 申請確認モーダル用指定項目を生成
   */
  private _buildApplyConfirmFields() {
    return new Promise<void>(async (resolve) => {
      const res = await this.serviceContractService.fetchApplyIndexConfirmFields();
      this.applyConfirmFields = res;
      resolve();
    });
  }
}
