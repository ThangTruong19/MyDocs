import {
  Component,
  ViewChild,
  ChangeDetectorRef,
  OnChanges,
  AfterViewInit,
  OnDestroy,
  AfterViewChecked,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import {
  LandmarkParams,
  Coordinates,
  LandmarkMapParams,
} from '../../../../types/flm/landmark';

import { KindSetting } from '../../../../constants/flm/landmark';

import { SystemParamater } from '../../../../constants/system-paramater';

import { LandmarkFormComponent } from '../shared/form/landmark-form.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';

import { LandmarkService } from '../../../../services/flm/landmark/landmark.service';

@Component({
  selector: 'app-landmark-edit',
  templateUrl: '../shared/form/landmark-form.component.html',
  styleUrls: ['../shared/form/landmark-form.component.scss'],
})
export class LandmarkEditComponent extends LandmarkFormComponent {
  isUpdate = true;
  landmarkId: string;
  updateDatetime: string;
  initLandmarkMapData: LandmarkMapParams;
  groupLabel: string;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    router: Router,
    modalService: KbaModalService,
    ref: ChangeDetectorRef,
    landmarkService: LandmarkService,
    alertService: KbaAlertService,
    private activatedRoute: ActivatedRoute
  ) {
    super(
      nav,
      title,
      header,
      router,
      modalService,
      ref,
      landmarkService,
      alertService
    );
  }

  protected async _fetchDataForInitialize() {
    let id: string;
    this.activatedRoute.params.subscribe(params => (id = params.id));
    const res = await this.landmarkService.fetchEditInitData({
      landmark_id: id,
      editable_kind: KindSetting.on,
    });
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    _.merge(this.resource.landmark.point.coordinates, {
      lng: this.resource.landmark.point.coordinates[0],
      lat: this.resource.landmark.point.coordinates[1],
    });
    this._setTitle();

    if (res.target.result_data.landmarks[0] == null) {
      this.params = null;
      return;
    }

    this.groupLabel = '';

    if (res.target.result_data.landmarks && res.target.result_data.landmarks[0]
      && res.target.result_data.landmarks[0].group && res.target.result_data.landmarks[0].group.label) {
      this.groupLabel = res.target.result_data.landmarks[0].group.label;
    }

    this.mapFields = this._createXFields(res.mapFields).join(',');
    this.landmarkId = res.target.result_data.landmarks[0].id;
    this.updateDatetime = res.target.result_data.landmarks[0].update_datetime;
    await this._afterInitialize();
    this._initializeParams(res.target.result_data.landmarks[0]);
  }

  /**
   * 変更処理
   */
  protected _register(): Promise<any> {
    const params = _.cloneDeep(this.params);
    _.set(
      params.landmark.point,
      'coordinates',
      _.map(this.landmarkMapData.coordinates)
    );
    return this.landmarkService.updateLandmark(
      params,
      this.landmarkId,
      this.updateDatetime
    );
  }

  /**
   * 重複しているランドマークのデータを取り除く
   * @param data ランドマークデータ
   */
  protected _replaceDuplicateLandmarkData(data) {
    return {
      landmarks: data.landmarks.filter(item => item.id !== this.landmarkId),
    };
  }

  /**
   * 対象のランドマークデータを初期化する
   */
  private _initializeParams(data): void {
    this.initParams = {
      landmark: _.pick(data, ['label', 'free_memo']),
    };
    _.set(this.initParams.landmark, 'icon_id', data.icon.id);

    if (this.exists('landmark.group_id')) {
      _.set(this.initParams.landmark, 'group_id', data.group.id);
    }

    if (this.exists('landmark.publish_kind')) {
      _.set(this.initParams.landmark, 'publish_kind', data.publish_kind);
    }

    this.initParams.landmark.point = {
      type: data.point.type,
      coordinates: {
        lng: String(data.point.coordinates[0]),
        lat: String(data.point.coordinates[1]),
      },
    };
    this.params = _.cloneDeep(this.initParams);
    this.landmarkMapData['icon'] = data.icon;
    this.landmarkMapData['coordinates'] = {
      lng: data.point.coordinates[0],
      lat: data.point.coordinates[1],
    };
    this.initLandmarkMapData = _.cloneDeep(this.landmarkMapData);
    this.initMapParams[
      SystemParamater.lng
    ] = this.landmarkMapData.coordinates.lng;
    this.initMapParams[
      SystemParamater.lat
    ] = this.landmarkMapData.coordinates.lat;
  }
}
