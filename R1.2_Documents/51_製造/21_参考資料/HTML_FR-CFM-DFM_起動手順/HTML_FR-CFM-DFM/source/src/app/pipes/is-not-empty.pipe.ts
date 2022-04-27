import { Pipe, PipeTransform } from '@angular/core';
import { isEmpty } from 'lodash';

@Pipe({
  name: 'isNotEmpty',
  pure: false,
})
export class IsNotEmptyPipe implements PipeTransform {
  transform(value: string | string[] | object): boolean {
    return !isEmpty(value);
  }
}
