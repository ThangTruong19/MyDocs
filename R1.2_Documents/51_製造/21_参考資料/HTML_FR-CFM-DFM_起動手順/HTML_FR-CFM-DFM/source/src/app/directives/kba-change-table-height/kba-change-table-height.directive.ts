import {
  Directive,
  Input,
  ElementRef,
  Renderer2,
  OnInit,
  OnChanges,
} from '@angular/core';

@Directive({
  selector: '[appKbaChangeTableHeight]',
})
export class KbaChangeTableHeightDirective implements OnChanges {
  @Input() collapsed: boolean;

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  ngOnChanges(changes: { [propName: string]: any }) {
    if (changes['collapsed'].currentValue) {
      this.renderer.addClass(this.el.nativeElement, 'kba-lg-height');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'kba-lg-height');
    }
  }
}
