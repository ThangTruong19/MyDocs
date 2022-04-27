import { Injectable, Component } from '@angular/core';
import { Resources } from 'app/types/common';

@Injectable()
export class ComponentRefService {
    componentRef: Component & {
        resource: Resources;
        isFetching?: boolean;
    };
}
