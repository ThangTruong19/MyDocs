import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormControl, Validators, ValidatorFn } from '@angular/forms';
import { SubscriptionLike as ISubscription } from 'rxjs';
import * as _ from 'lodash';

import { CoordinateType } from '../../shared/kba-area/area';
import { PointType } from '../../../constants/flm/group-area';

import { KbaMapWrapperService } from '../../../services/shared/kba-map-wrapper.service';

@Component({
  selector: 'app-kba-input-point',
  templateUrl: 'kba-input-point.component.html',
  styleUrls: ['kba-input-point.component.scss'],
})
export class KbaInputPointComponent implements OnInit, OnDestroy {
  @Input() formGroup;
  @Input() type;
  @Input() number;
  @Input() name;
  @Input() labels;
  @Input() resource;
  @Input() resourceType: string;
  @Input() required;
  @Input() step;
  @Input() index;
  @Input() point;
  @Input() placeholder;
  @Input() inputSuffix;
  @Input() editable: boolean;
  @Input() errorData;
  @Output() changePointInput = new EventEmitter<any>();

  fName: string[] = [];
  numberStr: string;
  coordinateType = CoordinateType;
  subscription: ISubscription;
  pattern = '^-?[0-9]+(.[0-9]+)?$';
  resPaths;
  resName;

  constructor(private mapService: KbaMapWrapperService) {}

  ngOnInit() {
    let valOpts;
    this.numberStr = this.numberStr = this._getNumberStr(
      this.number,
      this.index
    );
    valOpts = { required: this.required };
    this._setInitItems(
      this.type + 'lat',
      this.numberStr,
      CoordinateType.LAT,
      valOpts
    );
    valOpts = { required: this.required };
    this._setInitItems(
      this.type + 'lng',
      this.numberStr,
      CoordinateType.LNG,
      valOpts
    );
    this.resPaths = this._getResPaths(this.resourceType);
    this.resName = this._getResName(this.resource, this.resourceType);
    this.subscription = this.mapService.clickPoly.subscribe(point => {
      this.point = point;
      this.formGroup
        .get(this.fName[CoordinateType.LAT])
        .setValue(this.point[CoordinateType.LAT]);
      this.formGroup
        .get(this.fName[CoordinateType.LNG])
        .setValue(this.point[CoordinateType.LNG]);
    });
  }

  /**
   * フォームコントロールの削除
   */
  ngOnDestroy() {
    this.formGroup.removeControl(this.fName[CoordinateType.LAT]);
    this.formGroup.removeControl(this.fName[CoordinateType.LNG]);
    this.subscription.unsubscribe();
  }

  /**
   * 緯度入力欄変更時コールバック
   * @param valueStr 新入力データ
   */
  onChangeLatInput(valueStr: string): void {
    this._changeInput(CoordinateType.LAT, valueStr);
  }

  /**
   * 経度入力欄変更時コールバック
   * @param valueStr 新入力データ
   */
  onChangeLngInput(valueStr: string): void {
    this._changeInput(CoordinateType.LNG, valueStr);
  }

  /**
   * 初期状態のセット
   * @param name 名前
   * @param number 番号
   * @param type タイプ(緯度 / 経度)
   * @param valOpts バリデーションオプション
   */
  private _setInitItems(
    name: string,
    number: string,
    type: CoordinateType,
    valOpts: any
  ) {
    this.fName[type] = name + number;
    const vals = this._buildValidators(valOpts);
    const fc = new FormControl(this.point[type], vals);
    this.formGroup.addControl(this.fName[type], fc);
  }

  /**
   * バリデーション定義の作成
   * @param opt オプション
   * @return バリデーション定義
   */
  private _buildValidators(opt: any = {}): ValidatorFn[] {
    const vFs = [];
    if (opt.required) {
      vFs.push(Validators.required);
    }
    return vFs;
  }

  /**
   * ナンバー値取得
   * @param number ナンバー
   * @param index インデックス
   */
  private _getNumberStr(number, index) {
    if (number && index) {
      return number + '-' + index;
    } else if (number) {
      return number;
    } else if (index) {
      return index;
    } else {
      return '';
    }
  }

  /**
   * 入力処理
   * @param type タイプ(緯度 / 経度)
   * @param valueStr 入力値
   */
  private _changeInput(type: CoordinateType, valueStr: string) {
    const point = _.cloneDeep(this.point);
    point[type] = _.isEmpty(valueStr) || _.isNaN(+valueStr) ? '' : +valueStr;
    this.changePointInput.emit({ index: this.index, data: point });
  }

  private _getResPaths(resourceType) {
    // 多角形or中心点+幅でパスを変更する
    if (this.type === PointType.polygon) {
      return {
        lat: `${resourceType}.feature.geometry.coordinates[0][${this.index}][${CoordinateType.LAT}]`,
        lng: `${resourceType}.feature.geometry.coordinates[0][${this.index}][${CoordinateType.LNG}]`,
      };
    } else {
      return {
        lat: `${resourceType}.feature.geometry.coordinates[${CoordinateType.LAT}]`,
        lng: `${resourceType}.feature.geometry.coordinates[${CoordinateType.LNG}]`,
      };
    }
  }

  private _getResName(resource, resourceType) {
    const latRes = _.get(
      resource,
      `${resourceType}.feature.geometry.coordinates[${CoordinateType.LAT}]`
    );
    const lngRes = _.get(
      resource,
      `${resourceType}.feature.geometry.coordinates[${CoordinateType.LNG}]`
    );

    return {
      lat: latRes ? latRes.name : '',
      lng: lngRes ? lngRes.name : '',
    };
  }
}
