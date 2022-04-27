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

import { OptionKind } from '../../../../constants/flm/group-area';
import { AccessType, AreaType } from '../../../../constants/flm/group-area';
import { ModalValues, Fields } from '../../../../types/common';
import {
  MapDependedHeader,
  Others,
  PolyPoints,
  RectData,
} from '../../../../types/flm/group-area';

import { KbaAbstractIndexComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-index-component';
import { KbaAreaMapComponent } from '../../../shared/kba-area/kba-area-map.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { GroupAreaService } from '../../../../services/flm/group-area/group-area.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';
import { ApiService } from '../../../../services/api/api.service';

@Component({
  selector: 'app-group-area-index',
  templateUrl: './group-area-index.component.html',
  styleUrls: ['./group-area-index.component.scss'],
})
export class GroupAreaIndexComponent extends KbaAbstractIndexComponent
  implements OnInit {
  @ViewChild('deleteModalContent', { static: false })
  deleteModalContent: TemplateRef<null>;
  @ViewChild('mapModalContent', { static: false }) mapModalContent: TemplateRef<
    null
  >;
  @ViewChild('modalMap', { static: false }) modalMap: KbaAreaMapComponent | undefined;

  optionalTableColumn = ['header_map'];
  optionKind = OptionKind;
  polyPoints: PolyPoints;
  rectData: RectData;
  others: Others;
  selectType: string;
  selectTypeLabel: string;
  unitedThList;
  uniteColumns = [
    'group_areas.edit_feature.properties.east_west_distance',
    'group_areas.edit_feature.properties.north_south_distance',
  ];
  updateRequiredColumns = [
    'group_areas.no',
    'group_areas.label',
    'group_areas.description',
    'group_areas.active_status_kind',
    'group_areas.notification_kind',
    'group_areas.update_datetime',
  ];
  menuOpen = false;
  unit: string;
  deleteModalValues: ModalValues;
  mapDependedHeader: MapDependedHeader;
  areaNo: string;
  carIconHeader: any;
  cars: any[] | null = null;

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    modalService: KbaModalService,
    private alertService: KbaAlertService,
    private groupAreaService: GroupAreaService,
    private userSettingService: UserSettingService,
    private api: ApiService
  ) {
    super(navigationService, title, router, ref, header, modalService);
  }

  async fetchList(sort_key?: string): Promise<void> {
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    this.isFetching = true;
    const res = await this.groupAreaService.fetchIndexList(
      this._createIndexParams(this.searchParams),
      this.requestHeaderParams
    );
    const formatted = this._formatList(
      res.result_data.group_areas,
      this.thList
    );
    this._fillLists(res.result_header, formatted);
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * 検索処理
   */
  onClickSearch(): void {
    const sortKey = this.sortingParams['sort'];
    super.onClickSearch();
    this.fetchList(sortKey);
    this._fetchCars();
  }

  /**
   * オプション（設定・お知らせ）切り替えチェックボックスチェックコールバック
   * @param data 対象データ
   * @param name オプション名
   */
  async onClickOptionCheckBox(data: object, name: string) {
    const params = this._parameterizeData(data, this.updateRequiredColumns);
    const feature = {
      type: 'Feature',
      geometry: {
        type: data['group_areas.edit_feature.geometry.type'],
        coordinates: data['group_areas.edit_feature.geometry.coordinates'],
      },
      properties:
        data['group_areas.edit_feature.geometry.type'] === AreaType.point
          ? {
            north_south_distance:
              data[
              'group_areas.edit_feature.properties.north_south_distance'
              ],
            east_west_distance:
              data['group_areas.edit_feature.properties.east_west_distance'],
          }
          : null,
    };
    params.group_areas.feature = feature;

    if (!this.exists('group_id')) {
      params.group_areas.group_id = this.api.getGroupId();
    }

    this.isFetching = true;
    await this.groupAreaService.updateOption(
      data['group_areas.id'],
      params,
      name,
      _.get(data, name) === OptionKind.on ? OptionKind.off : OptionKind.on
    );
    await this.fetchList(this.sortingParams['sort']);
  }

  /**
   * MAPボタン押下コールバック
   * @param data 対象データ
   */
  async onClickMap(data: object) {
    const id = data['group_areas.id'];
    const groupId = data['group_areas.group_id'];
    const carGroupPath = [
      'common.customer.ids',
      'common.support_distributor.ids',
    ].find(path => this.exists(path));

    this._showLoadingSpinner();
    const res = await this.groupAreaService.fetchDepended(
      {
        groupId: groupId,
        mapDependedHeader: this.mapDependedHeader,
        hasGroupIdResource: this.exists('group_area.group_id'),
        requestCars: false,
        carGroupPath,
      }
    );
    const target = res.areas.find(area => area.id === id);

    this.others = {
      ...res,
      cars: this.others ? this.others.cars : null,
    };

    if (target != null) {
      this.areaNo = target.no;
      this.selectType = target.edit_feature.geometry.type;
      this.selectTypeLabel = target.edit_feature.properties.type_name;

      if (this.selectType === AreaType.point) {
        this.rectData = {
          centerPoint: [
            target.edit_feature.geometry.coordinates[0],
            target.edit_feature.geometry.coordinates[1],
          ],
          distance: [
            +target.edit_feature.properties.east_west_distance,
            +target.edit_feature.properties.north_south_distance,
          ],
        };
      } else {
        const points = target.edit_feature.geometry.coordinates[0];
        this.polyPoints = points.slice(0, -1);
      }
    } else {
      this.areaNo = null;
      this.selectType = null;
      this.selectTypeLabel = null;
      this.rectData = null;
      this.polyPoints = null;
    }
    setTimeout(() => {
      this._hideLoadingSpinner();
    }, 100);

    this.modalService.open(
      {
        title: data['group_areas.label'],
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
   * 変更ボタン押下コールバック
   * @param data 対象データ
   */
  onClickEdit(data: object): void {
    this.router.navigate(['group_area/', data['group_areas.id'], 'edit'], {
      queryParams: {
        group_id_param: this.searchParams.group_id || this.api.getGroupId(),
      },
    });
  }

  /**
   * 削除ボタン押下コールバック
   * @param data 対象データ
   */
  async onClickDelete(data: object): Promise<void> {
    this._showLoadingSpinner();
    const res = await this.groupAreaService.fetchIndexList(
      this._createIndexParams(this.searchParams, data['group_areas.id']),
      this.deleteModalValues.requestHeaderParams
    );
    this.deleteModalValues.listVal = this._formatList(
      res.result_data.group_areas,
      this.deleteModalValues.listDesc
    )[0];
    setTimeout(() => {
      this._hideLoadingSpinner();
    }, 100);

    this.modalService.open({
      title: this.labels.delete_confirm_message,
      labels: this.labels,
      content: this.deleteModalContent,
      okBtnLabel: this.labels.delete,
      okBtnClass: 'btn-delete',
      closeBtnLabel: this.labels.cancel,
      ok: async () => {
        await this.groupAreaService.deleteGroupArea(
          data['group_areas.id'],
          this._createDeleteParams(data)
        );
        this.fetchList(this.sortingParams['sort']);
        this.alertService.show(this.labels.complete_message);
      },
    });
  }

  protected async _fetchDataForInitialize(): Promise<void> {
    const res = await this.groupAreaService.fetchGroupAreaInitData();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this._reflectXFields(res.fields);
    this.mapDependedHeader = this._createMapDependedHeader(
      res.otherFields,
      res.landmarkFields
    );
    this.thList = this._createThList(res.fields);
    this.unit = this.labels[this.userSettingService.getDistanceUnit()];
    this.unitedThList = this._createUnitedThList(
      this.thList,
      this.uniteColumns,
      `${this.labels.header_area}[${this.unit}]`
    );
    this.sortableThList = this.sortableThLists(this.thList);
    this.displayableThList = this.displayableThLists(this.thList);
    this.deleteModalValues = this._getModalValues(res.deleteFields, 1, {
      noOptionTableColumn: true,
    });
    this.updatable = res.updatable;
    this.deletable = res.deletable;
    this.carIconHeader = { 'X-Fields': this._createXFields(res.carIconFields) };
    if (!this.resource.group_id) {
      this.collapsed = true;
    }
  }

  protected async _beforeInitFetchList() {
    this._fetchCars();
  }

  /**
   * 統合ヘッダリスト作成
   *
   * 2つのカラムを合わせて一つとするような場合に実施する。
   *
   * @param thList 一覧ヘッダ
   * @param uniteColumns 統合するカラム
   * @param label 統合したカラムにつける名前
   * @return 統合ヘッダリスト
   */
  private _createUnitedThList(thList, uniteColumns, label) {
    const result = [];
    let areaIndex = null;
    _.each(thList, th => {
      if (_.includes(uniteColumns, th.name)) {
        if (areaIndex) {
          result[areaIndex].unitedTh.push(th);
        } else {
          areaIndex = result.length;
          result.push({
            name: 'area',
            label: label,
            displayable: true,
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
   * 一覧の行データのパラメータ化処理
   * @param data 行データ
   * @param columns パラメータに含めるカラム
   * @return パラメータ化したデータ
   */
  private _parameterizeData(data: object, columns: string[]) {
    if (this.resource.group_id) {
      columns.push('group_areas.group_id');
    }
    return _.reduce(
      columns,
      (params, col) => {
        _.set(params, col, data[col]);
        return params;
      },
      {}
    );
  }

  /**
   * グループエリア取得APIのリクエストパラメータを作成
   * @param searchParams 検索パラメータ
   * @param area_id グループエリアID
   */
  private _createIndexParams(searchParams, area_id: string = null) {
    return _.chain({
      area_id,
      access_type: AccessType.EDIT,
      group_id: this.api.getGroupId(),
    })
      .merge(searchParams)
      .omitBy(_.isNull)
      .value();
  }

  /**
   * グループエリア削除API用のリクエストパラメータを作成
   * @param data グループエリア情報
   */
  private _createDeleteParams(data: object) {
    return {
      update_datetime: data['group_areas.update_datetime'],
    };
  }

  private _createMapDependedHeader(
    otherFields: Fields,
    landmarkFields: Fields
  ): MapDependedHeader {
    return {
      other: { 'X-Fields': this._createXFields(otherFields).join(',') },
      landmark: { 'X-Fields': this._createXFields(landmarkFields).join(',') },
    };
  }

  /**
   * 車両一覧取得（非同期）
   */
  private _fetchCars() {
    const carGroupPath = [
      'common.customer.ids',
      'common.support_distributor.ids',
    ].find(path => this.exists(path));

    this.groupAreaService.fetchCars(
      this.carIconHeader, carGroupPath ?
      _.set({}, carGroupPath, [this.params.group_id || this.api.getGroupId()]) :
      null
    ).then(carsRes => {
      if (this.others == null) {
        this.others = {};
      }
      this.others.cars = carsRes.result_data.cars;

      if (this.modalMap != null) {
        this.modalMap.setDrawOtherCarIcons(this.others.cars);
      }
    });
  }
}
