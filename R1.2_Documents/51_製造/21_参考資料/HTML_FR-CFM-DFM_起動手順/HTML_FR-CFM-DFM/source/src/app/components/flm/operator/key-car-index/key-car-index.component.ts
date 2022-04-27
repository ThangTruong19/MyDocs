import {
  Component,
  OnInit,
  ChangeDetectorRef,
  TemplateRef,
  ViewChild,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import { OperatorCarIdKeyIndexCarIdParams } from '../../../../types/flm/operator';
import { ModalValues } from '../../../../types/common';

import { OperatorIdentificationKind, RegistrationStatusKind } from '../../../../constants/flm/operator';

import { KbaAbstractIndexComponent } from '../../../shared/kba-abstract-component/kba-abstract-index-component';
import { KbaSelectedComponent } from '../../../shared/kba-selected/kba-selected.component';

import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { OperatorService } from '../../../../services/flm/operator/operator.service';

@Component({
  selector: 'app-key-car-index',
  templateUrl: './key-car-index.component.html',
  styleUrls: [
    './key-car-index.component.scss',
    '../shared/car-index-kba-table-td.scss',
    '../shared/operator_identification_setting_modal.scss',
  ],
})
export class KeyCarIndexComponent extends KbaAbstractIndexComponent
  implements OnInit {
  @ViewChild('idKeySettingOnModalContent', { static: false })
  idKeySettingOnModalContent: TemplateRef<null>;
  @ViewChild('idKeySettingOffModalContent', { static: false })
  idKeySettingOffModalContent: TemplateRef<null>;
  @ViewChild('resetModalContent', { static: false })
  resetModalContent: TemplateRef<null>;
  @ViewChildren(KbaSelectedComponent) selectComponents: QueryList<
    KbaSelectedComponent
  >;

  initParams = {
    common: {
      customer: {},
      car_identification: {},
      customer_attribute: {},
    },
    car_operator_id_key: {},
  };
  subtitle: string;
  checkIdName = 'cars.car_identification.id';
  commaSeparated = [
    'common.car_identification.models',
    'common.car_identification.type_revs',
    'common.car_identification.serials',
    'common.car_identification.division_codes',
  ];
  stringParamList = [
    'common.target_car_group_id',
    'car_operator_id_key.registration_status_kind',
    'car_operator_id_key.operator_identification_kind',
  ];
  _searchParams: any;
  settingOnModalValues: ModalValues;
  settingOffModalValues: ModalValues;
  customerId: string;
  checkedItems: { [key: string]: boolean } = {};
  notSortingColumns = ['cars.car_operator.operator_identification_kind'];
  isOperatorAttentionVisible = false;

  settingOnModalPromise: Promise<void>;
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
    header: CommonHeaderService,
    modalService: KbaModalService,
    ref: ChangeDetectorRef,
    private operatorService: OperatorService
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
    this.operatorService.updateCarIdKeySearchCondition(
      this._createSearchCondition(this._searchParams, nestedKeys)
    );
    this.fetchList(this.sortingParams['sort']);
    this.checkedItems = {};
  }

  /**
   * 入力内容リセットコールバック
   *
   * 入力内容リセット確認モーダルを表示する。
   * 確認後、入力内容をリセットする。
   *
   * @param template 確認モーダル表示内容
   */
  onClickReset(template: TemplateRef<any>): void {
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      closeBtnLabel: this.labels.cancel,
      ok: () => {
        this.operatorService.initCarIdKeySearchCondition();
        this.params = _.cloneDeep(this.initParams);
        this.safeDetectChanges();
        this.selectComponents.forEach(sel => sel.resetAndEmit());
      },
    });
  }

  /**
   * IDキー設定一括ONボタン押下時の処理
   */
  onClickAllIdKeyOn(): void {
    this._openIdKeySettingOnModal(this.selectedList);
  }

  /**
   * IDキー設定一括OFFボタン押下時の処理
   */
  onClickAllIdKeyOff(): void {
    this._openIdKeySettingOffModal(this.selectedList);
  }

  /**
   * IDキー設定 ON/OFFボタン押下時の処理
   */
  onClickIdKey(idKeySettingKind: string, data: object): void {
    // ステータスが設定不可の場合は何もしない
    if (this.isIdKeySettingKindDisabled(data['cars.car_operator.registration_status_kind'])) {
      return;
    }

    if (idKeySettingKind === OperatorIdentificationKind.idKey) {
      this._openIdKeySettingOffModal([data['cars.car_identification.id']]);
    } else {
      this._openIdKeySettingOnModal([data['cars.car_identification.id']]);
    }
  }

  /**
   * 一覧のチェックボックスを非表示にするかどうかを返却します。
   * @return true:非表示にする/false:非表示にしない
   */
  checkBoxHidden(data: object): boolean {
    return this.isIdKeySettingKindDisabled(
      data['cars.car_operator.registration_status_kind']
    );
  }

  /**
   * IDキー設定が設定不可かどうかを返却します。
   * @param idKeySettingKind IDキー設定
   * @return true:無効/false:有効
   */
  isIdKeySettingKindDisabled(registrationStatusKind: string): boolean {
    return registrationStatusKind === RegistrationStatusKind.disabled;
  }

  /**
   * IDキー設定がONかどうかを返却します。
   * @param idKeySettingKind IDキー設定
   * @return true:ON/false:ON以外
   */
  isIdKeySettingKindOn(idKeySettingKind: string): boolean {
    return idKeySettingKind === OperatorIdentificationKind.idKey;
  }

  /**
   * 該当行がチェックされているかを返却します。
   * @param carId 車両識別ID
   * @return true: チェック済/ false: 未チェック
   */
  isChecked(carId: string): boolean {
    return _.includes(this.selectedList, carId);
  }

  /**
   * テーブル表示のためのデータを取得します。
   */
  async fetchList(sort_key?: string): Promise<void> {
    this.isFetching = true;
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    const res = await this.operatorService.fetchKeyCarIndexList(
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
   * 画面の初期化のために必要なデータを取得します。
   */
  protected async _fetchDataForInitialize(): Promise<void> {
    const res = await this.operatorService.fetchKeyCarInitData();
    this.initialize(res);
    this.params = _.cloneDeep(this.initParams);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this._reflectXFields(res.fields);
    this.thList = this._createThList(res.fields);
    this._setSearchCondition(res.searchCondition);
    this.sortableThList = this.sortableThLists(this.thList);
    this.safeDetectChanges();
    const nestedKeys = this._getNestedKeys(this.params);
    this._searchParams = this._buildSearchParams(nestedKeys);
  }

  protected _afterInitFetchList() {
    this.settingOnModalPromise = this._buildSettingOnModalValues();
    this.settingOffModalPromise = this._buildSettingOffModalValues();
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
   * 検索用のパラメータを作成
   * @param nestedKeys キー
   */
  private _buildSearchParams(nestedKeys: string[]) {
    return this._transrateSearchParams(this.params, nestedKeys);
  }

  /**
   * IDキー設定ON確認モーダルを開きます.
   */
  private async _openIdKeySettingOnModal(carIds: string[]): Promise<void> {
    if (this.settingOnModalValues == null) {
      this._showLoadingSpinner();
      await this.settingOnModalPromise;
      this._hideLoadingSpinner();
    }

    this.subtitle = this.labels.id_key_setting_attention;
    const res = await this.operatorService.fetchKeyCarIndexList(
      this._createFetchIndexListCarIdsParams(carIds),
      this.settingOnModalValues.requestHeaderParams
    );
    this.settingOnModalValues.listVal = this._formatList(
      res.result_data.cars,
      this.settingOnModalValues.listDesc
    );
    this.isOperatorAttentionVisible = this.settingOnModalValues.listVal.some(val =>
      this.isIdKeySettingKindOn(val['cars.car_operator.operator_identification_kind'])
    );

    this.modalService.open({
      title: this.labels.id_key_setting_on,
      labels: this.labels,
      content: this.idKeySettingOnModalContent,
      okBtnLabel: this.labels.id_key_setting_on_ok_label,
      closeBtnLabel: this.labels.cancel,
      ok: async () => {
        const resUpdate = await this.operatorService.updateOperatorIdentification(
          { car_ids: carIds }
        );
        this._resultModalOpen(
          this.labels.operator_id_setting_on_result_label,
          this.settingOnModalValues.listDesc,
          this.settingOnModalValues.listVal,
          resUpdate['responses'],
          () => {
            this._reloadList();
          },
          { size: 'lg' }
        );
      },
    });
  }

  /**
   * IDキー設定OFF確認モーダルを開きます.
   */
  private async _openIdKeySettingOffModal(carIds: string[]): Promise<void> {
    if (this.settingOffModalValues == null) {
      this._showLoadingSpinner();
      await this.settingOffModalPromise;
      this._hideLoadingSpinner();
    }

    this.subtitle = this.labels.id_key_setting_attention;
    const res = await this.operatorService.fetchKeyCarIndexList(
      this._createFetchIndexListCarIdsParams(carIds),
      this.settingOffModalValues.requestHeaderParams
    );
    this.settingOffModalValues.listVal = this._formatList(
      res.result_data.cars,
      this.settingOffModalValues.listDesc
    );

    this.isOperatorAttentionVisible = this.settingOffModalValues.listVal.some(val =>
      !this.isIdKeySettingKindOn(val['cars.car_operator.operator_identification_kind'])
    );

    this.modalService.open({
      title: this.labels.id_key_setting_off,
      labels: this.labels,
      content: this.idKeySettingOffModalContent,
      okBtnLabel: this.labels.id_key_setting_off_ok_label,
      closeBtnLabel: this.labels.cancel,
      ok: async () => {
        const resDisable = await this.operatorService.disableOperatorIdentification(
          { car_id: carIds }
        );
        this._resultModalOpen(
          this.labels.operator_id_setting_off_result_label,
          this.settingOffModalValues.listDesc,
          this.settingOffModalValues.listVal,
          resDisable['responses'],
          () => {
            this._reloadList();
          },
          { size: 'lg' }
        );
      },
    });
  }

  /**
   * 車両ID指定の車両オペレータ識別設定(IDキー)一覧/詳細取得APIリクエストパラメータ作成
   * @param carIds 車両ID
   */
  private _createFetchIndexListCarIdsParams(
    carIds: string[]
  ): OperatorCarIdKeyIndexCarIdParams {
    let _params = { common: { car_identification: { car_ids: carIds } } };
    if (this.exists('common.customer.ids')) {
      _params = _.merge(_params, {
        common: { customer: { ids: [this.customerId] } },
      });
    }
    return _params;
  }

  /**
   * 設定ONモーダル用ヘッダ項目生成
   */
  private _buildSettingOnModalValues() {
    return new Promise<void>(async (resolve) => {
      const res = await this.operatorService.fetchKeyCarIndexSettingOnFields();
      this.settingOnModalValues = this._getModalValues(res);
      resolve();
    });
  }

  /**
   * 設定OFFモーダル用ヘッダ項目生成
   */
  private _buildSettingOffModalValues() {
    return new Promise<void>(async (resolve) => {
      const res = await this.operatorService.fetchKeyCarIndexSettingOffFields();
      this.settingOffModalValues = this._getModalValues(res);
      resolve();
    });
  }
}
