import {
    Directive,
    Input,
    ElementRef,
    Renderer2,
    OnChanges,
} from '@angular/core';

@Directive({
    selector: '[appChangeTableHeight]',
})
export class ChangeTableHeightDirective implements OnChanges {
    @Input() collapsed: boolean;

    constructor(private renderer: Renderer2, private el: ElementRef) { }

    ngOnChanges(changes: { [propName: string]: any }): void {
        if (changes['collapsed'].currentValue) {
            this.renderer.addClass(this.el.nativeElement, 'app-lg-height');
        } else {
            this.renderer.removeClass(this.el.nativeElement, 'app-lg-height');
        }
    }

}
