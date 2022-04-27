import { debounceTime } from 'rxjs/operators';
import {
  Component,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  EventEmitter,
} from '@angular/core';
import * as _ from 'lodash';
import { Subject } from 'rxjs';

import {
  RectData,
  PolyPoints,
  Area,
  Others,
  Coordinate,
} from '../../../types/flm/group-area';
import {
  Landmark,
  Coordinates,
  LandmarkIconParams,
} from '../../../types/flm/landmark';
import { CarLatest } from '../../../types/flm/car';

import { AreaType } from '../../../constants/flm/group-area';
import { SystemParamater } from '../../../constants/system-paramater';
import { CoordinateType, DistanceType } from './area';

import { KbaMapWrapperService } from '../../../services/shared/kba-map-wrapper.service';
import { UserSettingService } from '../../../services/api/user-setting.service';

@Component({
  selector: 'app-kba-area-map',
  templateUrl: 'kba-area-map.component.html',
  styleUrls: ['kba-area-map.component.scss'],
})
export class KbaAreaMapComponent implements OnInit, OnChanges {
  @ViewChild('areaCanvas', { static: false }) areaCanvas: any;

  @Input() no;
  @Input() initMap;
  @Input() labels: any;
  @Input() menuWidth: number;
  @Input() menuOpen: boolean;
  @Input() isModal: boolean;
  @Input() others;
  @Input() selectType;
  @Input() polyPoints;
  @Input() rectData;
  @Input() editable;
  @Input() params;
  @Input() isUpdate;
  @Input() hasMenu = true;
  @Input() isLandmark = false;
  @Input() landmarkData: {
    icon: LandmarkIconParams;
    coordinates: Coordinates<number>;
  };
  @Input() simpleMap;
  // コンポーネントの識別用 / 通常は使用する必要なし
  @Input() id = null;
  @Output() changePoints = new EventEmitter<number[][]>();
  @Output() changeRect = new EventEmitter<number[]>();
  @Output() changeLandmarkCoordinates = new EventEmitter<Coordinates<number>>();
  @Output() onLoad = new EventEmitter<null>();

  AREA_COLOR = {
    VIEW: '#0088ff',
    EDIT: '#ff0000',
  };
  UNIT_MILE = 1.60934;
  carIconPath = 'car-png-icons/';
  mr: any;
  mark: any;
  menuPadding = 60;
  mapOptions: any = {
    center: {
      lat: 0,
      lng: 0,
    },
    zoom: 15,
    streetViewControl: true,
    mapTypeControl: true,
    panControl: false,
    overviewMapControl: true,
    overviewMapControlOptions: {
      opened: true,
    },
  };
  editAreaOpts;
  viewAreaOpts;

  // 多角形領域オプション
  polyOtps = {
    type: 'polygon',
    points: [],
    Desc: null,
    Expl: null,
    editable: false,
  };
  // 矩形領域オプション
  rectOtps = {
    type: 'rectangle',
    center: {
      lat: null,
      lng: null,
    },
    northSouth: 0,
    eastWest: 0,
    Desc: null,
    Expl: null,
    editable: false,
  };
  polys = [];
  rects = [];
  tetras = [];
  otherAreas = [];
  otherMarks = [];
  otherCarIcon = {};
  canvasMarginLeft: number;
  beforeInit = true;
  toMeter = 1000;
  isEditInMap = false;
  unit: string;
  resizeWindow = new Subject();
  debounceTime = 50;
  fitBoundsZIndex: number;

  constructor(
    private userSettingService: UserSettingService,
    private mapService: KbaMapWrapperService,
    private elRef: ElementRef,
    private mapWrapperService: KbaMapWrapperService
  ) { }

