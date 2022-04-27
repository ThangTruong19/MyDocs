import { Injectable, Component } from '@angular/core';
import { Resources } from '../../types/common';

@Injectable()
export class ComponentRefService {
  componentRef: Component & {
    resource: Resources;
    isFetching?: boolean;
  };
}
