import { Injectable } from '@angular/core';
import { Resource, Resources } from 'app/types/common';
import * as _ from 'lodash';

@Injectable()
export class ResourceService {
    private resultData: Resources = {};

    constructor() { }

    /**
     * 要素情報のオブジェクト変換処理
     * @param resultData 要素情報取得APIで取得したデータ
     */
    public parse(resultData: any): any {
        this.resultData = _.reduce(
            resultData.resources,
            (result, resource) => {
                const val: Resource = {
                    name: resource.name,
                    type: resource.type,
                    help: resource.help,
                    placeholder_text: resource.placeholder_text,
                    values: _.map(resource.items, function (v: any) {
                        return {
                            value: v.value,
                            name: v.key,
                            kind: v.kind,
                        };
                    }),
                };

                const currentResource: never = _.get(result, resource.path);
                _.set(
                    result,
                    resource.path,
                    currentResource == null ? val : _.merge({}, currentResource, val)
                );

                return result;
            },
            {}
        );

        return this.resultData;
    }
}
