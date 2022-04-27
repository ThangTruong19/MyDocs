import * as _ from 'lodash';
import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { ModalValues, Fields, TableHeader } from '../../../../types/common';
import { CarIdSearchParams } from '../../../../types/flm/car';
import { SearchItems } from '../../../../types/search';

import { KbaMimeType } from '../../../../constants/mime-types';
import { ResourceType } from '../../../../constants/resource-type';
import { FilterReservedWord } from '../../../../constants/condition';
import { ManagementTarget } from '../../../../constants/flm/car';
import { FunctionCode } from '../../../../constants/flm/function-codes/car-management';
import { ProcessingType } from '../../../../constants/download';

import { KbaCarSearchComponent } from '../../../shared/kba-car-search/kba-car-search.component';
import { KbaAbstractIndexComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-index-component';
import { KbaTableComponent } from '../../../shared/kba-table/kba-table.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CarService } from '../../../../services/flm/car/car.service';
import { ApiService } from '../../../../services/api/api.service';

@Component({
  selector: 'app-car-index',
  templateUrl: './car-index.component.html',
  styleUrls: ['./car-index.component.scss'],
})
export class CarIndexComponent extends KbaAbstractIndexComponent
  implements OnInit {
  @ViewChild('resetModalContent', { static: false })
  resetModalContent: TemplateRef<null>;
  @ViewChild('deleteModalContent', { static: false })
  deleteModalContent: TemplateRef<null>;
  @ViewChild(KbaCarSearchComponent, { static: false })
  carSearchComponent: KbaCarSearchComponent;
  @ViewChild(KbaTableComponent, { static: false })
  kbaTableComponent: KbaTableComponent;

  listCollapsed = true;
  activeTab: 'targetCar' | 'identifier' | 'belongs' | 'attributes' | 'settings';
  modelCarTypeCheck = false;
  initResource;
  initParams = {
    common: {
      customer_attribute: {
        customer_management_no: '',
        customer_car_no: '',
      },
      car_identification: {
        models: '',
        type_revs: '',
        model_type_revs: '',
        serials: '',
      },
      support_distributor: {},
      service_distributor: {},
      distributor_attribute: {
        note_1: '',
        note_2: '',
        note_3: '',
        note_4: '',
        note_5: '',
      },
    },
    car_management: {
      time_difference: '',
    },
  };
  _searchParams;
  fields: Fields;
  downloadFieldPaths: string[];
  fieldSelectPopoverVisible = false;
  fixedThList: TableHeader[];
  scrollableThList: TableHeader[];
  checkIdName = 'cars.car_identification.id';
  lineBreakColumns = [
    'cars.user_permission.sub_groups_label',
    'cars.user_permission.sub_groups_label_english',
  ];
  commaSeparated = [
    'common.car_identification.models',
    'common.car_identification.type_revs',
    'common.car_identification.serials',
    'common.car_identification.model_type_revs',
    'common.car_identification.division_codes',
    'common.customer.ids',
    'common.user_submission_subgroup_ids',
    'common.support_distributor.ids',
  ];
  stringParamList = [
    'common.target_car_group_id',
    'common.distributor_attribute.note_1',
    'common.distributor_attribute.note_2',
    'common.distributor_attribute.note_3',
    'common.distributor_attribute.note_4',
    'common.distributor_attribute.note_5',
    'car_management.time_difference',
    'common.distributor_attribute.new_used_kind',
  ];
  selectorKeys = {
    supportDistributor: 'common.support_distributor.ids',
    subGroup: 'common.user_permission_sub_group_ids',
    customer: 'common.customer.ids',
  };
  belongResourcePaths = [
    'common.customer.ids',
    'common.bank_ids',
    'common.insurance_ids',
    'common.finance_ids',
    'common.distributor_attribute.class_1_ids',
    'common.distributor_attribute.class_2_ids',
    'common.distributor_attribute.class_3_ids',
    'common.distributor_attribute.class_4_ids',
    'common.distributor_attribute.class_5_ids',
    'common.distributor_attribute.custom_car_attribute_1_detail_ids',
    'common.distributor_attribute.custom_car_attribute_2_detail_ids',
    'common.distributor_attribute.custom_car_attribute_3_detail_ids',
    'common.distributor_attribute.custom_car_attribute_4_detail_ids',
    'common.distributor_attribute.custom_car_attribute_5_detail_ids',
    'common.distributor_attribute.custom_car_attribute_6_detail_ids',
    'common.distributor_attribute.custom_car_attribute_7_detail_ids',
    'common.distributor_attribute.custom_car_attribute_8_detail_ids',
    'common.distributor_attribute.custom_car_attribute_9_detail_ids',
    'common.distributor_attribute.custom_car_attribute_10_detail_ids',
  ];
  supportDbBelongPaths: string[];
  supportDbOrgCodeBelongPahts: string[];
  initList: any[] = [];
  listDesc: string[];
  listVal: string[];
  deleteModalValues: ModalValues;
  batchDeleteLimit: number;
  checkedItems: { [key: string]: boolean } = {};
  enableDeleteFunctionCode = 'flm_car_mgt_list_delete_function';

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
    private api: ApiService
  ) {
    super(navigationService, title, router, ref, header, modalService);
    this.supportDbBelongPaths = this.belongResourcePaths;
    this.supportDbOrgCodeBelongPahts = this.belongResourcePaths;
    this.batchDeleteLimit = (window as any).settings.carBatchDeleteLimit;
  }

  async fetchList(sort_key?: string): Promise<void> {
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    this.isFetching = true;
    const p = _.cloneDeep(this._searchParams);
    _.unset(p, 'common.service_distributor.organization_codes');
    _.unset(p, 'common.support_distributor.organization_codes');
    const res = await this.carService.fetchCarIndexList(
      p,
      this.requestHeaderParams
    );
    const formatted = this._formatList(res.result_data.cars, this.thList);
    this._fillLists(res.result_header, formatted);
    this.isFetching = false;
    this._afterFetchList();
  }

  checkIdFunction = item => {
    return [
      'cars.car_identification.id',
      'cars.car_identification.update_datetime',
    ]
      .map(key => _.get(item, key))
      .join(',');
  }

  /**
   * 検索ボタン押下時の処理
   */
  onClickSearch() {
    super.onClickSearch();
    const nestedKeys = this._getNestedKeys(this.params);
    this._searchParams = this._buildSearchParams(nestedKeys);
    const keys = _.uniq(_.concat(_.values(this.selectorKeys), nestedKeys));
    this.carService.updateCarSearchCondition(
      this._createSearchCondition(this._searchParams, keys)
    );
    this.fetchList(this.sortingParams['sort']);
    this.checkedItems = {};
  }

  /**
   * リセット押下時の処理
   */
  onClickReset() {
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      closeBtnLabel: this.labels.cancel,
      ok: () => {
        this.carService.initCarSearchCondition();
        this._resetResource();
        this.params = _.cloneDeep(this.initParams);
        this.carSearchComponent.initAllSelectedParams();
        this.safeDetectChanges();
      },
    });
  }

  /**
   * 更新用テンプレート一括ダウンロードボタン押下時の処理
   */
  async onClickDownload() {
    this._showLoadingSpinner();

    try {
      const p = _.cloneDeep(this._searchParams);
      _.unset(p, 'common.service_distributor.organization_codes');
      _.unset(p, 'common.support_distributor.organization_codes');

      const res: any = await this.carService.createFile(
        _.merge({}, p, {
          file_create_condition: {
            processing_type: ProcessingType.sync,
            file_content_type: KbaMimeType.excel,
          },
        }),
        _.merge({}, this.requestHeaderParams, {
          'X-Fields': this.downloadFieldPaths,
        })
      );
      await this.api.downloadFile(res.result_data.file_id, KbaMimeType.excel);
    } finally {
      this._hideLoadingSpinner();
    }
  }

  /**
   * 担当DB変更時の処理
   * @param supportDistributorIds 新しい担当DBのID
   */
  onChangeSupportDistributor(supportDistributorIds: string[]) {
    this.carService
      .getSupportDbBelong(supportDistributorIds, this.supportDbBelongPaths)
      .then(belongRes => {
        this._updateBelongResource(belongRes, this.supportDbBelongPaths);
        this.safeDetectChanges();
        if (this.carSearchComponent) {
          this.carSearchComponent.params.common.support_distributor.organization_codes =
            supportDistributorIds.length === 1
              ? supportDistributorIds[0]
              : FilterReservedWord.selectAll;
          this.carSearchComponent.refreshBelongSelector();
          this.carSearchComponent.initBelongSelectedParams();
          this.safeDetectChanges();
        }
      });
  }

  /**
   * 担当DB組織コード変更時の処理
   * @param value 新しい担当DB組織コード
   */
  onChangeSupportDbOrgCode(value: string) {
    if (this.carSearchComponent) {
      this.carSearchComponent.refreshOrgCodeBelongSelector();
      this.safeDetectChanges();
    }
  }

  /**
   * サービスDB変更時の処理
   * @param value 新しいサービスDBのID
   */
  onChangeServiceDb(value: string) {
    this._updateServiceDbOrgCode();
  }

  /**
   * サービスDB組織コード変更時の処理
   * @param value 新しいサービスDB組織コード
   */
  onChangeServiceDbOrgCode(value: string) {
    this._updateServiceDb();
  }

  /**
   * 一括削除ボタン押下コールバック
   *
   * 一括削除APIをリクエストする
   */
  async onClickDeleteAll() {
    const res = await this.carService.fetchCarIndexList(
      this._carIdsParams(this.selectedList),
      this.deleteModalValues.requestHeaderParams
    );
    this.deleteModalValues.listVal = this._formatList(
      res.result_data.cars,
      this.deleteModalValues.listDesc
    );
    const deleteParams = this._createDeleteParams(this.selectedList);

    this._openDeleteConfirmModal(
      deleteParams,
      FunctionCode.bulkDeleteFunctioon
    );
  }

  /**
   * 検索条件一覧の開閉コールバック
   * @param isCollapsed 開閉状態
   */
  changeListPanelState(isCollapsed: boolean) {
    this.listCollapsed = isCollapsed;
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
   * 編集ボタン押下コールバック
   *
   * @param car 対象データ
   */
  onClickEdit(car) {
    if (this.editIconHidden(car)) {
      return;
    }

    this.router.navigate(['cars', car['cars.car_identification.id'], 'edit']);
  }

  /**
   * 削除ボタン押下コールバック
   *
   * 確認モーダルを表示し、確認後に変更APIをリクエストする。
   * リクエスト成功時にアラートメッセージを表示し、一覧を初期化する。
   *
   * @param car オペレータ
   */
  async onClickDelete(car) {
    if (this.deleteIconHidden(car)) {
      return;
    }

    const res = await this.carService.fetchCarIndexList(
      this._carIdsParams([car['cars.car_identification.id']]),
      this.deleteModalValues.requestHeaderParams
    );
    this.deleteModalValues.listVal = this._formatList(
      res.result_data.cars,
      this.deleteModalValues.listDesc
    );
    const deleteParams = this._createDeleteParamsFromListItem([car]);

    this._openDeleteConfirmModal(deleteParams);
  }

  /**
   * 「機種-型式で入力する」チェックボックス変更時の処理
   */
  onChangeModelCarTypeCheck() {
    this.modelCarTypeCheck = !this.modelCarTypeCheck;
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
   * カラムが改行を含むかの判定
   * @param name カラム名
   */
  isLineBreak(name: string): boolean {
    return this.lineBreakColumns.includes(name);
  }

  /**
   * チェックボックスを非表示にするかどうかを返却します。
   * @return true:非表示/false:表示
   */
  checkBoxHidden(data: object[]): boolean {
    return (
      data['cars.user_permission.management_target_code'] !==
      ManagementTarget.all
    );
  }

  /**
   * 変更アイコンを非表示にするかどうかを返却します。
   * @return true:非表示/false:表示
   */
  editIconHidden(data: object[]): boolean {
    return (
      data['cars.user_permission.management_target_code'] !==
      ManagementTarget.all &&
      data['cars.user_permission.management_target_code'] !==
      ManagementTarget.subGroup
    );
  }

  /**
   * 削除アイコンを非表示にするかどうかを返却します。
   * @return true:非表示/false:表示
   */
  deleteIconHidden(data: object[]): boolean {
    return (
      data['cars.user_permission.management_target_code'] !==
      ManagementTarget.all
    );
  }

  /**
   * チェックボックスを表示する項目の配列を取得する
   */
  getCheckableList(list: any[]) {
    return list.filter(item => !this.checkBoxHidden(item));
  }

  /**
   * 複数選択コンポーネントのパラメータを取得する
   */
  getSelectedParams() {
    return this.carSearchComponent
      ? this.carSearchComponent.getSelectedParams()
      : {};
  }

  protected async _fetchDataForInitialize(): Promise<void> {
    const res = await this.carService.fetchCarInitData();
    this.initialize(res);
    this.params = _.cloneDeep(this.initParams);
    this.labels = res.label;
    this.initResource = res.resource;
    this.resource = _.cloneDeep(this.initResource);
    this._setTitle();
    this.updatable = res.updatable;
    if (this.functions.find(f => f.code === this.enableDeleteFunctionCode)) {
      const deleteFields = await new Promise(resolve =>
        this.api
          .fetchFields(FunctionCode.listDeleteFunction)
          .subscribe(_res => resolve(_res))
      );
      this.deleteModalValues = this._getModalValues(deleteFields);
      this.deletable = res.deletable;
    }
    this.selectable = this.deletable;
    this.fieldResources = res.fieldResources;
    this._updateFields(res.fields);
    this._setSearchCondition(res.searchCondition);
    this.downloadFieldPaths = _.map(res.downloadFields, 'path');
    this.safeDetectChanges();
    const selectCondition = this._getSelectCondition(res.searchCondition);
    await this._processSupportDistributorBelongs(
      this.resource,
      selectCondition,
      this.supportDbBelongPaths
    );
    this.activeTab = 'targetCar';
    if (this._isModelCarTypeCheck(res.searchCondition)) {
      this.modelCarTypeCheck = true;
    }
    const nestedKeys = this._getNestedKeys(this.params);
    this._searchParams = this._buildSearchParams(nestedKeys);
    this.safeDetectChanges();
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
   * 担当DBに依存するリソースの処理
   * @param resource リソース
   * @param selectCondition 検索条件
   * @param belongResourcePaths 担当DBに依存するリソースのパス
   */
  private _processSupportDistributorBelongs(
    resource,
    selectCondition,
    belongResourcePaths
  ) {
    return new Promise(async resolve => {
      if (
        _.has(resource, 'common.support_distributor.ids') &&
        !_.isEmpty(selectCondition.supportDistributor)
      ) {
        this.carService
          .getSupportDbBelong(
            selectCondition.supportDistributor,
            belongResourcePaths
          )
          .then(async belongRes => {
            this._updateBelongResource(belongRes, this.supportDbBelongPaths);
            this.carSearchComponent.refreshBelongSelector();
            await this.carSearchComponent.setSelectedParams(selectCondition);
            resolve();
          });
      } else {
        await this.carSearchComponent.setSelectedParams(selectCondition);
        resolve();
      }
    });
  }

  /**
   * 削除確認モーダルを開きます.
   */
  private _openDeleteConfirmModal(params, screenCode?: string) {
    this.modalService.open({
      title: this.labels.delete_modal_body,
      labels: this.labels,
      content: this.deleteModalContent,
      okBtnLabel: this.labels.delete,
      okBtnClass: 'btn-delete',
      closeBtnLabel: this.labels.cancel,
      ok: () => {
        this.carService.deleteCars(params, screenCode).then(res => {
          this._resultModalOpen(
            this.labels.delete_result_label,
            this.deleteModalValues.listDesc,
            this.deleteModalValues.listVal,
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
   * 削除用のパラメータを作成する
   * @param cars 車両の配列
   */
  private _createDeleteParams(selectedList: string[]) {
    return {
      car: selectedList,
    };
  }

  private _createDeleteParamsFromListItem(cars) {
    return {
      car: cars.map(
        car =>
          `${car['cars.car_identification.id']},${car['cars.car_identification.update_datetime']}`
      ),
    };
  }

  /**
   * 指定項目取得 API の結果を反映
   * @param fields 指定項目
   */
  private _updateFields(fields: Fields) {
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
   * 保存状態の検索条件から、選択ボックス（種別あり）の選択値を取得する
   * @param searchCondition 保存状態の検索条件
   * @return 選択ボックス（種別あり）の選択値
   */
  private _getSelectCondition(searchCondition): any {
    const result = {};
    _.each(this.selectorKeys, (path, key) => {
      const condition = _.find(searchCondition, con => con.path === path);
      if (condition) {
        result[key] = condition.value;
      }
    });
    return result;
  }

  /**
   * リソースを初期状態に戻す
   *
   * リソースの初期状態は画面表示時に取得したリソースとなる。
   * リソースの変更が発生するのは「車両所属」タブ内の検索項目で、担当DBやサービスDB、
   * サービスDB組織コードを変更することで、対応するリソースに変更する。
   */
  private _resetResource() {
    const resourcePahts = _.concat(this.belongResourcePaths, [
      'common.support_distributor.organization_codes',
      'common.support_distributor.ids',
    ]);
    this._updateBelongResource(this.initResource, resourcePahts);
  }

  /**
   * 車両所属タブの担当DBに関連する各検索項目のリソースを更新する
   * @param belongRes 車両所属タブの各検索項目の新リソース
   */
  private _updateBelongResource(belongRes, belongPaths) {
    let r;
    belongPaths.forEach(path => {
      if ((r = _.get(belongRes, path))) {
        _.set(this.resource, path, r);
      } else {
        _.unset(this.resource, path);
        _.unset(this.params, path);
      }
    });
  }

  /**
   * サービスDBのリソースを更新する
   * @param res サービスDBの新リソース
   */
  private _updateServiceDb() {
    if (!this.carSearchComponent) {
      return;
    }

    this.params.common.service_distributor.ids = this.carSearchComponent.params.common.service_distributor.organization_codes;
    this.carSearchComponent.refreshServiceDistributor();
    this.safeDetectChanges();
  }

  /**
   * サービスDB組織コードのリソースを更新する
   * @param res サービスDB組織コードの新リソース
   */
  private _updateServiceDbOrgCode() {
    if (
      !this.carSearchComponent ||
      !this.exists('common.service_distributor.organization_codes')
    ) {
      return;
    }

    this.carSearchComponent.params.common.service_distributor.organization_codes = this.params.common.service_distributor.ids;
    this.carSearchComponent.refreshOrganizationCodes();
    this.safeDetectChanges();
  }

  /**
   * 検索用のパラメータを作成
   * @param nestedKeys キー
   */
  private _buildSearchParams(nestedKeys: string[]) {
    const p = this._transrateSearchParams(this.params, nestedKeys);
    if (this.modelCarTypeCheck) {
      _.each(
        [
          'common.car_identification.models',
          'common.car_identification.type_revs',
        ],
        key => _.unset(p, key)
      );
    } else {
      _.unset(p, 'common.car_identification.model_type_revs');
    }
    return this._addSelectParams(
      p,
      this.carSearchComponent.getSelectedParams()
    );
  }

  /**
   * 検索パラメータに選択ボックス（種別あり）のパラメータを追加する
   * @param searchParams 検索パラメータ
   * @param selectParams 選択ボックス（種別あり）のパラメータ
   */
  private _addSelectParams(searchParams, selectParams) {
    const p = {};
    _.each(selectParams, (value, type) => {
      const key = this.selectorKeys[type];

      _.set(p, key, value);
    });

    const customizer = (current, incoming) => {
      if (_.isArray(current) && _.isArray(incoming)) {
        return incoming;
      }
    };

    return _.mergeWith({}, searchParams, p, customizer);
  }

  /**
   * 「機種-型式で入力する」のチェック判定
   * @param searchCondition 検索条件
   */
  private _isModelCarTypeCheck(searchCondition) {
    return _.find(
      searchCondition,
      s => s.path === 'common.car_identification.model_type_revs'
    );
  }

  /**
   * 車両一覧取得パラメータの作成
   * @param carIds 車両ID
   */
  private _carIdsParams(checkKey: string[]): CarIdSearchParams {
    return {
      common: {
        car_identification: {
          car_ids: checkKey.map(key => key.replace(/,.+$/, '')),
        },
      },
    };
  }
}
