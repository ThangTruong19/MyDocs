import { Component, Input, ViewChild, OnInit, ElementRef } from '@angular/core';
import { isArray, isPlainObject } from 'lodash';
import { KbaAreaMapComponent } from '../../../../shared/kba-area/kba-area-map.component';
import { SystemParamater } from '../../../../../constants/system-paramater';
import { KbaMapWrapperService } from '../../../../../services/shared/kba-map-wrapper.service';

@Component({
  selector: 'app-group-detail-modal',
  templateUrl: './detail-modal.component.html',
  styleUrls: ['./detail-modal.component.scss'],
})
export class GroupDetailModalComponent implements OnInit {
  @Input() labels;
  @Input() keyPersonHeader;
  @Input() keyPersonParams;
  @Input() groupInfoHeader;
  @Input() groupInfoParams;
  @Input() hasMap: boolean;
  @Input() mapParams;

  @ViewChild(KbaAreaMapComponent, { static: false }) map: KbaAreaMapComponent;

  constructor(
    private mapWrapperService: KbaMapWrapperService,
    private el: ElementRef
  ) {}

  ngOnInit() {
    if (this.hasMap) {
      this.mapWrapperService.refreshMapConfig(this.mapParams.mapApplication);
    }
  }

  onMapLoad() {
    this._refreshMap();
  }

  /**
   * パラメータの種別を取得
   * @param value パラメータの値
   */
  getParamType(value) {
    let depth = 0;
    let temp = value;

    if (value && (value.isMap || (value.lat && value.lng && value.zoom))) {
      return 'map';
    }

    if (isArray(value) && isPlainObject(value[0])) {
      return 'object';
    }

    while (isArray(temp)) {
      temp = temp[0];
      depth++;
    }

    return ['string', 'list', 'table'][depth];
  }

  /**
   * マップの情報を更新する
   */
  private _refreshMap() {
    this.el.nativeElement.querySelector('.map-container').style.height =
      '400px';
    this.el.nativeElement.querySelector('.map-container').style.position =
      'relative';

    this.map.redrawMap();
    this.map.mr.setCenter({
      lat: +this.mapParams.lat,
      lng: +this.mapParams.lng,
    });
    this.map.mr.setZoom(+this.mapParams.zoom);
    this.map.redrawMap();
  }
}
