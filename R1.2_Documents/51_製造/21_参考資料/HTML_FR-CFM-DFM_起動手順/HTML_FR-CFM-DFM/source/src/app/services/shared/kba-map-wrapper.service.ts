import { Injectable, EventEmitter } from '@angular/core';
import { invert, extend, isEmpty, get } from 'lodash';

import { MapLibrary } from '../../constants/map-library';

import { UserSettingService } from '../api/user-setting.service';

import { environment } from '../../../environments/environment';
import { Labels } from '../../types/common';

@Injectable()
export class KbaMapWrapperService {
  instance = null;
  mapConfig: any;
  changeRect = new EventEmitter<any>();
  changePoly = new EventEmitter<any>();
  clickPoly = new EventEmitter<any>();
  loaded = false;

  constructor(private userSettingService: UserSettingService) {
    this.refreshMapConfig();
  }

  async loadDependencies() {
    if (this.loaded) {
      return Promise.resolve();
    }

    const head = document.getElementsByTagName('head')[0];

    await this.loadScript(head, './assets/vendor/jquery.min.js');
    await this.loadScript(head, './assets/vendor/mapwrapper_all.min.js');
  }

  loadScript(head, src): Promise<any> {
    let script;

    return new Promise(resolve => {
      if ((script = document.querySelector(`script[src='${src}']`))) {
        const interval = setInterval(() => {
          if (script.dataset.loaded) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      } else {
        script = document.createElement('script');
        script.src = src;
        head.appendChild(script);
        script.onload = () => {
          script.dataset.loaded = true;
          resolve();
        };
      }
    });
  }

  /**
   * マップの設定値をリフレッシュする
   * @param mapId マップの種別
   */
  refreshMapConfig(mapId = null) {
    const id = mapId || this.userSettingService.getMapApplication();
    const mapLibrary = invert(MapLibrary)[id];
    this.mapConfig = environment.settings.adminMapWrapper[mapLibrary];

    extend(this.mapConfig, { lang: this.userSettingService.getLang() });
    if (id === MapLibrary.GoogleMaps) {
      const _window = window as any;
      const apiKey = _window.settings.googleMapKey;
      if (!isEmpty(apiKey)) {
        extend(this.mapConfig, { apikey: apiKey });
      }
    }
  }

  getInstance() {
    return new Promise(resolve => {
      this.loadDependencies().then(() => {
        this.loaded = true;
        this.instance = new (<any>window).MapWrapper(this.mapConfig);
        resolve(this.instance);
      });
    });
  }

  /**
   * 車両のアイコンを表示するのに必要なデータを返す
   * @param car 車両
   */
  getCarIconData(
    car: any,
    labels: Labels,
    getCarDeatilLink?: (carId: string) => string,
    getCarCaption?: (car: any) => string
  ) {
    let id: string, model: string, type_rev: string, serial: string;

    if (car.car_identification) {
      id = car.car_identification.id;
      model = car.car_identification.model;
      type_rev = car.car_identification.type_rev;
      serial = car.car_identification.serial;
    }

    const iconName = '/KBA-icon-car';
    // 全件表示用の車両取得で得たデータはアイコン番号のパスが異なるため
    const iconFontNo = car.icon_font
      ? car.icon_font.no
      : car.car_identification.icon_font_no;

    const data: any = {
      id,
      MId: id,
      model,
      type_rev,
      serial,
      labels,
      iconUrl: `${this.mapConfig.pngicondir}${iconName}${iconFontNo}.png`,
      Lat: get(car, 'latest_status.point.coordinates[1]'),
      Lon: get(car, 'latest_status.point.coordinates[0]'),
      IcnFnt: iconFontNo,
      getCarDeatilLink,
      caption: getCarCaption ? getCarCaption(car) : null,
    };

    return data;
  }
}
