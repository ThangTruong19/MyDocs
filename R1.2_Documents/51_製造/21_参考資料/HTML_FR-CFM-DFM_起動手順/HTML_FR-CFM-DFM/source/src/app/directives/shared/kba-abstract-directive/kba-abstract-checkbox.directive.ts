import {
  Directive,
  Input,
  Output,
  HostListener,
  EventEmitter,
} from '@angular/core';

export class KbaAbstractCheckboxDirective {
  @Input() checkAll: boolean;
  @Input() selectedList: any[];
  @Output() toggleClick: EventEmitter<any> = new EventEmitter();

  @HostListener('change', ['$event'])
  onChange($event) {
    const value = $event.target.value;
    if ($event.target.checked) {
      if (this.selectedList != null) {
        this.selectedList.push(value);
      }
      this.toggleClick.emit(value);
    } else {
      if (this.selectedList != null) {
        this.selectedList.splice(this.selectedList.indexOf(value), 1);
      }
      this.toggleClick.emit(value);
    }
  }
}
