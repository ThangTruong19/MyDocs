import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable()
export class ResourceService {
  private resultData: any = {};

  constructor() {}

  /**
   * 要素情報のオブジェクト変換処理
   * @param resultData 要素情報取得APIで取得したデータ
   */
  parse(resultData: any) {
    this.resultData = _.reduce(
      resultData.resources,
      (result, resource) => {
        const val = {
          name: resource.name,
          type: resource.type,
          help: resource.help,
          placeholder_text: resource.placeholder_text,
          values: _.map(resource.items, function(v: any) {
            return {
              value: v.value,
              name: v.key,
              kind: v.kind,
            };
          }),
        };

        const currentResource = _.get(result, resource.path);
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
