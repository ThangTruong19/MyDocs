import { Pipe, PipeTransform } from '@angular/core';
import { Many, orderBy } from 'lodash';

@Pipe({
    name: 'orderBy',
    pure: false,
})
export class OrderByPipe implements PipeTransform {
    transform(value: any[], params?: any, sort?: Many<boolean | "asc" | "desc">): any[] {
        return orderBy(value, params, sort);
    }
}
