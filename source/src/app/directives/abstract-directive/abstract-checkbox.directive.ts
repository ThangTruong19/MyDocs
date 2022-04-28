import {
    Directive,
    Input,
    Output,
    HostListener,
    EventEmitter,
} from '@angular/core';

@Directive({})
export class AbstractCheckboxDirective {
    @Input() checkAll: boolean;
    @Input() selectedList: any[];
    @Output() toggleClick: EventEmitter<any> = new EventEmitter();

    @HostListener('change', ['$event'])
    public onChange($event: Event): void {
        const targetElement: HTMLInputElement = <HTMLInputElement>$event.target;
        const value: string = targetElement.value;
        if (targetElement.checked) {
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
