import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import * as _ from 'lodash';

import { AreaType } from '../../../constants/flm/group-area';
import { SystemParamater } from '../../../constants/system-paramater';

import { UserSettingService } from '../../../services/api/user-setting.service';
import { KbaMapWrapperService } from '../../../services/shared/kba-map-wrapper.service';

import { CoordinateType, DistanceType } from './area';

@Component({
  selector: 'app-kba-area-menu',
  templateUrl: 'kba-area-menu.component.html',
  styleUrls: ['kba-area-menu.component.scss'],
  animations: [
    trigger('menuState', [
      state(
        'open',
        style({
          left: 0,
        })
      ),
      state(
        'close',
        style({
          left: '-312px',
        })
      ),
      transition('open => close', animate('300ms')),
      transition('close => open', animate('300ms')),
    ]),
  ],
})
export class KbaAreaMenuComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() number;
  @Input() initMap;
  @Input() menuOpen: boolean;
  @Input() polyPoints;
  @Input() rectData;
  @Input() set pointNum(value: number) {
    this.pointNumValue = value;

    const control = this.formGroup.get(this.pointNumName);
    if (control != null) {
      control.setValue(value);
    }
  }
  @Input() typeResourceValues: any;
  @Input() labels: any;
  @Input() resource: any;
  @Input() resourceType = '';
  @Input() editable: boolean;
  @Input() isCurrent: boolean;
  @Input() selectType: string;
  @Input() selectTypeLabel: string;
  @Input() errorData;
  @Output() delPolyPoint = new EventEmitter<any>();
  @Output() changeMenuOpen = new EventEmitter<boolean>();
  @Output() changeSelectType = new EventEmitter<string>();
  @Output() changePolyPoints = new EventEmitter<any>();

  menuState: string;
  pointNumName = 'pointNum';
  pointNumValue: number;
  coordinateType = CoordinateType;
  distanceType = DistanceType;
  unit: string;
  maxPoint: number;
  latitudeNmae: string;
  longitudeName: string;
  ewName: string;
  nsName: string;

  get isPolygon(): boolean {
    return this._checkAreaType(AreaType.polygon);
  }

  get isPoint(): boolean {
    return this._checkAreaType(AreaType.point);
  }

  constructor(
    private mapService: KbaMapWrapperService,
    private userSettingService: UserSettingService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.unit = this.labels[this.userSettingService.getDistanceUnit()];
    if (this.formGroup) {
      this.formGroup.addControl('coordinates', new FormGroup({}));
    }
    if (this.menuOpen) {
      this.menuState = 'open';
    } else {
      this.menuState = 'close';
    }
    if (!this.editable) {
      this._setResourceName(this.resource, this.resourceType);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectType) {
      if (!this.editable) {
        return;
      }

      if (changes.selectType.currentValue === AreaType.polygon) {
        this._setPolyPointNumControl(this.pointNumName);
      } else {
        this.formGroup.removeControl(this.pointNumName);
      }
    }
  }

  /**
   * エリアタイプ変更時コールバック
   * @param value エリアタイプ値
   */
  onChangeMenuType(value): void {
    if (value === AreaType.polygon) {
      this._setPolyPointNumControl(this.pointNumName);
    } else {
      this.formGroup.removeControl(this.pointNumName);
    }
    this.changeSelectType.emit(value);
    this.cdRef.detectChanges();
  }

  /**
   * メニュー開閉ボタン押下コールバック
   */
  onClickToggle(): void {
    this._toggle();
  }

  /**
   * 多角形の入力欄変更時コールバック
   * @param polyData 入力データ
   */
  onChangePolyPointInput(polyData): void {
    _.merge(this.polyPoints[polyData.index], polyData.data);
    this.cdRef.detectChanges();
    this.changePolyPoints.emit(this.polyPoints);
    this.mapService.changePoly.emit(this.polyPoints);
  }

  /**
   * 中心点（中心点+幅）の入力欄変更時コールバック
   * @param centerPoint 入力データ
   */
  onChangeCenterPointInput(centerPoint): void {
    this.rectData.centerPoint = centerPoint.data;
    this.mapService.changeRect.emit(this.rectData);
  }

  /**
   * 幅（中心点+幅）の入力欄変更時コールバック
   * @param distance 入力データ
   */
  onChangeDistanceInput(distance): void {
    this.rectData.distance = distance.data;
    this.mapService.changeRect.emit(this.rectData);
  }

  /**
   * 多角形メニューの削除ボタン押下時コールバック
   * @param polyData 入力データ
   */
  onClickDelPoint(index: number): void {
    const points = _.filter(this.polyPoints, (p, i) => {
      return index !== i;
    });
    this.delPolyPoint.emit(points);
    this.cdRef.detectChanges();
  }

  private _setResourceName(resource, resourceType: string): void {
    const resLat = _.get(
      resource,
      resourceType + '.feature.geometry.coordinates[1]'
    );
    this.latitudeNmae = resLat ? resLat.name : this.labels.latitude;
    const resLng = _.get(
      resource,
      resourceType + '.feature.geometry.coordinates[0]'
    );
    this.longitudeName = resLng ? resLng.name : this.labels.longitude;
    const resEw = _.get(
      resource,
      resourceType + '.feature.properties.east_west_distance'
    );
    this.ewName = resEw ? resEw.name : this.labels.east_west_distance;
    const resNs = _.get(
      resource,
      resourceType + '.feature.properties.north_south_distance'
    );
    this.nsName = resNs ? resNs.name : this.labels.north_south_distance;
  }

  private _checkAreaType(type: string): boolean {
    return this.selectType === type;
  }

  /**
   * 多角形領域用の頂点数をフォームにセットする（バリデーション用）
   * @param name フォームコントロール名
   */
  private _setPolyPointNumControl(name: string): void {
    this.maxPoint = this.initMap[SystemParamater.maxPoint];
    const fc = new FormControl(this.pointNumValue, [
      Validators.min(3),
      Validators.max(this.maxPoint),
    ]);
    this.formGroup.addControl(name, fc);
  }

  /**
   * メニュー開閉状態のトグル処理
   */
  private _toggle(): void {
    if (this.menuOpen) {
      this._close();
    } else {
      this._open();
    }
  }

  /**
   * メニューの閉じる処理
   */
  private _close(): void {
    this.menuState = 'close';
    this.changeMenuOpen.emit(false);
  }

  /**
   * メニューの開く処理
   */
  private _open(): void {
    this.menuState = 'open';
    this.changeMenuOpen.emit(true);
  }
}
