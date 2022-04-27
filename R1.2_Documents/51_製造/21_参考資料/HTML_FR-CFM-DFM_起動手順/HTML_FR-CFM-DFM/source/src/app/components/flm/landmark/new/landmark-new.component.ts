import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import {
  LandmarkParams,
  Coordinates,
  LandmarkMapParams,
} from '../../../../types/flm/landmark';

import { SystemParamater } from '../../../../constants/system-paramater';
import { KindSetting } from '../../../../constants/flm/landmark';

import { LandmarkFormComponent } from '../shared/form/landmark-form.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';
import { LandmarkService } from '../../../../services/flm/landmark/landmark.service';

@Component({
  selector: 'app-landmark-new',
  templateUrl: '../shared/form/landmark-form.component.html',
  styleUrls: ['../shared/form/landmark-form.component.scss'],
})
export class LandmarkNewComponent extends LandmarkFormComponent {
  isUpdate = false;
  initParams: LandmarkParams<Coordinates<string>> = {
    landmark: {
      label: '',
      icon_id: '',
      point: {
        type: 'Point',
        coordinates: {
          lng: '',
          lat: '',
        },
      },
    },
  };

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    router: Router,
    modalService: KbaModalService,
    cdRef: ChangeDetectorRef,
    landmarkService: LandmarkService,
    alertService: KbaAlertService,
    private userSettingService: UserSettingService
  ) {
    super(
      nav,
      title,
      header,
      router,
      modalService,
      cdRef,
      landmarkService,
      alertService
    );
  }

  protected async _fetchDataForInitialize() {
    const res = await this.landmarkService.fetchNewInitData();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    _.merge(this.resource.landmark.point.coordinates, {
      lng: this.resource.landmark.point.coordinates[0],
      lat: this.resource.landmark.point.coordinates[1],
    });
    this.mapFields = _.join(this._createXFields(res.mapFields), ',');
    this._setTitle();
    await this._afterInitialize();
    this._initializeParams();
  }

  /**
   * 登録処理
   */
  protected _register(): Promise<any> {
    const params = _.cloneDeep(this.params);
    _.set(
      params.landmark.point,
      'coordinates',
      _.map(this.landmarkMapData.coordinates)
    );
    return this.landmarkService.createLandmark(params);
  }

  /**
   * 登録対象のランドマークデータの初期化
   */
  private _initializeParams(): void {
    const res = this.userSettingService.getMapParams();
    this.initMapParams[SystemParamater.lat] = +res.lat;
    this.initMapParams[SystemParamater.lng] = +res.lng;
    this.initMapParams[SystemParamater.zoom] = +res.zoom;
    this.landmarkMapData = {
      icon: this.iconResource[0],
      coordinates: {},
    };
    this.initLandmarkMapData = _.cloneDeep(this.landmarkMapData);

    if (this.exists('landmark.group_id')) {
      const value = this.getInitialResourceValue(this.resource.landmark.group_id);
      this.initParams.landmark.group_id = value ? value.value : '';
    }

    if (this.exists('landmark.publish_kind')) {
      this.initParams.landmark.publish_kind = KindSetting.off;
    }

    this.initParams.landmark.icon_id = this.iconResource[0].id;
    this.params = _.cloneDeep(this.initParams);
  }
}
