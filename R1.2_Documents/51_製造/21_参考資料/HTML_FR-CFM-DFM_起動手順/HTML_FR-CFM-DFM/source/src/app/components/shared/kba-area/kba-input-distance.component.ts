import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormControl, Validators, ValidatorFn } from '@angular/forms';
import * as _ from 'lodash';

import { KbaMapWrapperService } from '../../../services/shared/kba-map-wrapper.service';
import { UserSettingService } from '../../../services/api/user-setting.service';

import { DistanceType } from '../../shared/kba-area/area';

@Component({
  selector: 'app-kba-input-distance',
  templateUrl: 'kba-input-distance.component.html',
  styleUrls: ['kba-input-distance.component.scss'],
})
export class KbaInputDistanceComponent implements OnInit, OnDestroy {
  @Input() formGroup;
  @Input() name: string;
  @Input() distance;
  @Input() labels: any;
  @Input() resource;
  @Input() resourceType: string;
  @Input() required: boolean;
  @Input() step: number;
  @Input() number: number;
  @Input() point: any;
  @Input() inputSuffix: string;
  @Input() editable: boolean;
  @Input() errorData;
  @Output() changeDistanceInput = new EventEmitter<any>();

  fName: string[] = [];
  numberStr: string;
  distanceType = DistanceType;
  pattern = '^[0-9]+(.[0-9]+)?$';
  resPaths;
  resName;

  constructor(private mapService: KbaMapWrapperService) {}

  ngOnInit() {
    let valOpts;
    this.numberStr = this._getNumberStr(this.number);
    valOpts = { required: this.required };
    this._setInitItems('ew', this.numberStr, DistanceType.EW, valOpts);
    valOpts = { required: this.required };
    this._setInitItems('ns', this.numberStr, DistanceType.NS, valOpts);
    this.resPaths = this._getResPaths(this.resourceType);
    this.resName = this._getResName(this.resource, this.resPaths);
  }

  /**
   * フォームコントロールの削除
   */
  ngOnDestroy() {
    this.formGroup.removeControl(this.fName[DistanceType.NS]);
    this.formGroup.removeControl(this.fName[DistanceType.EW]);
  }

  /**
   * 東西入力欄変更時コールバック
   * @param valueStr 新入力データ
   */
  onChangeEwInput(valueStr: string): void {
    this._changeInput(DistanceType.EW, valueStr);
  }

  /**
   * 南北入力欄変更時コールバック
   * @param valueStr 新入力データ
   */
  onChangeNsInput(valueStr: string): void {
    this._changeInput(DistanceType.NS, valueStr);
  }

  /**
   * 初期状態のセット
   * @param name 名前
   * @param number 番号
   * @param type タイプ(東西 / 南北)
   * @param valOpts バリデーションオプション
   */
  private _setInitItems(
    name: string,
    number: string,
    type: DistanceType,
    valOpts: any
  ) {
    this.fName[type] = name + number;
    const vals = this._buildValidators(valOpts);
    const fc = new FormControl(this.distance[type], vals);
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
   */
  private _getNumberStr(number): string {
    return number ? number : '';
  }

  /**
   * 入力処理
   * @param type タイプ(東西 / 南北)
   * @param valueStr 入力値
   */
  private _changeInput(type: DistanceType, valueStr: string): void {
    const distance = _.cloneDeep(this.distance);
    distance[type] = _.isEmpty(valueStr) ? '' : Number(valueStr) || valueStr;
    this.changeDistanceInput.emit({ data: distance });
  }

  private _getResPaths(resourceType: string) {
    return {
      ew: `${resourceType}.feature.properties.east_west_distance`,
      ns: `${resourceType}.feature.properties.north_south_distance`,
    };
  }

  private _getResName(resource, resPaths) {
    const ewRes = _.get(resource, resPaths.ew);
    const nsRes = _.get(resource, resPaths.ns);

    return {
      ew: ewRes ? ewRes.name : '',
      ns: nsRes ? nsRes.name : '',
    };
  }
}
