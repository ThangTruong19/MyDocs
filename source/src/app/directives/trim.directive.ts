import { Directive, ElementRef, OnInit } from '@angular/core';
import * as $ from 'jquery';

/**
 * 前後スペースを入力不可にするディレクティブ
 */
@Directive({
    selector: '[appTrim]'
})
export class AppTrimDirective implements OnInit {

    /**
     * コンストラクタ
     **/
    constructor(private el: ElementRef) { }

    /**
     * ディレクティブの初期化
     **/
    public ngOnInit() {
        const me = this;
        $(this.el.nativeElement).on('propertychange change keyup paste input', function () {
            me.trimText(this.value);
        });
    }

    /**
     * エレメントの値「value」から前後スペースを除外します。
     */
    private trimText(txt: string): void {
        // const txt: string = <string>$(this.el.nativeElement).val();
        if(txt) {
            const trimed = txt.trim();
            if (txt !== trimed) {
                $(this.el.nativeElement).val(trimed);
            }
        }
    }
}
