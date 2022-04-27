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

import { AreaMenu, Others } from '../../../../types/flm/group-area';
import { Fields } from '../../../../types/common';
import { RequestHeaderParams } from '../../../../types/request';
import { SearchItems } from '../../../../types/search';

import { OptionKind } from '../../../../constants/flm/group-area';
import { FilterReservedWord } from '../../../../constants/condition';
import { FunctionCode } from '../../../../constants/flm/function-codes/area-management';
import { AreaType } from '../../../../constants/flm/group-area';
import { ResourceType } from '../../../../constants/resource-type';

import { KbaAbstractIndexComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-index-component';
import { KbaCarSearchComponent } from '../../../shared/kba-car-search/kba-car-search.component';
import { KbaTableComponent } from '../../../shared/kba-table/kba-table.component';
import { KbaAreaMapComponent } from '../../../shared/kba-area/kba-area-map.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { GroupAreaService } from '../../../../services/flm/group-area/group-area.service';

@Component({
  selector: 'app-group-area-car-index',
  templateUrl: './car-index.component.html',
  styleUrls: ['./car-index.component.scss'],
})
export class GroupAreaCarIndexComponent extends KbaAbstractIndexComponent
  implements OnInit {
  @ViewChild('resetModalContent', { static: false })
  resetModalContent: TemplateRef<null>;
  @ViewChild('mapModalContent', { static: false }) mapModalContent: TemplateRef<
    null
  >;
  @ViewChild(KbaCarSearchComponent, { static: false })
  carSearchComponent: KbaCarSearchComponent;
  @ViewChild(KbaTableComponent, { static: false })
  kbaTableComponent: KbaTableComponent;
  @ViewChild('areaMapComponent', { static: false })
  areaMapComponent: KbaAreaMapComponent;

  listCollapsed = true;
  optionalTableColumn = [
    { path: 'header_map', sortable: false, optional: true, control_code: '1' },
  ];
  fieldSelectPopoverVisible = false;
  fields: Fields;
  unitePattern = /cars\.areas\.(label|no):(\d)/;
  fixedThList;
  unitedFixedThList;
  scrollableThList;
  selectType: string;
  selectTypeLabel: string;
  params;
  activeTab: 'targetCar' | 'identifier' | 'belongs' | 'attributes';
  modelCarTypeCheck = false;
  initParams = {
    common: {
      customer: {},
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
  };
  initResource;
  menuOpen = false;
  areaMenu: AreaMenu[];
  currentMenuItem: AreaMenu;
  stringParamList = [
    'common.target_car_group_id',
    'common.distributor_attribute.note_1',
    'common.distributor_attribute.note_2',
    'common.distributor_attribute.note_3',
    'common.distributor_attribute.note_4',
    'common.distributor_attribute.note_5',
    'common.distributor_attribute.new_used_kind',
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
  others: Others;
  allAreas: Others;
  _searchParams;
  paramsPaths: string[];
  searchResource: any;
  mapHeader: RequestHeaderParams;
  multiLineColumns = [
    'cars.areas.label:1',
    'cars.areas.label:2',
    'cars.areas.label:3',
  ];
  hiddenItemStyles = {
    width: '100px',
    minWidth: '100px',
    flexShrink: '0',
    textAlign: 'left',
    wordWrap: 'break-word',
    whiteSpace: 'normal',
  };

  mapHeaderPromise: Promise<void>;
  fieldResourcesPromise: Promise<void>;

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    modalService: KbaModalService,
    private api: ApiService,
    private alertService: KbaAlertService,
    private groupAreaService: GroupAreaService
  ) {
    super(navigationService, title, router, ref, header, modalService);
  }

  async fetchList(sort_key?: string): Promise<void> {
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    this.isFetching = true;
    const p = _.cloneDeep(this._searchParams);
    _.unset(p, 'common.service_distributor.organization_codes');
    _.unset(p, 'common.support_distributor.organization_codes');
    const res = await this.groupAreaService.fetchCarIndexList(
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
  onClickSearch(): void {
    super.onClickSearch();
    const nestedKeys = this._getNestedKeys(this.params);
    this._searchParams = this._buildSearchParams(nestedKeys);
    this.searchResource = _.cloneDeep(this.resource);
    this.paramsPaths = this._getNestedKeys(this._searchParams);
    const keys = _.uniq(_.concat(_.values(this.selectorKeys), nestedKeys));
    this.groupAreaService.updateCarSearchCondition(
      this._createSearchCondition(this._searchParams, keys)
    );
    this.fetchList(this.sortingParams['sort']);
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
        this.groupAreaService.initCarSearchCondition();
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
  onChangeModelCarTypeCheck(): void {
    this.modelCarTypeCheck = !this.modelCarTypeCheck;
  }

  /**
   * 担当DB変更時の処理
   * @param supportDistributorIds 新しい担当DBのID
   */
  onChangeSupportDistributor(supportDistributorIds: string[]): void {
    this.groupAreaService
      .getBelongResource(supportDistributorIds, this.belongResourcePaths)
      .then(belongRes => {
        this._updateBelongResource(belongRes);
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
  onChangeSupportDbOrgCode(value: string): void {
    if (this.carSearchComponent) {
      this.carSearchComponent.refreshOrgCodeBelongSelector();
      this.safeDetectChanges();
    }
  }

  /**
   * サービスDB変更時の処理
   * @param value 新しいサービスDBのID
   */
  onChangeServiceDb(value: string): void {
    this._updateServiceDbOrgCode();
  }

  /**
   * サービスDB組織コード変更時の処理
   * @param value 新しいサービスDB組織コード
   */
  onChangeServiceDbOrgCode(value: string): void {
    this._updateServiceDb();
  }

  /**
   * 検索条件一覧の開閉コールバック
   * @param isCollapsed 開閉状態
   */
  changeListPanelState(isCollapsed: boolean): void {
    this.listCollapsed = isCollapsed;
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
    const fields = this._processUnitedFields(event.fields);
    this.api
      .updateField(FunctionCode.carListFunction, fields)
      .then((res: any) => {
        return new Promise(resolve => {
          this.api
            .fetchFields(FunctionCode.carListFunction)
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
   * @param data 対象データ
   */
  onClickEdit(data: object): void {
    this.router.navigate([
      'group_area/cars',
      data['cars.car_identification.id'],
      'edit',
    ]);
  }

  /**
   * MAPボタン押下コールバック
   * @param data 対象データ
   */
  async onClickMap(data: object) {
    if (this.mapHeader == null) {
      this._showLoadingSpinner();
      await this.mapHeaderPromise;
      this._hideLoadingSpinner();
    }

    const carId = data['cars.car_identification.id'];
    this._showLoadingSpinner();
    const res = await this.groupAreaService.fetchGroupAreaCar(
      carId,
      this.mapHeader
    );

    if (res.areas.length > 0) {
      this.areaMenu = this.groupAreaService.createAreaMenu(res.areas);
      this.allAreas = { areas: res.areas };
      this._changeArea(this.areaMenu[0]);
      _.merge(this.others, { cars: [res.car] });
    } else {
      this.areaMenu = [];
      this.currentMenuItem = {
        polyPoints: [],
        rectData: [],
        selectType: null,
        selectTypeLabel: null,
      } as any;
      this.allAreas = { areas: [] };
      _.merge(this.others, { cars: [res.car] });
    }

    setTimeout(() => {
      this._hideLoadingSpinner();
    }, 100);

    this.modalService.open(
      {
        title: this._getMapModalTitle(data),
        labels: this.labels,
        content: this.mapModalContent,
      },
      {
        size: 'xl',
        windowClass: 'map-modal',
      }
    );
  }

  /**
   * エリア変更コールバック
   * @param menuItem
   */
  onChangeArea(menuItem: AreaMenu): void {
    this._changeArea(menuItem);
  }

  /**
   * エリア番号の選択判定
   * @param no エリア番号
   */
  isCurrent(no: string): boolean {
    return this.currentMenuItem.no === no;
  }

  /**
   * 複数選択コンポーネントのパラメータを取得する
   */
  getSelectedParams() {
    return this.carSearchComponent
      ? this.carSearchComponent.getSelectedParams()
      : {};
  }

  /**
   * MAPのアイコンの表示制御を行う
   */
  mapIconHidden(item: any) {
    const carAreaNoFields = this.fields.filter(field =>
      /^cars\.areas\.no:\d+$/.test(field.path)
    );
    return carAreaNoFields.every(
      ({ path }) => item[path] == null || item[path] === ''
    );
  }

  protected async _fetchDataForInitialize(): Promise<void> {
    const res = await this.groupAreaService.fetchGroupAreaCarInitData();
    this.initialize(res);
    this.params = _.cloneDeep(this.initParams);
    this.labels = res.label;
    this.initResource = res.resource;
    this.resource = _.cloneDeep(this.initResource);
    this._setTitle();
    this.updatable = res.updatable;
    this.deletable = res.deletable;
    this._updateFields(res.fields);
    this._setSearchCondition(res.searchCondition);
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
    this.paramsPaths = _.concat(this._getNestedKeys(this._searchParams));
    this.safeDetectChanges();
  }

  protected _afterInitFetchList() {
    this.mapHeaderPromise = this._buildMapHeader();
    this.fieldResourcesPromise = this._buildFieldResources();
  }

  protected _listDisplayData(data, th) {
    let m;
    if (th.formatKey === 'support_distributor.sub_groups.label') {
      const subGroups = _.get(data, 'support_distributor.sub_groups');
      return _.map(subGroups, sg => sg.label).join('\n');
    } else if (
      th.formatKey === 'support_distributor.sub_groups.label_english'
    ) {
      const subGroups = _.get(data, 'support_distributor.sub_groups');
      return _.map(subGroups, sg => sg.label_english).join('\n');
    } else if ((m = /areas\.(label|no):(\d)/.exec(th.formatKey))) {
      return data['areas'] && data['areas'][+m[2] - 1]
        ? data['areas'][+m[2] - 1][m[1]]
        : '';
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
   * X-Fieldsを反映する
   * @override
   */
  protected _createXFields(fieldItems): string[] {
    return _.chain(fieldItems)
      .map(field => field.path.replace(/:\d+/, ''))
      .uniq()
      .value();
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
        this.groupAreaService
          .getBelongResource(
            selectCondition.supportDistributor,
            belongResourcePaths
          )
          .then(async belongRes => {
            this._updateBelongResource(belongRes);
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
   * 指定項目取得 API の結果を反映
   * @param fields 指定項目
   */
  private _updateFields(fields: Fields): void {
    this.fields = fields;
    this.thList = this._createThList(fields);
    const xFields = this._createXFields(fields);
    this.sortableThList = this.sortableThLists(this.thList);
    this._setXFields(xFields);
    const thLists = this._createThList(fields, { scrollable: true });
    this.fixedThList = thLists.fixed;
    this.unitedFixedThList = this._createUnitedThList(
      this.fixedThList,
      this.unitePattern
    );
    this.scrollableThList = thLists.scrollable;
  }

  /**
   * エリア選択変更処理
   * @param menuItem 選択したエリア
   */
  private _changeArea(menuItem: AreaMenu): void {
    this.currentMenuItem = menuItem;
    this.others = this._getOthers(this.currentMenuItem, this.allAreas);
    if (this.areaMapComponent) {
      this.areaMapComponent.changeNo();
    }
  }

  /**
   * 選択したエリア以外のエリアを他エリアとして返す
   * @param menuItem 選択したエリア
   * @param allAreas すべてのエリア
   */
  private _getOthers(menuItem: AreaMenu, allAreas: Others): Others {
    return { areas: _.filter(allAreas.areas, area => area.no !== menuItem.no) };
  }

  /**
   * 統合ヘッダリスト作成
   *
   * 2つのカラムを合わせて一つとするような場合に実施する。
   *
   * @param thList 一覧ヘッダ
   * @param unitePattern 統合するカラムのパターン
   * @return 統合ヘッダリスト
   */
  private _createUnitedThList(thList, unitePattern) {
    const result = [];
    const areaIndex = [];
    let m;
    let num;
    let type;

    _.each(thList, th => {
      if ((m = unitePattern.exec(th.name))) {
        type = m[1];
        num = +m[2] - 1;
        if (areaIndex[num]) {
          result[areaIndex[num]].unitedTh.push(th);
          if (!th.displayable) {
            result[areaIndex[num]].displayable = false;
          }
        } else {
          const label = this.labels[`car_area_${num + 1}`];
          areaIndex[num] = result.length;
          result.push({
            label,
            name: 'area',
            displayable: th.displayable,
            unitedTh: [th],
          });
        }
      } else {
        result.push(th);
      }
    });
    return result;
  }

  /**
   * 車両情報からマップモーダルのタイトルを取得
   * マップモーダルのタイトルは[機種-型式-機番]の型式となる。
   * @param data 車両情報
   */
  private _getMapModalTitle(data: any): string {
    const {
      'cars.car_identification.model': model,
      'cars.car_identification.type_rev': typeRev,
      'cars.car_identification.serial': serial,
    } = data;

    return `[${model}-${typeRev}-${serial}]`;
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
    this._updateBelongResource(this.initResource);
  }

  /**
   * 車両所属タブの担当DBに関連する各検索項目のリソースを更新する
   * @param belongRes 車両所属タブの各検索項目の新リソース
   */
  private _updateBelongResource(belongRes) {
    let r;
    _.each(this.belongResourcePaths, path => {
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
  private _updateServiceDb(): void {
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
  private _updateServiceDbOrgCode(): void {
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
   * 保存した検索条件に「機種-型式」項目が含まれているかのチェック
   * @param searchCondition 検索条件
   */
  private _isModelCarTypeCheck(searchCondition): boolean {
    return _.some(
      searchCondition,
      s => s.path === 'common.car_identification.model_type_revs'
    );
  }

  /**
   * 車両範囲-範囲名称の表示/非表示によって車両範囲-No.の表示/非表示を切り替える
   * @param fields 表示項目設定値
   */
  private _processUnitedFields(fields) {
    _.each(['1', '2', '3'], index => {
      const label = _.find(fields, f => f.path === 'cars.areas.label:' + index);
      const no = _.find(fields, f => f.path === 'cars.areas.no:' + index);
      if (label && !no) {
        const fieldNo = _.find(
          this.fields,
          f => f.path === 'cars.areas.no:' + index
        );
        fields.push({
          path: fieldNo.path,
          display_sequence_no: fieldNo.display_sequence_no,
        });
      } else if (!label && no) {
        _.remove(fields, f => f.path === 'cars.areas.no:' + index);
      }
    });
    return fields;
  }

  /**
   * MAP用ヘッダ情報生成
   */
  private _buildMapHeader() {
    return new Promise<void>(async (resolve) => {
      const res = await this.groupAreaService.fetchCarIndexMapFields();
      this.mapHeader = {
        'X-Fields': this._createXFields(res).join(','),
      };
      resolve();
    });
  }

  /**
   * 指定項目リソース取得
   */
  private _buildFieldResources() {
    return new Promise<void>(async (resolve) => {
      const res = await this.groupAreaService.fetchCarIndexFieldResources();
      this.fieldResources = res;
      resolve();
    });
  }
}