  async ngOnInit() {
    const mapParams = this.userSettingService.getMapParams();
    this.unit = this.labels[this.userSettingService.getDistanceUnit()];
    this.mapOptions.center.lat =
      this.initMap[SystemParamater.lat] || +mapParams.lat || 0;
    this.mapOptions.center.lng =
      this.initMap[SystemParamater.lng] || +mapParams.lng || 0;
    this.mapOptions.zoom =
      this.initMap[SystemParamater.zoom] || +mapParams.zoom || 15;
    this.mapOptions.maxClusterZoom = (window as any).settings.maxClusterZoom;
    this.mapOptions.fullscreenControl = false;

    if (this.simpleMap) {
      this.mapOptions = {
        center: this.mapOptions.center,
        zoom: this.mapOptions.zoom,
        disableDefaultUI: true,
      };
    }

    this.mr = await this.mapService.getInstance();
    await this.mr.loadScript();
    this.mr.Map(this.areaCanvas.nativeElement, this.mapOptions);

    setTimeout(async () => {
      this._setDrawOthers(this.others);
      if (this._isPolygon()) {
        this._drawPolygon(this.polyPoints);
      } else if (this._isRectangle()) {
        this._drawCenterMarker(this.rectData);
      } else if (
        this.isLandmark &&
        this.landmarkData &&
        !_.isEmpty(this.landmarkData.coordinates)
      ) {
        this._drawTargetLandmark();
      }
      this.redrawMap();
      if (!this.editable || this.isUpdate) {
        this.onClickFitBounds();
      }
      if (this.editable) {
        this._handleClick(this.mr);
        this._handleAreaChange(this.mr);
      }
      this.beforeInit = false;
      this.onLoad.emit();
    }, 0);

    // 領域表示オプション
    this.editAreaOpts = {
      strokeColor: this.AREA_COLOR.EDIT,
      strokeOpacity: 0.6,
      strokeWeight: 1,
      fillColor: this.AREA_COLOR.EDIT,
      fillOpacity: 0.2,
      clickable: false,
    };
    this.viewAreaOpts = _.extend(_.clone(this.editAreaOpts), {
      strokeColor: this.AREA_COLOR.VIEW,
      fillColor: this.AREA_COLOR.VIEW,
      clickable: false,
    });
    if (this.editable) {
      this.mapService.changePoly.subscribe(polyPoints => {
        this._drawPolygon(polyPoints);
      });
      this.mapService.changeRect.subscribe(rectData => {
        this._drawCenterMarker(rectData);
      });
    }

    // 画面リサイズ時の処理
    this.resizeWindow.pipe(debounceTime(this.debounceTime)).subscribe(() => {
      this.redrawMap();
    });
    window.addEventListener('resize', () => {
      this.resizeWindow.next();
    });

    setTimeout(() => {
      const leafletPane = this.elRef.nativeElement.querySelector('.leaflet-pane');

      if (leafletPane) {
        this.fitBoundsZIndex = +getComputedStyle(leafletPane).zIndex + 1;
      }
    });

  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.beforeInit) {
      return;
    }
    if (changes.no) {
      return;
    }

