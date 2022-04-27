import { Pipe, PipeTransform } from '@angular/core';
import { values, has, omit } from 'lodash';

@Pipe({
  name: 'values',
  pure: false,
})
export class ValuesPipe implements PipeTransform {
  transform(object: Object, opt: any = {}): any[] {
    let obj = object;
    if (has(opt, 'exclusion')) {
      obj = omit(object, opt.exclusion);
    }
    return values(obj);
  }
}
