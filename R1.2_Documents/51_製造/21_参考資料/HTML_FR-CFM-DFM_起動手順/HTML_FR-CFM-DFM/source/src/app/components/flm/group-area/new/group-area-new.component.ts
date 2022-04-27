import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import { GroupAreaParams } from '../../../../types/flm/group-area';

import { AreaType } from '../../../../constants/flm/group-area';
import { SystemParamater } from '../../../../constants/system-paramater';

import { GroupAreaFormComponent } from '../shared/form/group-area-form.component';

import { GroupAreaService } from '../../../../services/flm/group-area/group-area.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';
import { ApiService } from '../../../../services/api/api.service';

@Component({
  selector: 'app-group-area-new',
  templateUrl: '../shared/form/group-area-form.component.html',
  styleUrls: ['../shared/form/group-area-form.component.scss'],
})
export class GroupAreaNewComponent extends GroupAreaFormComponent {
  initParams: GroupAreaParams = {
    feature: {
      geometry: {
        type: 'Polygon',
      },
      type: 'Feature',
    },
    group_id: null,
    no: '0',
    label: '',
    description: '',
    active_status_kind: '1',
    notification_kind: '1',
  };
  initGroupId = null;
  isUpdate = false;
  initMap;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    router: Router,
    modalService: KbaModalService,
    cdRef: ChangeDetectorRef,
    groupArea: GroupAreaService,
    private alertService: KbaAlertService,
    private userSettingService: UserSettingService,
    private api: ApiService
  ) {
    super(nav, title, header, router, modalService, cdRef, groupArea);
  }

  protected _fetchDataForInitialize() {
    return new Promise(resolve => {
      this.groupArea
        .fetchInitNew()
        .then(res => {
          this.initialize(res);
          this.labels = res.label;
          this.resource = res.resource;
          this._setTitle();
          this.initMap = this._createInitMap();
          this.params = _.cloneDeep(this.initParams);
          this.selectType = AreaType.polygon;
          this.mapDependedHeader = this._createMapDependedHeader(
            res.otherFields,
            res.landmarkFields
          );
          this.carIconHeader = { 'X-Fields': this._createXFields(res.carIconFields) };
          this.params.group_id = this.initGroupId = res.resource.group_area
            .group_id
            ? res.resource.group_area.group_id.values[0].value
            : this.api.getGroupId();
          return Promise.resolve();
        })
        .then(() => {
          const carGroupPath = [
            'common.customer.ids',
            'common.support_distributor.ids',
          ].find(path => this.exists(path));

          this.groupArea
            .fetchDepended(
              {
                groupId: this.params.group_id,
                mapDependedHeader: this.mapDependedHeader,
                hasGroupIdResource: this.exists('group_area.group_id'),
                carIconRequstHeader: this.carIconHeader,
                requestCars: true,
                carGroupPath,
              }
            )
            .then(result => {
              this._processDependentResult(result);
              resolve();
            });
        });
    });
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

    if (p.group_id == null) {
      p.group_id = this.initGroupId;
    }

    this.groupArea
      .createGroupArea(p)
      .then(res => {
        this.router.navigate([path]).then(async e => {
          if (path === 'group_area/new') {
            this.resource = await this.groupArea.fetchRegistResource();
            this.safeDetectChanges();
            this.resetAllSelectBoxes();
            this._reset();
          }
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
    this.polyPoints = [];
    this.rectData = { centerPoint: [null, null], distance: [null, null] };
    this.pointNum = 0;
    this.params = _.cloneDeep(this.initParams);
    this.selectType = AreaType.polygon;
    this.safeDetectChanges();
    if (this.groupSelect) {
      this.groupSelect.reset();
    }
    this.areaForm.reset();
    this.areaMapComponent.clearMap();
    this.onChangeGroup(this.initGroupId);
  }

  private _createInitMap() {
    const mapParams = this.userSettingService.getMapParams();
    const _window = window as any;
    return {
      [SystemParamater.lng]: +mapParams.lng,
      [SystemParamater.lat]: +mapParams.lat,
      [SystemParamater.zoom]: +mapParams.zoom,
      [SystemParamater.maxPoint]: +_window.settings.maxMapPoint,
    };
  }
}
