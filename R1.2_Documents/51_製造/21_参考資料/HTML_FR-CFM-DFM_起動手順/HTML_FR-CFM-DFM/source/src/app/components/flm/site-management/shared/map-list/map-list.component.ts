import * as _ from 'lodash';

import {
  Component,
  OnChanges,
  Input,
  ViewChildren,
  QueryList,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { KbaAreaMapComponent } from '../../../../shared/kba-area/kba-area-map.component';
import { CoordinateType } from '../../../../shared/kba-area/area';
import { KbaMapWrapperService } from '../../../../../services/shared/kba-map-wrapper.service';
import { UserSettingService } from '../../../../../services/api/user-setting.service';

@Component({
  selector: 'app-map-list',
  templateUrl: './map-list.component.html',
  styleUrls: ['./map-list.component.scss'],
})
export class MapListComponent implements OnChanges {
  listIndex = 0;
  loadCount = 4;
  _list = [];

  @ViewChildren(KbaAreaMapComponent) areaMapComponentList: QueryList<
    KbaAreaMapComponent
  >;

  @Input() set list(val) {
    this._list = val;

    setTimeout(() => {
      this.listIndex = this.loadCount;
    });
  }

  get list() {
    return this._list;
  }

  @Input() filteredList = [];
  @Input() labels;
  @Input() link: string;
  @Input() hasList: boolean;

  constructor(
    private ref: ChangeDetectorRef,
    private mapWrapperService: KbaMapWrapperService,
    private userSettingService: UserSettingService
  ) {}

  get visibleList() {
    return this.list.slice(0, Math.min(this.list.length, this.listIndex));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.filteredList) {
      this.ref.detectChanges();
      this.areaMapComponentList.forEach(map => map.mr && map.redrawMap());
    }
  }

  /**
   * 「もっと見る」押下時のコールバック
   */
  handleClickSeeMore() {
    this.listIndex += this.loadCount;
  }

  /**
   * マップロード時の処理
   * @param item 項目
   */
  async handleMapLoad(item) {
    item.loaded = true;

    const target = this.areaMapComponentList.find(map => item.id === map.id);
    let latLngs = item.cars
      .map(car => {
        const coordinates = _.get(car, 'latest_status.point.coordinates');
        return coordinates
          ? {
              lat: coordinates[CoordinateType.LAT],
              lng: coordinates[CoordinateType.LNG],
            }
          : null;
      })
      .filter(Boolean);
    const markers = item.cars.map(car =>
      this.mapWrapperService.getCarIconData(car, this.labels)
    );

    const isArea = _.get(item, 'feature.geometry.coordinates');

    if (isArea) {
      const coordinates = item.feature.geometry.coordinates;
      const polygons = coordinates.map(polygon =>
        polygon.map(point => ({
          lat: point[CoordinateType.LAT],
          lng: point[CoordinateType.LNG],
        }))
      );
      latLngs = _.flatten(polygons);
      const areas = this._createAreaOverlays(target, coordinates);
      areas.forEach(area => target.mr.addLayer(area));
    }
    const mapParams = this.userSettingService.getMapParams();

    if (latLngs.length > 0) {
      isArea ?
        target.mr.fitBounds(target.mr.createBounds(latLngs)) :
        target.mr.fitBoundsWithMaxZoom(target.mr.createBounds(latLngs), +mapParams.zoom);
    } else {
      const { lat, lng } = mapParams;

      target.mr.setCenter({ lat: +lat, lng: +lng });
    }

    const _window = window as any;
    target.mr.loadClustererApi().then(() => {
      target.mr.clusterMarkersAll(
        markers.length,
        markers,
        _window.settings.mapPerformanceThreshold,
        false,
        null,
        null,
        false
      );

      if (target.mr.getZoom() > _window.settings.jobSiteMapMaxZoomLevel) {
        target.mr.setZoom(_window.settings.jobSiteMapMaxZoomLevel);
        target.redrawMap();
      }
    });
  }

  /**
   * エリアのオーバーレイを作成する
   * @param map マップ
   * @param coordinates ポリゴンの配列
   */
  private _createAreaOverlays(
    map: KbaAreaMapComponent,
    coordinates: number[][][]
  ) {
    return map.mr.createAreaOverlays(
      coordinates.map(polygon => ({
        type: 'polygon',
        points: polygon.map(latLng => [
          latLng[CoordinateType.LAT],
          latLng[CoordinateType.LNG],
        ]),
      })),
      map.editAreaOpts
    );
  }
}
