import { Component, Input, ElementRef } from '@angular/core';

import { Maker } from '../../../../../types/opa/management-car-setting/maker-setting';

import { CommonState } from '../../../../../constants/common-state';

@Component({
  selector: 'app-check-list',
  templateUrl: './check-list.component.html',
  styleUrls: ['./check-list.component.scss'],
})
export class CheckListComponent {
  CommonState = CommonState;
  hostElement: HTMLElement;

  @Input() data: any[];
  @Input() labels;

  constructor(private elRef: ElementRef) {
    this.hostElement = elRef.nativeElement;
  }

  get checkAll() {
    return (
      this.data != null &&
      this.data.every(item => item.active_kind === CommonState.on)
    );
  }

  set checkAll(checkAll: boolean) {
    this.data.forEach(item => (item.active_kind = `${+checkAll}`));
  }

  handleChangeActiveKind(item: any) {
    item.active_kind = `${+!+item.active_kind}`;
  }

  resetScrollPosition() {
    const container = this.hostElement.querySelector('.scrollable-container');
    if (container) {
      container.scrollTop = 0;
    }
  }
}
