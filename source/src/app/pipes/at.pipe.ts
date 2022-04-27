import { Pipe, PipeTransform } from '@angular/core';
import { at, head } from 'lodash';

@Pipe({
    name: 'at',
    pure: false,
})
export class AtPipe implements PipeTransform {
    transform(obj: Object, key: Array<any>) {
        if (key instanceof Array) {
            return at(obj, key);
        } else {
            return head(at(obj, key));
        }
    }
}
