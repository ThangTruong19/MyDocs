import {
    Directive,
    Input,
    HostListener,
    ElementRef,
    AfterViewInit,
} from '@angular/core';
import * as $ from 'jquery';
import { isNull } from 'lodash';

@Directive({
    selector: '[appScrollTo]',
})
export class ScrollToDirective implements AfterViewInit {
    @Input() offset = 0;
    @Input() scrollTarget: string = null; // クリック時にスクロールする場合にセレクタを指定
    @Input() scrollArea: string = null; // スクロールするエリアのセレクタを指定

    private el: any;

    constructor(el: ElementRef) {
        this.el = el;
    }

    ngAfterViewInit(): void {
        // scrollTargetが指定されていない場合は要素表示時にスクロール
        if (isNull(this.scrollTarget)) {
            this.scrollTo();
        }
    }

    private scrollTo(): void {
        if (isNull(this.el)) {
            return;
        }

        const offsetTop: number = isNull(this.scrollTarget)
            ? this.el.nativeElement.offsetTop
            : this.el.offsetTop;
        if (isNull(this.scrollArea)) {
            $('html, body').animate({ scrollTop: offsetTop + this.offset }, 'slow');
        } else {
            const scrollAreaEl: HTMLInputElement = <HTMLInputElement>(
                document.body.querySelector(`${this.scrollArea}`)
            );
            if (isNull(scrollAreaEl)) {
                return;
            }

            const scrollTop: number = offsetTop - scrollAreaEl.offsetTop + this.offset;
            if (scrollAreaEl.scrollTop !== scrollTop) {
                $(`${this.scrollArea}`).animate({ scrollTop: scrollTop }, 'slow');
            }
        }
    }

    @HostListener('click')
    public onClickScrollTo(): void {
        if (!isNull(this.scrollTarget)) {
            this.el = document.body.querySelector(`${this.scrollTarget}`);
            this.scrollTo();
        }
    }
}