    if (changes.menuOpen) {
      this.redrawMap();
    } else if (changes.polyPoints && changes.polyPoints.currentValue) {
      if (this.isEditInMap) {
        this.isEditInMap = false;
        return;
      }
      if (
        !_.isEqual(
          changes.polyPoints.currentValue,
          changes.polyPoints.previousValue
        )
      ) {
        this._drawPolygon(changes.polyPoints.currentValue);
      }
    } else if (changes.rectData && changes.rectData.currentValue) {
      if (
        changes.rectData.currentValue &&
        !_.isEqual(
          changes.rectData.currentValue,
          changes.rectData.previousValue
        )
      ) {
        const val = changes.rectData.currentValue;
        this._drawCenterMarker(val);
      }
    } else if (changes.others) {
      this._setDrawOthers(this.others);
    } else if (changes.selectType) {
      this._drawOverlay();
    }
  }

  /**
   * 領域をフィットボタン押下コールバック
   */
  onClickFitBounds(): void {
    if (this._isPolygon() && !_.isEmpty(this.polys)) {
      this.mr.fitBounds(this.mr.getAreasBounds(this.polys));
    } else if (this._isRectangle() && !_.isEmpty(this.rects)) {
      this.mr.fitBounds(this.mr.getAreasBounds(this.rects));
    } else if (this._isTetragon() && !_.isEmpty(this.tetras)) {
      this.mr.fitBounds(this.mr.getAreasBounds(this.tetras));
    }
  }

  /**
   * ナンバーの変更時の処理
   */
  changeNo(): void {
    setTimeout(() => {
      this._drawOverlay();
      this._setDrawOthers(this.others);
      this.onClickFitBounds();
    });
  }

  /**
   * 初期状態のマップを描画
   */
  drawInitMap(): void {
    this._drawOverlay();
    this._setDrawOthers(this.others);
    this.mr.setZoom(this.initMap[SystemParamater.zoom]);
    this.mr.setCenter({
      lat: this.initMap[SystemParamater.lat],
      lng: this.initMap[SystemParamater.lng],
    });
  }

  /**
   * マップ再描画処理
   */
  redrawMap(): void {
    const mapEl = this.elRef.nativeElement.querySelector('.KBA-area-map');
    const canvasEl = this.elRef.nativeElement.querySelector('.KBA-area-canvas');

    let canvasPadding = this.menuPadding;
    if (this.isModal) {
      canvasPadding = canvasPadding - 20;
    }

    if (this.hasMenu) {
      if (this.menuOpen) {
        this.canvasMarginLeft = this.menuWidth;
        canvasEl.style.width =
          mapEl.offsetWidth - this.menuWidth - canvasPadding + 'px';
      } else {
        this.canvasMarginLeft = 0;
        canvasEl.style.width = mapEl.offsetWidth - canvasPadding + 'px';
      }
    } else {
      this.canvasMarginLeft = 0;
      canvasEl.style.width = mapEl.offsetWidth + 'px';
    }

    this.mr.redraw();
  }

  /**
   * マップ内エリアを再描画
   */
  redrawArea(): void {
    this.clearMap();
    if (this.selectType === AreaType.polygon) {
      this._drawPolygon(this.polyPoints);
    } else if (this.selectType === AreaType.point) {
      this._drawCenterMarker(this.rectData);
    }
    this.onClickFitBounds();
  }

  /**
   * マップに描画した入力データを削除する
   */
  clearMap(): void {
    if (this.mark) {
      this.mr.removeLandmark(this.mark);
      this.mark = null;
    }
    _.each(this.rects, o => this.mr.removeLayer(o));
    _.each(this.polys, o => this.mr.removeLayer(o));
    _.each(this.tetras, o => this.mr.removeLayer(o));
    this.polys = [];
    this.rects = [];
    this.tetras = [];
  }

  /**
   * ランドマークを変更する
   */
  updateTargetLandmark(): void {
    this._drawTargetLandmark();
  }

  /**
   * 車両アイコンを描画
   *
   * @param car 車両最新情報
   */
  setDrawOtherCarIcons(cars: CarLatest[]): void {
    if (!cars || _.isEmpty(cars)) {
      return;
    }

    this.mr.clearMarkers();
    const data = cars
      .map(car => {
        return _.get(car, 'latest_status.point.coordinates')
          ? this.mapWrapperService.getCarIconData(car, this.labels)
          : null;
      })
      .filter(Boolean);
    const _window = window as any;
    const args = [
      data.length,
      data,
      _window.settings.mapPerformanceThreshold,
      false,
      null,
      null,
      true,
      { zoom: 8 },
      false,
    ];

    if (this.mr.markerCluster) {
      this.mr.clusterMarkersAll(...args);
    } else {
      this.mr.loadClustererApi().then(() => {
        this.mr.clusterMarkersAll(...args);
      });
    }
  }

  /**
   * マップクリックイベント発生時に実行する処理
   * @param mr マップラッパーオブジェクト
   */
  private _handleClick(mr): void {
    mr.addListener('click', event => {
      const lat = event.latLng ? event.latLng.lat() : event.latlng.lat;
      const lng = event.latLng ? event.latLng.lng() : event.latlng.lng;

      if (this._isPolygon()) {
        if (_.isUndefined(this.polyPoints)) {
          this.polyPoints = [];
        }
        const newPoints = this.polyPoints.concat([
          [this._toFixed(lng % 180), this._toFixed(lat % 90)],
        ]);
        this.changePoints.emit(newPoints);
      } else if (this._isRectangle()) {
        const rectLat = this._toFixed(lat % 90);
        const rectLng = this._toFixed(lng % 180);
        const LatLng: Coordinate = [rectLng, rectLat];
        this.mapService.clickPoly.emit(LatLng);
        this.changeRect.emit(LatLng);
        this._drawCenterMarker({
          centerPoint: LatLng,
          distance: this.rectData.distance,
        });
      } else if (this.isLandmark) {
        if (this.landmarkData != null) {
          this.changeLandmarkCoordinates.emit({
            lng: this._toFixed(lng % 180),
            lat: this._toFixed(lat % 90),
          });
          this._drawTargetLandmark();
        }
      }
    });
  }

  /**
   * マップ変更イベント発生時に実行する処理
   *
   * 変更イベントとしてはポイントのドラッグ移動、右クリックによる削除、前に戻す、などがある
   * (「中心点+幅」状態時には、変更イベントは存在しない)
   *
   * @param mr マップラッパーオブジェクト
   */
  private _handleAreaChange(mr) {
    mr.addListener('AREAS_CHANGED', () => {
      const info = _.last(_.filter(mr.getAreasInfo(), { editable: true }));
      this.isEditInMap = true;

      if (_.isEmpty(info)) {
        this.changePoints.emit([]);
      } else {
        const newPoints = _.map(info.points, p => {
          return [this._toFixed(p[1]), this._toFixed(p[0])];
        });
        this.changePoints.emit(newPoints);
      }
    });
  }

  /**
   * 中心点+幅領域を描画
   *
   * @param rectData 中心点+幅情報
   */
  private _drawCenterMarker(rectData: RectData): void {
    if (_.isEmpty(rectData) || !this._isValidRectData(rectData)) {
      _.each(this.rects, o => this.mr.removeLayer(o));
      if (this.mark) {
        this.mr.removeLandmark(this.mark);
      }
      return;
    }
    const lng = rectData.centerPoint[CoordinateType.LNG];
    const lat = rectData.centerPoint[CoordinateType.LAT];
    const ew = rectData.distance[DistanceType.EW];
    const ns = rectData.distance[DistanceType.NS];
    if (this.mark) {
      this.mr.removeLandmark(this.mark);
    }
    if (
      this._isPolygon() ||
      this._isTetragon() ||
      (lat === null || lng === null)
    ) {
      return;
    }
    this.mr.setCenter({ lat: lat, lng: lng });
    this.mark = this.mr.drawLandmark(
      {
        name: null,
        imgpath: 'area/center.png',
        position: { lat: lat, lng: lng },
      },
      true
    );
    this._drawRectangle(lat, lng, ew, ns);
  }

  /**
   * 中心点+幅領域の幅の範囲部分の描画
   *
   * @param lat 緯度
   * @param lng 経度
   * @param ew 東西距離
   * @param ns 南北距離
   */
  private _drawRectangle(
    lat: number,
    lng: number,
    ew: number,
    ns: number
  ): void {
    _.each(this.rects, o => this.mr.removeLayer(o));
    if (
      this._isPolygon() ||
      this._isTetragon() ||
      (ew === null || ns === null)
    ) {
      return;
    }

    ew = this._convertUnit(ew, this.unit);
    ns = this._convertUnit(ns, this.unit);

    this.rects = this.mr.createAreaOverlays(
      [
        _.extend(_.clone(this.rectOtps), {
          center: {
            lat: lat,
            lng: lng,
          },
          northSouth: ns * this.toMeter,
          eastWest: ew * this.toMeter,
        }),
      ],
      this.editAreaOpts
    );

    _.each(this.rects, o => this.mr.addLayer(o));
  }

  /**
   * 多角形領域を描画
   *
   * @param points ポイント
   */
  private _drawPolygon(points: PolyPoints): void {
    _.each(this.polys, o => this.mr.removeLayer(o));
    if (
      this._isRectangle() ||
      this._isTetragon() ||
      !this._isValidPolygon(points)
    ) {
      return;
    }

    this.polys = this.mr.createAreaOverlays(
      [
        _.extend(_.clone(this.polyOtps), {
          points: _.map(points, point => [
            point[CoordinateType.LAT],
            point[CoordinateType.LNG],
          ]),
          editable: this.editable,
        }),
      ],
      this.editAreaOpts
    );
    _.each(this.polys, o => this.mr.addLayer(o));
  }

  /**
   * 表示タイプ変更時のマップ切り替え描画
   */
  private _drawOverlay(): void {
    this.mr.removeAllListners('addShape');
    this.mr.unsetDrawMode();

    if (this._isPolygon()) {
      _.each(this.rects, o => this.mr.removeLayer(o));
      _.each(this.tetras, o => this.mr.removeLayer(o));
      if (this.mark) {
        this.mr.removeCarMarker(this.mark);
      }
      this._drawPolygon(this.polyPoints);
    } else if (this._isRectangle()) {
      _.each(this.polys, o => this.mr.removeLayer(o));
      _.each(this.tetras, o => this.mr.removeLayer(o));
      this._drawCenterMarker(this.rectData);
    }
  }

  /**
   * 登録済みエリア/ランドマーク/車両アイコンを描画
   *
   * @param others 登録済みエリア/ランドマーク/車両アイコン情報
   */
  private _setDrawOthers(others: Others): void {
    if (others) {
      this._setDrawOtherAreas(others.areas);
      this._setDrawOtherLandmarks(others.landmarks);
      this.setDrawOtherCarIcons(others.cars);
    }
  }

  /**
   * 登録済みエリアを描画
   *
   * @param areas 登録済みエリア情報
   */
  private _setDrawOtherAreas(areas: Area[]): void {
    const viewAreas = [];
    _.each(this.otherAreas, o => this.mr.removeLayer(o));

    _.each(areas, area => {
      if (this.params) {
        if (this.params.no === area.no) {
          return true;
        }
      } else if (this.no) {
        if (this.no === area.no) {
          return true;
        }
      }

      _.each(_.get(area, 'feature.geometry.coordinates', []), co => {
        viewAreas.push(
          _.extend(_.clone(this.polyOtps), {
            points: _.map(co, c => [
              c[CoordinateType.LAT],
              c[CoordinateType.LNG],
            ]),
            Desc: area.label,
            Expl: area.description,
            showInfoWindowDefault: true,
            infoWindowAutoPan: false,
          })
        );
      });
    });
    this.otherAreas = _.each(
      this.mr.createAreaOverlays(viewAreas, this.viewAreaOpts),
      o => this.mr.addLayer(o)
    );
  }

  /**
   * ランドマークを描画
   *
   * @param landmarks ランドマーク情報
   *
   * TODO: ha-inoue イメージは仮置きのため要修正
   */
  private _setDrawOtherLandmarks(landmarks: Landmark[]): void {
    const viewMarks = [];
    _.each(this.otherMarks, o => this.mr.removeLandmark(o));
    _.each(landmarks, landmark => {
      if (_.get(landmark, `point.coordinates`)) {
        viewMarks.push({
          name: landmark.label,
          iconUrl: _.get(landmark, 'icon.image'),
          position: {
            lat: _.get(landmark, `point.coordinates[${CoordinateType.LAT}]`),
            lng: _.get(landmark, `point.coordinates[${CoordinateType.LNG}]`),
          },
        });
      }
    });
    this.otherMarks = this.mr.drawLandmarks(viewMarks, true);
  }

  /**
   * 車両アイコンを描画
   *
   * @param car 車両最新情報
   */
  private _setDrawOtherCarIcons(cars: CarLatest[]): void {
    if (!cars || _.isEmpty(cars)) {
      return;
    }

    this.mr.clearMarkers();
    const data = cars
      .map(car => {
        return _.get(car, 'latest_status.point.coordinates')
          ? this.mapWrapperService.getCarIconData(car, this.labels)
          : null;
      })
      .filter(Boolean);
    const _window = window as any;
    const args = [
      data.length,
      data,
      _window.settings.mapPerformanceThreshold,
      false,
      null,
      null,
      true,
      { zoom: 8 },
      false,
    ];

    if (this.mr.markerCluster) {
      this.mr.clusterMarkersAll(...args);
    } else {
      this.mr.loadClustererApi().then(() => {
        this.mr.clusterMarkersAll(...args);
      });
    }
  }

  /**
   * 指定桁数での値の四捨五入
   * @param value 値
   * @param dig 有効な小数点以下桁数
   */
  private _toFixed(value: number, dig: number = 8): number {
    return _.floor(value, dig);
  }

  /**
   * 単位変換処理
   * @param value 値
   * @param unit 単位
   */
  private _convertUnit(value: number, unit: string): number {
    if (unit === 'mile') {
      // mile変換後、小数点第2位で固定する
      return this._toFixed(this._milesToKm(value, unit), 2);
    } else {
      // 小数点第2位で固定する
      return this._toFixed(value, 2);
    }
  }

  /**
   * 単位によって数値を変換
   * @param value 値
   * @param unit 単位
   */
  private _milesToKm(value, unit: string): number {
    const f = parseFloat(value);
    if (_.isNaN(f)) {
      return 0;
    } else {
      return f * this.UNIT_MILE;
    }
  }

  private _isValidPolygon(points: PolyPoints): boolean {
    return (
      !_.isEmpty(points) &&
      _.every(points, p => {
        return (
          _.isNumber(p[CoordinateType.LAT]) && _.isNumber(p[CoordinateType.LNG])
        );
      })
    );
  }

  private _isValidRectData(rectData: RectData): boolean {
    return (
      _.every(rectData.centerPoint, c => !_.isString(c)) &&
      _.every(rectData.distance, d => !_.isString(d))
    );
  }

  private _isPolygon() {
    return this.selectType === AreaType.polygon;
  }
  private _isRectangle() {
    return this.selectType === AreaType.point;
  }
  private _isTetragon() {
    return false;
  }

  /**
   * 対象のランドマークを描画
   *
   * TODO: ha-inoue イメージは仮置きのため要修正
   */
  private _drawTargetLandmark(): void {
    if (this.mark) {
      this.mr.removeLandmark(this.mark);
    }
    const {
      coordinates,
      icon: { image },
    } = this.landmarkData;
    this.mr.setCenter(coordinates);
    this.mark = this.mr.drawLandmark(
      {
        name: null,
        iconUrl: image,
        position: coordinates,
      },
      true
    );
  }
}
