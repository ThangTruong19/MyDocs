import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import {
  OperatorCarIdInputIndexParams,
  DisableOperatorIdentificationParams,
} from '../../../../types/flm/operator';
import { ModalValues, Fields, TableHeader } from '../../../../types/common';

import { OperatorIdentificationKind, RegistrationStatusKind } from '../../../../constants/flm/operator';
import { FilterReservedWord } from '../../../../constants/condition';

import { KbaAbstractIndexComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-index-component';
import { KbaSelectedComponent } from '../../../shared/kba-selected/kba-selected.component';

import { OperatorService } from '../../../../services/flm/operator/operator.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';

@Component({
  selector: 'app-operator-input-car-index',
  templateUrl: './operator-input-car-index.component.html',
  styleUrls: [
    './operator-input-car-index.component.scss',
    '../shared/car-index-kba-table-td.scss',
    '../shared/operator_identification_setting_modal.scss',
  ],
})
export class OperatorInputCarIndexComponent extends KbaAbstractIndexComponent
  implements OnInit {
  @ViewChild('resetModalContent', { static: false })
  resetModalContent: TemplateRef<null>;
  @ViewChild('operatorIdSettingOffModalContent', { static: false })
  operatorIdSettingOffModalContent: TemplateRef<null>;
  @ViewChildren(KbaSelectedComponent) selectComponents: QueryList<
    KbaSelectedComponent
  >;

  initParams = {
    common: {
      customer: {},
      car_identification: {},
      customer_attribute: {},
    },
    car_operator_id_input: {},
  };
  checkIdName = 'cars.car_identification.id';
  params;
  // AbstractComponent で行う処理と変数名がかぶるため変更
  _searchParams: OperatorCarIdInputIndexParams;
  sortableThList: string[] = [];
  commaSeparated = [
    'common.car_identification.models',
    'common.car_identification.type_revs',
    'common.car_identification.serials',
    'common.car_identification.division_codes',
  ];
  stringParamList = [
    'common.target_car_group_id',
    'car_operator_id_input.registration_status_kind',
    'car_operator_id_input.operator_identification_kind',
  ];
  selectAll = FilterReservedWord.selectAll;
  selectedCarIds: string[] = [];
  detailCar = null;
  isOpenDetail = false;
  isOpenDeleteAll = false;
  isOpenSettingAll = false;
  disableOperatorIdentificationParams: DisableOperatorIdentificationParams = {
    car_id: [],
  };
  customerId: string;
  operatorFields: Fields;
  listSettingFields: Fields;
  listSettingConfirmFields: Fields;
  settingOffModalValues: ModalValues;
  batchDeleteLimit: number;
  checkedItems: { [key: string]: boolean } = {};
  notSortingColumns = ['cars.car_operator.operator_identification_kind'];
  isOperatorAttentionVisible = false;

  listSettingFieldsPromise: Promise<void>;
  listSettingConfirmFieldsPromise: Promise<void>;
  operatorFieldsPromise: Promise<void>;
  settingOffModalPromise: Promise<void>;

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
    private operatorService: OperatorService
  ) {
    super(navigationService, title, router, ref, header, modalService);
    this.batchDeleteLimit = (window as any).settings.carBatchDeleteLimit;
  }

  /**
   * 検索ボタン押下時の処理
   */
  onClickSearch(): void {
    super.onClickSearch();
    const nestedKeys = this._getNestedKeys(this.params);
    this._searchParams = this._buildSearchParams(nestedKeys);
    this.operatorService.updateInputCarSearchCondition(
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
        this.operatorService.initCarInputSearchCondition();
        this.params = _.cloneDeep(this.initParams);
        this.safeDetectChanges();
        this.selectComponents.forEach(sel => sel.resetAndEmit());
      },
    });
  }

  /**
   * オペ識別設定 ON/OFFボタン押下時の処理
   * @param idKeySettingKind IDキー設定
   * @param data ID入力情報
   */
  async onClickOperatorId(idKeySettingKind: string, data: object) {
    // ステータスが設定不可の場合は何もしない
    if (this.isOperatorIdSettingKindDisabled(data['cars.car_operator.registration_status_kind'])) {
      return;
    }

    const carId = data['cars.car_identification.id'];
    if (idKeySettingKind === OperatorIdentificationKind.idInput) {
      this._openIdKeySettingOffModal([carId]);
    } else {
      if (this.listSettingFields == null || this.listSettingConfirmFields == null || this.operatorFields == null) {
        this._showLoadingSpinner();
        await this.listSettingFieldsPromise;
        await this.listSettingConfirmFieldsPromise;
        await this.operatorFieldsPromise;
        this._hideLoadingSpinner();
      }

      this.selectedCarIds = [carId];
      this.isOpenSettingAll = true;
    }
  }

  /**
   * 詳細アイコン押下時コールバック
   * @param target 詳細を表示する対象
   */
  async onClickDetail(target) {
    if (this.listSettingFields == null || this.operatorFields == null) {
      this._showLoadingSpinner();
      await this.listSettingFieldsPromise;
      await this.operatorFieldsPromise;
      this._hideLoadingSpinner();
    }

    this.detailCar = target;
    this.isOpenDetail = true;
  }

  /**
   * オペ識別設定一括OFFボタン押下時の処理
   */
  onClickAllOperatorIdOff(): void {
    this._openIdKeySettingOffModal(this.selectedList);
  }

  /**
   * オペレータID一括削除ボタン押下コールバック
   */
  async onClickAllDelete() {
    if (this.listSettingFields == null || this.listSettingConfirmFields == null || this.operatorFields == null) {
      this._showLoadingSpinner();
      await this.listSettingFieldsPromise;
      await this.listSettingConfirmFieldsPromise;
      await this.operatorFieldsPromise;
      this._hideLoadingSpinner();
    }

    this.selectedCarIds = this.selectedList;
    if (this.resource.common.customer && this.resource.common.customer.ids) {
      this.customerId = this._searchParams.common.customer.ids[0];
    }
    this.isOpenDeleteAll = true;
  }

  /**
   * オペ識別一設定ボタン押下コールバック
   */
  async onClickAllSetting() {
    if (this.listSettingFields == null || this.listSettingConfirmFields == null || this.operatorFields == null) {
      this._showLoadingSpinner();
      await this.listSettingFieldsPromise;
      await this.listSettingConfirmFieldsPromise;
      await this.operatorFieldsPromise;
      this._hideLoadingSpinner();
    }

    this.selectedCarIds = this.selectedList;
    this.isOpenSettingAll = true;
  }

  /**
   * オペレータID車両情報詳細画面からの戻る時の処理
   */
  returnFromDetail(): void {
    this.isOpenDetail = false;
    this.detailCar = null;
    this.checkedItems = {};
    this.safeDetectChanges();
    this.navigationService.refresh();
    this.kbaPaginationComponent.buildOptions();
  }

  /**
   * オペレータID一括削除画面からの戻る時の処理
   */
  returnFromDeleteAll(type: string): void {
    this.isOpenDeleteAll = false;
    this.checkedItems = {};
    this.safeDetectChanges();
    this.navigationService.refresh();
    this.kbaPaginationComponent.buildOptions();
    if (type === 'reload') {
      this._reloadList();
    }
  }

  /**
   * オペレータID一括登録画面からの戻る時の処理
   */
  returnFromSettingAll(type: string): void {
    this.isOpenSettingAll = false;
    this.checkedItems = {};
    this.safeDetectChanges();
    this.navigationService.refresh();
    this.kbaPaginationComponent.buildOptions();
    if (type === 'reload') {
      this._reloadList();
    }
  }

  /**
   * テーブルに表示するデータを取得
   */
  async fetchList(sort_key?: string): Promise<void> {
    this.isFetching = true;
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    const res = await this.operatorService.fetchInputCarIndexList(
      this._searchParams,
      this.requestHeaderParams
    );
    this._fillLists(
      res.result_header,
      this._formatList(res.result_data.cars, this.thList)
    );
    if (this.resource.common.customer && this.resource.common.customer.ids) {
      this.customerId = this._searchParams.common.customer.ids[0];
    }
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * 一覧のチェックボックスを非表示にするかどうかを返却します。
   * @return true:非表示にする/false:非表示にしない
   */
  checkBoxHidden(data: object): boolean {
    return this.isOperatorIdSettingKindDisabled(
      data['cars.car_operator.registration_status_kind']
    );
  }

  /**
   * 該当行がチェックされているかを返却します。
   * @param idKeyCode IDキー番号
   * @return true: チェック済/ false: 未チェック
   */
  isChecked(idKeyCode: string): boolean {
    return _.includes(this.selectedList, idKeyCode);
  }

  /**
   * IDキー設定が設定不可かどうかを返却します。
   * @param idKeySettingKind IDキー設定
   * @return true:無効/false:有効
   */
  isOperatorIdSettingKindDisabled(registrationStatusKind: string): boolean {
    return registrationStatusKind === RegistrationStatusKind.disabled;
  }

  /**
   * IDキー設定がONかどうかを返却します。
   * @param idKeySettingKind IDキー設定
   * @return true:ON/false:OFF
   */
  isOperatorIdSettingKindOn(idKeySettingKind: string): boolean {
    return idKeySettingKind === OperatorIdentificationKind.idInput;
  }

  /**
   * テーブルの初期化に必要なデータを取得
   */
  protected async _fetchDataForInitialize(): Promise<void> {
    const res = await this.operatorService.fetchInputCarIndexInitData();
    this.initialize(res);
    this.params = _.cloneDeep(this.initParams);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    const fields = this._createXFields(res.fields);
    this._setXFields(fields);
    this._setSearchCondition(res.searchCondition);
    this.thList = this._createThList(res.fields);
    this.sortableThList = this.sortableThLists(this.thList);
    this.safeDetectChanges();
    const nestedKeys = this._getNestedKeys(this.params);
    this._searchParams = this._buildSearchParams(nestedKeys);
  }

  protected _afterInitFetchList() {
    this.listSettingFieldsPromise = this._buildListSettingFields();
    this.listSettingConfirmFieldsPromise = this._buildListSettingConfirmFields();
    this.settingOffModalPromise = this._buildSettingOffModalValues();
    this.operatorFieldsPromise = this._buildOperatorFields();
  }

  /**
   * 検索用のパラメータを作成
   * @param nestedKeys キー
   */
  private _buildSearchParams(
    nestedKeys: string[]
  ): OperatorCarIdInputIndexParams {
    return <OperatorCarIdInputIndexParams>(
      this._transrateSearchParams(this.params, nestedKeys)
    );
  }

  /**
   * IDキー設定OFF確認モーダルを開きます.
   * @param carIds 車両ID
   */
  private async _openIdKeySettingOffModal(carIds: string[]): Promise<void> {
    if (this.settingOffModalValues == null) {
      this._showLoadingSpinner();
      await this.settingOffModalPromise;
      this._hideLoadingSpinner();
    }

    this.settingOffModalValues.listVal = await this._getSettingOffModalListVal(
      carIds,
      this.settingOffModalValues
    );
    this.isOperatorAttentionVisible = this.settingOffModalValues.listVal.some((val) =>
      !this.isOperatorIdSettingKindOn(val['cars.car_operator.operator_identification_kind'])
    );

    this.modalService.open({
      title: this.labels.operator_id_setting_off,
      labels: this.labels,
      content: this.operatorIdSettingOffModalContent,
      okBtnLabel: this.labels.operator_id_setting_off_ok_label,
      closeBtnLabel: this.labels.cancel,
      ok: () => {
        this.disableOperatorIdentificationParams['car_id'] = carIds;
        this.operatorService
          .disableOperatorIdentification(
            this.disableOperatorIdentificationParams
          )
          .then(res => {
            this._resultModalOpen(
              this.labels.operator_id_setting_off_result_label,
              this.settingOffModalValues.listDesc,
              this.settingOffModalValues.listVal,
              res['responses'],
              () => {
                this._reloadList();
              },
              { size: 'lg' }
            );
          });
      },
    });
  }

  /**
   * リストを再読み込みする
   */
  private _reloadList() {
    this.pageParams.pageNo = 1;
    this.pageParams.dispPageNo = 1;
    this._reflectPageParams();
    this.fetchList(this.sortingParams['sort']);
    this.checkedItems = {};
  }

  /**
   * 車両ID入力情報を取得し、モーダル表示用に整形する
   * @param carIds 車両ID
   * @param modalValues モーダル情報
   */
  private async _getSettingOffModalListVal(
    ids: string[],
    modalValues: ModalValues
  ) {
    let params = { common: { car_identification: { car_ids: ids } } };
    if (this.exists('common.customer.ids')) {
      params = _.merge(params, {
        common: { customer: { ids: [this.customerId] } },
      });
    }
    const res = await this.operatorService.fetchInputCarIndexList(
      params,
      modalValues.requestHeaderParams
    );
    return this._formatList(res.result_data.cars, modalValues.listDesc);
  }

  /**
   * 識別設定用指定項目取得
   */
  private _buildListSettingFields() {
    return new Promise<void>(async (resolve) => {
      const res = await this.operatorService.fetchInputCarIndexListSettingFields();
      this.listSettingFields = res;
      resolve();
    });
  }

  /**
   * 識別設定確認モーダル用指定項目取得
   */
  private _buildListSettingConfirmFields() {
    return new Promise<void>(async (resolve) => {
      const res = await this.operatorService.fetchInputCarIndexListSettingConfirmFields();
      this.listSettingConfirmFields = res;
      resolve();
    });
  }

  /**
   * 設定OFFモーダル用ヘッダ項目生成
   */
  private _buildSettingOffModalValues() {
    return new Promise<void>(async (resolve) => {
      const res = await this.operatorService.fetchInputCarIndexSettingOffFields();
      this.settingOffModalValues = this._getModalValues(res);
      resolve();
    });
  }

  /**
   * オペレータ一覧用指定項目取得
   */
  private _buildOperatorFields() {
    return new Promise<void>(async (resolve) => {
      const res = await this.operatorService.fetchInputCarIndexOperatorFields();
      this.operatorFields = res;
      resolve();
    });
  }
}
