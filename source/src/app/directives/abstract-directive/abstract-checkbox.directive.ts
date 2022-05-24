import {
    Directive,
    Input,
    Output,
    HostListener,
    EventEmitter,
} from '@angular/core';
import { CheckboxValue } from 'app/types/common';

@Directive({})
export class AbstractCheckboxDirective {

    @Input() public checkAll: boolean;
    @Input() public selectedList: string[];
    @Input() public rowIndex: number;
    @Output() public toggleClick: EventEmitter<CheckboxValue> = new EventEmitter<CheckboxValue>();

    @HostListener('change', ['$event'])
    public onChange($event: Event): void {
        const targetElement: HTMLInputElement = <HTMLInputElement>$event.target;
        const value: string = targetElement.value;
        if (targetElement.checked) {
            if (this.selectedList != null) {
                this.selectedList.push(value);
            }
        } else {
            if (this.selectedList != null) {
                this.selectedList.splice(this.selectedList.indexOf(value), 1);
            }
        }

        const checkboxValue: CheckboxValue = {
            checkboxElement: targetElement,
            checked: targetElement.checked,
            value: value,
            rowIndex: this.rowIndex
        };

        this.toggleClick.emit(checkboxValue);
    }

}
