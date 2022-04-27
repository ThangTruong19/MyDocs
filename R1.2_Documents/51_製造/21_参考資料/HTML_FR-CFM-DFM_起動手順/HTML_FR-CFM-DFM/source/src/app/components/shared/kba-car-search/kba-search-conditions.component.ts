import { Component, Input } from '@angular/core';
import * as _ from 'lodash';
import { Resource } from '../../../types/common';
@Component({
  selector: 'app-kba-search-conditions',
  templateUrl: './kba-search-conditions.component.html',
  styleUrls: ['./kba-search-conditions.component.scss'],
})
export class KbaSearchConditionsComponent {
  @Input() params: any;
  @Input() resource: any;
  @Input() selectorKeys: {
    supportDistributor?: string;
    subGroup?: string;
    customer?: string;
  };
  @Input() selectedParams: {
    supportDistributor?: string[];
    subGroup?: string[];
    customer?: string[];
  };
  @Input() modelCarTypeCheck: boolean;
  @Input() pageCount: string;

  /**
   * 検索条件のパスの一覧
   */
  get searchConditionPaths() {
    const paths = this._getNestedKeys(this.params);
    const selectorPaths = _.values(this.selectorKeys);

    return _.uniq(paths.concat(selectorPaths));
  }

  /**
   * パスで指定したパラメータ値（画面表示用）を取得
   * @param path パス
   */
  paramsValue(path: string) {
    const selectedParams = this.selectedParams
      ? _.mapKeys(
          this.selectedParams,
          (_val: string[], key: string) => this.selectorKeys[key]
        )
      : {};
    const res = _.get(this.resource, path);
    const value = _.get({ ...this.params, ...selectedParams }, path);

    if (res == null) {
      return;
    }

    if (path === 'car_management.time_difference') {
      return !value
        ? this.resource.car_management.time_difference_setting.values.find(
            val => val.value === '0'
          ).name
        : [value.slice(0, 3), value.slice(3)].join(':');
    }

    if (
      this.modelCarTypeCheck &&
      [
        'common.car_identification.models',
        'common.car_identification.type_revs',
      ].includes(path)
    ) {
      return null;
    }

    if (
      !this.modelCarTypeCheck &&
      path === 'common.car_identification.model_type_revs'
    ) {
      return null;
    }

    let resource: Resource | null;
    if (
      !!value &&
      ((resource = _.get(this.resource, path)) != null &&
        resource.values.length > 0)
    ) {
      if (_.isArray(value)) {
        return _.map(value, v => this._getResourceValueName(path, v)).join(',');
      } else {
        return this._getResourceValueName(path, value);
      }
    }
    return value;
  }

  /**
   * パスで指定したリソースの名前を取得
   * @param path パス
   */
  resourceName(path: string): string {
    const res = _.get(this.resource, path);

    if (res && path === 'car_management.time_difference') {
      return this.resource.car_management.time_difference_setting.name;
    }

    return res ? res.name : '';
  }

  /**
   * リソース値の名称取得
   *
   * リソースパスで指定したリソースについて、値に対応する名前を取得する。
   *
   * @param path リソースのパス
   * @param value 値
   */
  private _getResourceValueName(path: string, value: string): string {
    const res = _.get(this.resource, path);
    if (res) {
      const v = _.find(res.values, item => item.value === value);
      return v ? v.name : '';
    } else {
      return '';
    }
  }

  /**
   * ネストしているパラメータオブジェクトからキーを取得する
   * @param params パラメータオブジェクト
   * @param nestedKey ネストキー
   * @return ネストキーの配列
   */
  private _getNestedKeys(params: any, nestedKey = null): string[] {
    if (_.isArray(params) || !_.isObject(params)) {
      return nestedKey;
    }
    return _.flatten(
      _.map(_.keys(params), key => {
        return this._getNestedKeys(
          params[key],
          _.join(_.compact([nestedKey, key]), '.')
        );
      })
    );
  }
}
