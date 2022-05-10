import { Component, Input } from '@angular/core';
import * as _ from 'lodash';
import { Resource, Resources } from 'app/types/common';

@Component({
    selector: 'app-search-conditions',
    templateUrl: './search-conditions.component.html',
    styleUrls: ['./search-conditions.component.scss'],
})
export class SearchConditionsComponent {

    @Input() public params: any;
    @Input() public resource: Resources;
    @Input() public selectorKeys: {
        supportDistributor?: string;
        subGroup?: string;
        customer?: string;
    };
    @Input() public selectedParams: {
        supportDistributor?: string[];
        subGroup?: string[];
        customer?: string[];
    };
    @Input() public modelCarTypeCheck: boolean;
    @Input() public pageCount: string;

    /**
     * 検索条件のパスの一覧
     */
    public get searchConditionPaths(): string[] {
        const paths: string[] = this._getNestedKeys(this.params);
        const selectorPaths: string[] = _.values(this.selectorKeys);

        return _.uniq(paths.concat(selectorPaths));
    }

    /**
     * パスで指定したパラメータ値（画面表示用）を取得
     * @param path パス
     */
    public paramsValue(path: string): string {
        const selKeys: any = <any>this.selectorKeys;
        const selectedParams: _.Dictionary<string[]> = this.selectedParams
            ? _.mapKeys(
                this.selectedParams,
                (_val: string[], key: string) => selKeys[key]
            )
            : {};
        const res: any = _.get(this.resource, path);
        const value: any = _.get({ ...this.params, ...selectedParams }, path);

        if (res == null) {
            return null;
        }

        if (path === 'car_management.time_difference') {
            return !value
                ? this.resource.car_management.time_difference_setting.values.find(
                    (val: any) => val.value === '0'
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
    public resourceName(path: string): string {
        const res: any = _.get(this.resource, path);

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
        const res: any = _.get(this.resource, path);
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
    private _getNestedKeys(params: any, nestedKey: string = null): string[] {
        if (_.isArray(params) || !_.isObject(params)) {
            return [nestedKey];
        }
        return _.flatten(
            _.map(_.keys(params), (key: string) => {
                const p: any = params;
                return this._getNestedKeys(
                    p[key],
                    _.join(_.compact([nestedKey, key]), '.')
                );
            })
        );
    }
}
