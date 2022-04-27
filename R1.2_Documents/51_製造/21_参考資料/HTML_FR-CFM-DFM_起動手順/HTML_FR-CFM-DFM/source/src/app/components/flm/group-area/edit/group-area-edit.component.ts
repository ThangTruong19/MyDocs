import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import {
  GroupAreaParams,
  PolyPoints,
  RectData,
} from '../../../../types/flm/group-area';

import { AreaType } from '../../../../constants/flm/group-area';
import { SystemParamater } from '../../../../constants/system-paramater';

import { GroupAreaFormComponent } from '../shared/form/group-area-form.component';

import { GroupAreaService } from '../../../../services/flm/group-area/group-area.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

@Component({
  selector: 'app-group-area-edit',
  templateUrl: '../shared/form/group-area-form.component.html',
  styleUrls: ['../shared/form/group-area-form.component.scss'],
})
export class GroupAreaEditComponent extends GroupAreaFormComponent {
  target: GroupAreaParams;
  targetPolyPoints: PolyPoints = [];
  targetRectData: RectData = {
    centerPoint: [null, null],
    distance: [null, null],
  };
  isUpdate = true;
  initMap = {};
  id: string;
  groupId: string;
  groupLabel: string;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    router: Router,
    modalService: KbaModalService,
    cdRef: ChangeDetectorRef,
    groupArea: GroupAreaService,
    private alertService: KbaAlertService,
    private activatedRoute: ActivatedRoute,
    private userSettingService: UserSettingService
  ) {
    super(nav, title, header, router, modalService, cdRef, groupArea);
  }

  protected async _fetchDataForInitialize() {
    let groupId: string;
    this.activatedRoute.params.subscribe(params => (this.id = params.id));
    this.activatedRoute.queryParams.subscribe(
      params => (groupId = params.group_id_param)
    );

    const res = await this.groupArea.fetchEditInitData(this.id, groupId);
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();

    if (res.groupArea == null) {
      return;
    }

    this._setMapData(res.groupArea);
    this.target = this._editParametarize(res.groupArea);
    this.params = _.cloneDeep(this.target);
    this.selectType = this.target.feature.geometry.type;
    this.groupLabel = '';

    if (res.groupArea && res.groupArea.group_label) {
      this.groupLabel = res.groupArea.group_label;
    }
    this.mapDependedHeader = this._createMapDependedHeader(
      res.otherFields,
      res.landmarkFields
    );
    this.carIconHeader = { 'X-Fields': this._createXFields(res.carIconFields) };

    const carGroupPath = [
      'common.customer.ids',
      'common.support_distributor.ids',
    ].find(path => this.exists(path));

    const result = await this.groupArea.fetchDepended(
      {
        groupId: this.params.group_id || groupId,
        mapDependedHeader: this.mapDependedHeader,
        hasGroupIdResource: this.exists('group_area.group_id'),
        carIconRequstHeader: this.carIconHeader,
        requestCars: true,
        carGroupPath,
      }
    );
    this._processDependentResult(result);
  }

  /**
   * 取得した依存情報をコンポーネントのデータとしてセット
   * @param result 依存情報取得結果
   */
  protected _processDependentResult(result) {
    const currentAreaNoItem = {
      name: this.target.no,
      value: this.target.no,
    };

    if (result.areaNumbers != null) {
      result.areaNumbers.group_area.no.values.push(currentAreaNoItem);
      result.areaNumbers.group_area.no.values = _.orderBy(
        result.areaNumbers.group_area.no.values,
        ({ value }) => +value
      );
    } else {
      this.resource.group_area.no.values.push(currentAreaNoItem);
      this.resource.group_area.no.values = _.orderBy(
        this.resource.group_area.no.values,
        ({ value }) => +value
      );
    }

    super._processDependentResult(result);
  }

  /**
   * 登録処理
   * @param params リクエストパラメータ
   * @param path 処理後遷移先
   */
  protected _register(params: any, path: string): void {
    let p: GroupAreaParams;
    if (this._isPolygon()) {
      p = this._createPolygonParams(params, this.polyPoints, this.selectType);
    } else if (this._isPoint()) {
      p = this._createRectParams(params, this.rectData, this.selectType);
    }

    this.groupArea
      .updateGroupArea(this.id, p)
      .then(res => {
        this.router.navigate(['group_area']).then(e => {
          this.alertService.show(this.labels.finish_message);
        });
      })
      .catch(errorData => {
        this._setError(errorData, this.alertService);
      });
  }

  /**
   * フォームに入力された内容をリセットする
   */
  protected _reset(): void {
    this.params = _.cloneDeep(this.target);
    this.selectType = this.target.feature.geometry.type;
    this.polyPoints = _.cloneDeep(this.targetPolyPoints);
    this.rectData = _.cloneDeep(this.targetRectData);
    this.onChangeGroup(this.target.group_id);
    this.safeDetectChanges();
    this.refreshFormTextInput();
    this.areaMapComponent.redrawArea();
  }

  /**
   * 一覧APIで取得したグループエリア情報を変更用グループエリア情報に変換して返す
   * @param groupArea グループエリア情報
   */
  private _editParametarize(groupArea: GroupAreaParams): GroupAreaParams {
    const params = {};
    _.merge(params, groupArea, { feature: groupArea.edit_feature });
    const excludeParams = [
      'id',
      'edit_feature',
      'group_label',
      'group_label_english',
      'active_status_name',
      'notification_name',
      'feature.geometry.coordinates',
      'feature.properties',
    ];
    return _.omit(params, excludeParams);
  }

  /**
   * グループエリア情報からマップ用のデータを取得してセットする
   * @param groupArea グループエリア情報
   */
  private _setMapData(groupArea: GroupAreaParams): void {
    if (groupArea.edit_feature.geometry.type === AreaType.polygon) {
      const points = groupArea.edit_feature.geometry.coordinates[0];
      this.targetPolyPoints = _.take(points, points.length - 1);
      this.pointNum = this.targetPolyPoints.length;
      this.polyPoints = _.cloneDeep(this.targetPolyPoints);
    } else if (groupArea.edit_feature.geometry.type === AreaType.point) {
      this.targetRectData = {
        centerPoint: groupArea.edit_feature.geometry.coordinates,
        distance: [
          +groupArea.edit_feature.properties.east_west_distance,
          +groupArea.edit_feature.properties.north_south_distance,
        ],
      };
      this.rectData = _.cloneDeep(this.targetRectData);
    }
    const res = this.userSettingService.getMapParams();
    const _window = window as any;
    this.initMap = {
      [SystemParamater.zoom]: +res.zoom,
      [SystemParamater.maxPoint]: +_window.settings.maxMapPoint,
    };
  }
}
