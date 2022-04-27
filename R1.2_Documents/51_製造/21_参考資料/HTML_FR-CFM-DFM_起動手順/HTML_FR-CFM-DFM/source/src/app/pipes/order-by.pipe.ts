import { Pipe, PipeTransform } from '@angular/core';
import { orderBy } from 'lodash';

@Pipe({
  name: 'orderBy',
  pure: false,
})
export class OrderByPipe implements PipeTransform {
  transform(value: any[], params?: any, sort?: string | string[]): any[] {
    return orderBy(value, params, sort);
  }
}
