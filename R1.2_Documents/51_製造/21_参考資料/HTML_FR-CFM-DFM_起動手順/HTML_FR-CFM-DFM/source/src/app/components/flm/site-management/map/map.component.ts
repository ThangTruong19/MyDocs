import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';

import { MapParams } from '../../../../types/user-setting';
import { BondArea, Coordinates } from '../../../../types/flm/site-management';
import { Landmark } from '../../../../types/flm/landmark';

import { ScreenCode } from '../../../../constants/flm/screen-codes/site-management';
import { FunctionCode as CommonFunctionCode } from '../../../../constants/flm/function-codes/common';
import { CoordinateType } from '../../../shared/kba-area/area';
import { MapLibrary } from '../../../../constants/map-library';
import { UnitSystem } from '../../../../constants/distance-unit';

import { environment } from '../../../../../environments/environment';

import { KbaAbstractBaseComponent } from '../../../shared/kba-abstract-component/kba-abstract-base-compoenent';
import { KbaAreaMapComponent } from '../../../shared/kba-area/kba-area-map.component';

import { SiteManagementService } from '../../../../services/flm/site-management/site-management.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';
import { ApiService } from '../../../../services/api/api.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { KbaMapWrapperService } from '../../../../services/shared/kba-map-wrapper.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent extends KbaAbstractBaseComponent implements OnInit {
  @ViewChild(KbaAreaMapComponent, { static: false }) map: KbaAreaMapComponent;

  screenCode: string;
  url: string;
  id: string;
  _headerTitle: string;
  displayLandmarks: boolean;
  displayBondAreas: boolean;
  userSettingParams: {
    model_type_serial_caption_display_kind: boolean;
    customer_car_no_caption_display_kind: boolean;
    customer_label_caption_display_kind: boolean;
    landmark_label_caption_display_kind: boolean;
  };
  mapParams: MapParams;
  cars: any[];
  bondAreas;
  landmarks;
  _showMapRoute = false;
  mapWrapperConfig;
  currentAddress: string;
  geocoderPluginName: string;
  geocoderIntsance;
  destCar;
  srcPosition: Coordinates;
  routeLoading: boolean;
  showRouteGuide: boolean;
  clickListener;
  carDetailLink: string;
  areaCoordinates: number[][][];
  areaPopup: {
    label: string;
    description: string;
  };

  // WindowsのChromeのバグ対策
  loadMap = false;

  /**
   * ルート検索コンポーネントの表示設定
   */
  set showMapRoute(value) {
    this._showMapRoute = value;
    this.safeDetectChanges();
    this.map.redrawMap();
  }

  get showMapRoute() {
    return this._showMapRoute;
  }

  /**
   * ランドマークのキャプションを表示状態を判定する
   */
  get landmarkCaptionDisplayable() {
    return (
      this.displayLandmarks &&
      this._isCaptionDisplayable('landmark_label_caption_display_kind')
    );
  }

  /**
   * ヘッダに表示するタイトルを返す
   */
  get headerTitle() {
    return this._headerTitle || '-';
  }

  /**
   * geocoderが有効であるかを判定する
   */
  get geocoderEnabled() {
    return !!this.geocoderPluginName;
  }

  constructor(
    title: Title,
    activatedRoute: ActivatedRoute,
    private siteManagementService: SiteManagementService,
    private header: CommonHeaderService,
    private userSettingService: UserSettingService,
    private api: ApiService,
    private alertService: KbaAlertService,
    private mapWrapperService: KbaMapWrapperService
  ) {
    super(null, title);
    activatedRoute.url.subscribe(paths => (this.url = paths.join('/')));
    activatedRoute.params.subscribe(params => (this.id = params.id));
    const isSite = /site/.test(this.url);
    this.screenCode = isSite ? ScreenCode.siteMap : ScreenCode.areaMap;
  }

  async ngOnInit() {
    await this._fetchDataForInitialize();
    this.mapWrapperService.refreshMapConfig();
    this.onLoad();
    setTimeout(() => (this.loadMap = true));

    // Chromeでルート検索の表示がおかしくなるバグの対処
    const interval = setInterval(() => {
      if (this.map && !this.map.beforeInit) {
        this._initializeGeocoder();
        clearInterval(interval);
      }
    }, 100);
  }

  /**
   * 地図オプションの保存押下時のコールバック
   */
  async handleSaveMapOptions() {
    const { lat, lng } = this.map.mr.getCenter();
    const zoom = this.map.mr.getZoom();

    await this.api.updateUserSettings({
      user_settings: [
        {
          key: 'map_latitude',
          value: `${lat % 90}`,
        },
        {
          key: 'map_longitude',
          value: `${lng % 180}`,
        },
        {
          key: 'map_magnification',
          value: `${zoom}`,
        },
      ],
    });
    this.alertService.show(this.labels.saved);
  }

  /**
   * ランドマークの表示切り替えボタン押下時のコールバック
   * @param value 表示・非表示
   */
  async handleToggleDisplayLandmarks(value: boolean) {
    this.displayLandmarks = value;
    if (value && !this.landmarks) {
      const res = await this.siteManagementService.fetchLandmarks();
      const landmarks: Landmark[] = res.result_data.landmarks;

      this.landmarks = this._getLandmarks(landmarks);
      this.map.mr.drawLandmarks(this.landmarks);
    } else {
      this.map.mr.toggleShowLandmarks();
    }
  }

  /**
   * 保税エリアの表示切り替えボタン押下時のコールバック
   * @param value 表示・非表示
   */
  async handleToggleDisplayBondAreas(value: boolean) {
    this.displayBondAreas = value;

    if (value) {
      if (!this.bondAreas) {
        const res = await this.siteManagementService.fetchBondAreas();
        const bondAreas: BondArea[] = res.result_data.bond_areas;
        this.bondAreas = this._createBondAreaOverlays(bondAreas);
      }

      this.bondAreas.forEach(area => this.map.mr.addLayer(area));
    } else {
      this.bondAreas.forEach(area => {
        if (area.overlay._infowindow) {
          area.overlay._infowindow.close();
        }
        this.map.mr.removeLayer(area);
      });
    }
  }

  /**
   * ユーザ設定に紐づくパラメータ設定変更時のコールバック
   * @param value 設定値
   */
  handleToggleDisplayUserSettingBoundParams({
    path,
    value,
  }: {
    path: string;
    value: boolean;
  }) {
    this.userSettingParams[path] = value;

    if (path !== 'landmark_label_caption_display_kind') {
      this._refreshCarIcons();
    }

    this.api.updateUserSettings({
      user_settings: [
        {
          key: path,
          value: `${+value}`,
        },
      ],
    });
  }

  /**
   * マップ読み込み時のコールバック
   */
  handleMapLoad() {
    const isCarMode = this.screenCode === ScreenCode.siteMap || !this.id;
    this.mapParams = this.userSettingService.getMapParams();
    let latLngs: {
      lat: number,
      lng: number,
    }[];

    latLngs = isCarMode ?
      this.cars.map(car => ({
        lat: _.get(car, `latest_status.point.coordinates[${CoordinateType.LAT}]`),
        lng: _.get(car, `latest_status.point.coordinates[${CoordinateType.LNG}]`),
      })).filter(({ lat, lng }) => lat != null && lng != null) :
      this.areaCoordinates[0] ?
        this.areaCoordinates[0].map(coordinates => ({
          lat: coordinates[1],
          lng: coordinates[0],
        })) : [];

    if (latLngs.length > 0) {
      const bounds = this.map.mr.createBounds(latLngs);
      isCarMode ?
        this.map.mr.fitBoundsWithMaxZoom(bounds, +this.mapParams.zoom) :
        this.map.mr.fitBounds(bounds);
    } else {
      const { lat, lng, zoom } = this.mapParams;
      this.map.mr.setCenter({ lat: +lat, lng: +lng });
      this.map.mr.setZoom(+zoom);
    }

    const { mapApplication } = this.mapParams;
    const mapApplicationName = _.invert(MapLibrary)[mapApplication];
    this.mapWrapperConfig =
      environment.settings.adminMapWrapper[mapApplicationName];
    this._refreshCarIcons();

    if (this.areaCoordinates) {
      const areas = this._createAreaOverlays(this.areaCoordinates);
      areas.forEach(area => this.map.mr.addLayer(area));
    }
  }

  /**
   * ルート検索閉じる押下時のコールバック
   */
  handleClickCloseMapRoute() {
    this.showMapRoute = false;

    // セット処理とバッティングしマップ領域が正しく変わらないため、タイミングをずらす
    setTimeout(() => {
      this.srcPosition = null;
      this.map.mr.removeMapClickListener(this.clickListener);
      this.clickListener = null;
      this.map.mr.resetCursor();
      this.map.mr.removeRoute();
      this.map.redrawMap();
      this._refreshCarIcons();
    });
  }

  /**
   * ルート検索の戻るボタン押下時のコールバック
   */
  handleClickRouteBack() {
    this.srcPosition = null;
    this.map.mr.removeMapClickListener(this.clickListener);
    this.clickListener = null;
    this.map.mr.resetCursor();
    this.map.mr.removeRoute();
    this.map.redrawMap();
    this._refreshCarIcons();
  }

  /**
   * 車両詳細のリンク先を取得する
   * @param carId 車両ID
   */
  getCarDeatilLink = (carId: string) => {
    return '/c/fm' + this.carDetailLink.replace('{car_id}', carId);
  };

  /**
   * 現在地からのルートを表示ボタン押下時のコールバック
   */
  async handleClickSearchFromPresentLocation() {
    this.srcPosition = null;
    this.routeLoading = true;

    try {
      this.srcPosition = await this._getCurrentPosition();
    } catch (error) {
      this.showRouteGuide = false;
      this.alertService.show(this.labels.geolocation_disabled, false, 'danger');
      return;
    }

    try {
      await this._drawRoute();
    } catch (error) {
      this.alertService.show(this.labels.route_not_found, false, 'danger');
      this.showRouteGuide = false;
      this._refreshCarIcons();
    }
    this.routeLoading = false;
  }

  /**
   * 現在地を入力して表示確定ボタン押下時のコールバック
   * @param address 入力された現在地
   */
  async handleClickSearchFromInputLocation(address: string) {
    this.srcPosition = null;
    this.routeLoading = true;

    try {
      this.srcPosition = await this._getCoordFromAddress(address);
      await this._drawRoute();
    } catch (error) {
      this.alertService.show(this.labels.route_not_found, false, 'danger');
      this.showRouteGuide = false;
      this._refreshCarIcons();
    }
    this.routeLoading = false;
  }

  /**
   * クリック地点からのルートを表示ボタン押下時のコールバック
   */
  handleClickSearchFromClickedPoint() {
    this.srcPosition = null;
    this.clickListener = this.map.mr.addMapClickListener(
      this._handleClickMapPoint
    );
    this.map.mr.changeCursor(
      'url(assets/static/img/cursor/arrow-for-map.svg), auto'
    );
    this._refreshCarIcons(false);
  }

  private async _fetchDataForInitialize() {
    const res = await this.siteManagementService.fetchMapInitData(
      this.screenCode
    );
    this.labels = res.label;
    this.resource = res.resource;
    const carFields = res.fields;
    this._setTitle();
    await this.header.setHeader(
      this.labels,
      res.resource,
      res.functions.result_data.functions
    );
    if (this.id) {
      const isSite = this.screenCode === ScreenCode.siteMap;
      let map = (await (isSite
        ? this.siteManagementService.fetchSiteMaps({ site_ids: [this.id] })
        : this.siteManagementService.fetchAreaMaps({ area_ids: [this.id] })))
        .result_data;
      map = (isSite ? map.site_maps : map.group_area_maps)[0];
      this.cars = map.cars;
      if (this.screenCode === ScreenCode.areaMap) {
        this.areaCoordinates = map.feature.geometry.coordinates;
        this.areaPopup = {
          label: map.label,
          description: map.description,
        };
      }
      this._headerTitle = map.label;
    } else {
      const cars = await this.siteManagementService.fetchCars(
        this._createXFields(carFields).join(',')
      );
      this.cars = cars.result_data.cars;
      this._headerTitle = this.labels.all_cars;
    }

    this.userSettingParams = this.userSettingService.getSiteManagementMapSetting();
    this.carDetailLink = (functions => {
      const carDeatil = functions.find(
        func => func.code === CommonFunctionCode.carDetailLink
      );
      return carDeatil.options[0].value;
    })(res.functions.result_data.functions);
  }

  /**
   * ルート検索押下時のコールバック
   * @param target 対象車両
   */
  private _handleClickSearchRoute(target) {
    this.showMapRoute = true;

    // セット処理とバッティングしマップ領域が正しく変わらないため、タイミングをずらす
    setTimeout(() => {
      this.destCar = target;
      this.map.redrawMap();
    });
  }

  /**
   * 車両アイコンクリック時のポップアップのテンプレートを返す
   */
  private _getPopupTemplate() {
    return `
    <div class="map-popup">
      <p class="car-name"><%- model %>-<%- type_rev %> #<%- serial %></p>
      <ul class="popup-list">
        <li class="popup-list-item">
          <a class="popup-link" target="_blank" href="<%- getCarDeatilLink(id) %>">
            <%- labels.car_detail_link %>
          </a>
        </li>
        <li class="popup-list-item">
          <a class="popup-link" href="javascript:void(0)" id="search-route-<%- id %>">
            <%- labels.search_route_link %>
          </a>
        </li>
      </ul>
    </div>
    `;
  }

  /**
   * 保税エリアのオーバーレイを作成する
   * @param bondAreas 保税エリアの配列
   */
  private _createBondAreaOverlays(bondAreas: BondArea[]) {
    return this.map.mr.createAreaOverlays(
      _.flatten(
        bondAreas.map(bondArea =>
          bondArea.feature.geometry.coordinates.map(coordinate => ({
            type: 'polygon',
            points: coordinate.map(co => [
              co[CoordinateType.LAT],
              co[CoordinateType.LNG],
            ]),
            Desc: bondArea.label,
            Expl: bondArea.description,
          }))
        )
      ),
      {
        strokeColor: bondAreas[0].feature.properties.color,
        strokeOpacity: 0.6,
        strokeWeight: 1,
        fillColor: bondAreas[0].feature.properties.color,
        fillOpacity: 0.2,
      }
    );
  }

  /**
   * 表示用のランドマークを取得する
   * @param landmarks ランドマークの配列
   */
  private _getLandmarks(landmarks: Landmark[]) {
    return landmarks.map(landmark => ({
      name: landmark.label,
      iconUrl: _.get(landmark, 'icon.image'),
      position: {
        lat: landmark.point.coordinates[CoordinateType.LAT],
        lng: landmark.point.coordinates[CoordinateType.LNG],
      },
    }));
  }

  /**
   * 車両アイコンを再描画する
   */
  private _refreshCarIcons(usePopup = true) {
    if (!this.cars) {
      return;
    }
    this.map.mr.clearMarkers();
    const data = this.cars.map(car =>
      this.mapWrapperService.getCarIconData(
        car,
        this.labels,
        this.getCarDeatilLink,
        this._getCarCaption
      )
    );
    const popupTempl = usePopup ? this._getPopupTemplate() : null;
    const callbacks = {
      'search-route-': target => this._handleClickSearchRoute(target),
    };
    const _window = window as any;
    const args = [
      data.length,
      data,
      _window.settings.mapPerformanceThreshold,
      false,
      popupTempl,
      callbacks,
      true,
      { zoom: 8 },
      true,
      'car-caption',
    ];

    if (this.map.mr.markerCluster) {
      this.map.mr.clusterMarkersAll(...args);
    } else {
      this.map.mr.loadClustererApi().then(() => {
        this.map.mr.clusterMarkersAll(...args);
      });
    }
    this.map.redrawMap();
  }

  /**
   * 車両のキャプション文字列を取得する
   * @param car 車両
   */
  private _getCarCaption = car => {
    const { model, type_rev, serial } = car.car_identification;
    const customer_car_no = car.customer_attribute
      ? car.customer_attribute.customer_car_no
      : null;
    const customerLabel = car.customer ? car.customer.label : null;

    const captions = [
      this._isCaptionDisplayable('model_type_serial_caption_display_kind')
        ? `${model}-${type_rev}-${serial}`
        : null,
      this._isCaptionDisplayable('customer_car_no_caption_display_kind')
        ? customer_car_no
        : null,
      this._isCaptionDisplayable('customer_label_caption_display_kind')
        ? customerLabel
        : null,
    ].map(caption =>
      caption ? `<span class="car-caption-label">${caption}</span>` : null
    );

    return _.compact(captions).join('');
  };

  /**
   * パスに対応するキャプションが表示可能であるかを判定する
   * @param リソースのパス
   */
  private _isCaptionDisplayable(path) {
    return this.resource[path] != null && this.userSettingParams[path];
  }

  /**
   * geocoder関連の初期化を行う
   */
  private async _initializeGeocoder() {
    this.geocoderPluginName =
      (this.mapWrapperConfig && this.mapWrapperConfig.geocoderPluginName) ||
      null;
    this.geocoderIntsance = new (window as any).Geocoder(
      this.geocoderPluginName
    );

    try {
      const currentPotision = await this._getCurrentPosition();
      this.currentAddress = await this._getAddressFromLatLng(currentPotision);
    } catch (error) {}
  }

  /**
   * navigator.getlocationより現在地の緯度・経度を取得する
   */
  private _getCurrentPosition() {
    return new Promise<Coordinates>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position =>
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }),
        error => reject(error)
      );
    });
  }

  /**
   * 緯度・経度を住所のテキストに変換する
   * @param position 緯度・経度
   */
  private _getAddressFromLatLng(position: Coordinates) {
    if (!this.geocoderPluginName) {
      return Promise.reject('Geocoder plugin is not enabled');
    }

    return new Promise<string>((resolve, reject) => {
      this.geocoderIntsance
        .reverseGeocode(position)
        .done(res => resolve(res))
        .fail(error => reject(error));
    });
  }

  /**
   * 住所のテキストを緯度・経度に変換する
   * @param address 住所
   */
  private _getCoordFromAddress(address: string) {
    if (!this.geocoderPluginName) {
      return Promise.reject('Geocoder plugin is not enabled');
    }

    return new Promise<Coordinates>((resolve, reject) => {
      this.geocoderIntsance
        .geocode(address)
        .done(res => resolve(res))
        .fail(error => reject(error));
    });
  }

  /**
   * マップにルートを描画する
   * @param src 出発地点
   * @param destCar 目的地点の車両
   */
  private _drawRoute() {
    return new Promise<void>((resolve, reject) => {
      this.map.mr.clearMarkers();
      this.map.mr
        .drawRoute(
          this.srcPosition,
          { lat: this.destCar.Lat, lng: this.destCar.Lon },
          {
            dest: {
              icon: {
                url: this.destCar.iconPath,
              },
              show: true,
            },
            origin: {
              show: true,
            },
          },
          {
            container: document.getElementById('route-guide'),
            unitSystem: [UnitSystem.metrical, UnitSystem.imperial][
              +this.userSettingService.userSettings.distance_unit_code
            ],
          }
        )
        .done(() => resolve())
        .fail(error => reject(error));
    });
  }

  /**
   * マップ地点クリック時のコールバック
   */
  private _handleClickMapPoint = async point => {
    this.srcPosition = point;
    this.routeLoading = true;

    try {
      await this._drawRoute();
      this.showMapRoute = true;
      this.map.mr.removeMapClickListener(this.clickListener);
      this.clickListener = null;
      this.map.mr.resetCursor();
    } catch (error) {
      this.alertService.show(this.labels.invalid_start_point, false, 'danger');
      this._refreshCarIcons();
    }
    this.routeLoading = false;
  };

  /**
   * エリアのオーバーレイを作成する
   * @param coordinates ポリゴンの配列
   */
  private _createAreaOverlays(coordinates: number[][][]) {
    return this.map.mr.createAreaOverlays(
      coordinates.map(polygon => ({
        type: 'polygon',
        points: polygon.map(latLng => [
          latLng[CoordinateType.LAT],
          latLng[CoordinateType.LNG],
        ]),
        Desc: this.areaPopup.label,
        Expl: this.areaPopup.description,
      })),
      this.map.editAreaOpts
    );
  }
}
