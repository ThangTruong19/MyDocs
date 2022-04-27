import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import { Api, Fields, TableHeader } from '../../../../types/common';

import { FunctionCode } from '../../../../constants/flm/function-codes/smr-interval-item-management';
import { ResourceType } from '../../../../constants/resource-type';
import { SvmNotManagement } from '../../../../constants/flm/smr-interval';
import { FilterReservedWord } from '../../../../constants/condition';
import { ProcessingType } from '../../../../constants/download';

import { KbaTableComponent } from '../../../shared/kba-table/kba-table.component';
import { KbaCarSearchComponent } from '../../../shared/kba-car-search/kba-car-search.component';
import { KbaAbstractIndexComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-index-component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { SmrIntervalService } from '../../../../services/flm/smr-interval/smr-interval.service';

@Component({
  selector: 'app-smr-interval-car-index',
  templateUrl: './smr-interval-car-index.component.html',
  styleUrls: ['./smr-interval-car-index.component.scss'],
})
export class SmrIntervalCarIndexComponent extends KbaAbstractIndexComponent
  implements OnInit {
  @ViewChild('resetModalContent', { static: false })
  resetModalContent: TemplateRef<null>;
  @ViewChild('mapModalContent', { static: false })
  mapModalContent: TemplateRef<null>;
  @ViewChild(KbaCarSearchComponent, { static: false })
  carSearchComponent: KbaCarSearchComponent;
  @ViewChild(KbaTableComponent, { static: false })
  kbaTableComponent: KbaTableComponent;

  listCollapsed = true;
  fieldSelectPopoverVisible = false;
  downloadPopoverVisible = false;
  fields: Fields;
  downloadFields: Fields;
  downloadFieldResources: Fields;
  fixedThList: TableHeader[];
  scrollableThList: TableHeader[];
  selectType: string;
  selectTypeLabel: string;
  modelCarTypeCheck = false;
  activeTab:
    | 'targetCar'
    | 'identifier'
    | 'belongs'
    | 'attributes'
    | 'settings'
    | 'smr-settings';
  _searchParams: any;

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
    smr_interval_item: {
      id: '',
    },
  };
  initResource;

  menuOpen = false;
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
    'smr_interval_item.id',
    'common.distributor_attribute.new_used_kind',
  ];
  xFields: string[];
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
    'smr_interval_item.id',
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
  lineBreakColumns = [
    'cars.smr_interval_items.management_item_name',
    'cars.user_permission.sub_groups_label',
    'cars.user_permission.sub_groups_label_english',
  ];
  supportDbBelongPaths: string[];
  supportDbOrgCodeBelongPahts: string[];

  paramsPaths: string[];
  searchResource: any;
  notSortingColumns = ['cars.smr_interval_items.management_item_name'];

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    modalService: KbaModalService,
    private api: ApiService,
    private alertService: KbaAlertService,
    private smrIntervalService: SmrIntervalService
  ) {
    super(navigationService, title, router, ref, header, modalService);
    this.supportDbBelongPaths = this.belongResourcePaths;
    this.supportDbOrgCodeBelongPahts = this.belongResourcePaths;
  }

  async fetchList(sort_key?: string): Promise<any> {
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    this.isFetching = true;
    const p = _.cloneDeep(this._searchParams);
    _.unset(p, 'common.service_distributor.organization_codes');
    _.unset(p, 'common.support_distributor.organization_codes');
    const res = await this.smrIntervalService.fetchCarsSmrIntervalItems(
      p,
      this.requestHeaderParams
    );
    const formatted = this._formatList(res.result_data.cars, this.thList);
    this._fillLists(res.result_header, formatted);
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * 検索ボタン押下時の処理
   */
  onClickSearch() {
    super.onClickSearch();
    const nestedKeys = this._getNestedKeys(this.params);
    this._searchParams = this._buildSearchParams(nestedKeys);
    this.searchResource = _.cloneDeep(this.resource);
    this.paramsPaths = this._getNestedKeys(this._searchParams);
    const keys = _.uniq(_.concat(_.values(this.selectorKeys), nestedKeys));
    this.smrIntervalService.updateCarSearchCondition(
      this._createSearchCondition(this._searchParams, keys)
    );
    this.fetchList(this.sortingParams['sort']);
  }

  /**
   * リセット押下時の処理
   */
  onClickReset() {
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      ok: () => {
        this.smrIntervalService.initCarSearchCondition();
        this._resetResource();
        this.params = _.cloneDeep(this.initParams);
        this.carSearchComponent.initAllSelectedParams();
        this.safeDetectChanges();
      },
    });
  }

  /**
   * 「機種-型式で入力する」チェックボックス変更時の処理
   */
  onChangeModelCarTypeCheck() {
    this.modelCarTypeCheck = !this.modelCarTypeCheck;
  }

  /**
   * カラムが改行を含むかの判定
   * @param name カラム名
   */
  isLineBreak(name: string): boolean {
    return this.lineBreakColumns.includes(name);
  }

  /**
   * 検索条件一覧の開閉コールバック
   * @param isCollapsed 開閉状態
   */
  changeListPanelState(isCollapsed: boolean) {
    this.listCollapsed = isCollapsed;
  }

  /**
   * 担当DB変更時の処理
   * @param supportDistributorIds 新しい担当DBのID
   */
  onChangeSupportDistributor(supportDistributorIds: string[]) {
    this.smrIntervalService
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
      .updateField(FunctionCode.carListFunction, event.fields)
      .then((res: any) => {
        return new Promise(resolve => {
          this.api
            .fetchFields(FunctionCode.carListFunction)
            .subscribe(_res => resolve(_res));
        });
      })
      .then((res: any) => {
        this._updateFields(res);
        const thLists = this._createThList(res, { scrollable: true });
        this.fixedThList = thLists.fixed;
        this.scrollableThList = thLists.scrollable;
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
  async onDownloadOk(event): Promise<void> {
    await this.api.updateField(
      FunctionCode.carListDownloadFunction,
      event.fields
    );
    this._downloadTemplate(event.fields.map(f => f.path), event.fileType);
  }

  /**
   * 編集ボタン押下コールバック
   * @param data 対象データ
   */
  onClickEdit(item) {
    if (!this.editIconHidden(item)) {
      const car_id = item['cars.car_identification.id'];
      this.router.navigate(['smr_interval/cars', car_id, 'edit']);
    }
  }

  /**
   *  変更アイコンを非表示にするかどうかを返却します。
   * @return true:非表示/false:表示
   */
  editIconHidden(data: object[]): boolean {
    return (
      data['cars.interval_management.service_target_kind'] ===
      SvmNotManagement.on
    );
  }

  /**
   * 複数選択コンポーネントのパラメータを取得する
   */
  getSelectedParams() {
    return this.carSearchComponent
      ? this.carSearchComponent.getSelectedParams()
      : {};
  }

  protected async _fetchDataForInitialize(): Promise<any> {
    const res = await this.smrIntervalService.fetchSmrIntervalCarIndexInitData();
    this.initialize(res);
    this.params = _.cloneDeep(this.initParams);
    this.labels = res.label;
    this.initResource = res.resource;
    this.resource = _.cloneDeep(this.initResource);
    this._setTitle();
    this.updatable = res.updatable;
    this.fieldResources = res.fieldResources;
    this.downloadFields = res.downloadFields;
    this.downloadFieldResources = res.downloadFieldResources;
    this._updateFields(res.fields);
    this._setSearchCondition(res.searchCondition);
    const thLists = this._createThList(res.fields, { scrollable: true });
    this.fixedThList = thLists.fixed;
    this.scrollableThList = thLists.scrollable;
    this.safeDetectChanges();
    const selectCondition = this._getSelectCondition(res.searchCondition);
    await this._processSupportDistributorBelongs(
      this.resource,
      selectCondition,
      this.belongResourcePaths
    );
    this.activeTab = 'targetCar';
    if (this._isModelCarTypeCheck(res.searchCondition)) {
      this.modelCarTypeCheck = true;
    }
    const nestedKeys = this._getNestedKeys(this.params);
    this._searchParams = this._buildSearchParams(nestedKeys);
    this.searchResource = _.cloneDeep(this.resource);
    this.paramsPaths = this._getNestedKeys(this._searchParams);
    this.safeDetectChanges();
  }

  /**
   * 取得した検索条件データを検索欄にセットする
   *
   * 検索条件データと検索欄データの対応付けは変換用テーブルを使用する。
   *
   * @param searchItems 検索条件データ
   */
  protected _setSearchCondition(
    searchItems: { path: string; value: string[] }[]
  ) {
    _.each(searchItems, item => {
      const valueStr = _.join(item.value, ',');
      _.set(this.params, item.path, valueStr);
    });
  }

  /**
   * 検索欄データの値を配列形式に変換する
   * @param 検索欄データ
   */
  protected _transrateSearchParams(params, nestedKeys) {
    const result = {};
    let value;
    _.each(nestedKeys, path => {
      if ((value = _.get(params, path))) {
        if (_.includes(this.commaSeparated, path)) {
          _.set(result, path, _.split(value, ','));
        } else if (_.includes(this.stringParamList, path)) {
          _.set(result, path, value);
        } else {
          _.set(result, path, [value]);
        }
      }
    });
    return result;
  }

  /**
   * 車両毎SMRインターバル管理項目APIでSMR管理項目とサブグループが配列で返ってくるため一覧用にデータを整形する
   * @param data 対象のデータ
   * @param th 対象のヘッダー
   */
  protected _listDisplayData(data, th) {
    if (th.formatKey === 'smr_interval_items.management_item_name') {
      const smrIntervalItems = _.get(data, 'smr_interval_items');
      return smrIntervalItems.map(sg => sg.management_item_name);
    } else {
      return _.get(data, th.formatKey);
    }
  }

  /**
   * リソース値の名称取得
   *
   * リソースパスで指定したリソースについて、値に対応する名前を取得する。
   *
   * @param path リソースのパス
   * @param value 値
   */
  protected _getResourceValueName(path: string, value: string): string {
    const res = _.get(this.searchResource, path);
    if (res) {
      const v = _.find(res.values, item => item.value === value);
      return v ? v.name : '';
    } else {
      return '';
    }
  }

  /**
   * 検索パラメータに選択ボックス（種別あり）のパラメータを追加する
   * @param _searchParams 検索パラメータ
   * @param selectParams 選択ボックス（種別あり）のパラメータ
   */
  private _addSelectParams(_searchParams, selectParams) {
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

    return _.mergeWith({}, _searchParams, p, customizer);
  }

  /**
   * テンプレートダウンロード
   * @param fields ダウンロード対象項目
   * @param accept ダウンロード形式
   */
  private async _downloadTemplate(fields, accept) {
    const header = _.clone(this.requestHeaderParams);
    header['X-Sort'] = this.sortingParams['sort'];
    header['X-Fields'] = fields;
    this._showLoadingSpinner();
    try {
      const p = _.cloneDeep(this._searchParams);
      _.unset(p, 'common.service_distributor.organization_codes');
      _.unset(p, 'common.support_distributor.organization_codes');

      const res = await this.smrIntervalService.createCarFile(
        {
          ...p,
          file_create_condition: {
            file_content_type: accept,
            processing_type: ProcessingType.sync,
          },
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
    const xFields = this._createXFields(fields);
    this.sortableThList = this.sortableThLists(this.thList);
    this._setXFields(xFields);
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
        this.smrIntervalService
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
    _.each(belongPaths, path => {
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

    this.params.common.service_distributor.organization_codes = this.carSearchComponent.params.common.service_distributor.ids;
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
}
