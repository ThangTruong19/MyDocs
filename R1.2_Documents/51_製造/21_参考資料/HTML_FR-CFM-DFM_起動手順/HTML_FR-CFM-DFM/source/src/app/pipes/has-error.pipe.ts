import { some, includes } from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';

import { ErrorData } from '../types/error-data';

@Pipe({
  name: 'hasError',
})
export class HasErrorPipe implements PipeTransform {
  transform(errorData: ErrorData, path: string): boolean {
    if (errorData && errorData.length > 0) {
      return some(errorData, data => includes(data.keys, path));
    } else {
      return false;
    }
  }
}
