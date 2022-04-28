import {
    Directive,
    Input,
    Output,
    HostListener,
    EventEmitter,
    HostBinding,
} from '@angular/core';

@Directive({
    selector: '[appScrollLoad]',
})
export class ScrollLoadDirective {
    private lastRemaining = 9999;
    private lengthThreshold = 380;

    @Input() lists: any;
    @Input() params: any;

    @Output() autoLoad: EventEmitter<number> = new EventEmitter<number>();
    @Output() scrolled: EventEmitter<any> = new EventEmitter<any>();

    @HostBinding('class.app-scroll-load')

    // 最下部スクロール感知用イベント設置
    @HostListener('scroll', ['$event'])
    public onScroll($event: Event): void {
        const tbodyEl: HTMLTableElement = <HTMLTableElement>$event.target;
        // const tbodyEl = $event.srcElement;
        const remaining: number =
            tbodyEl.scrollHeight - (tbodyEl.clientHeight + tbodyEl.scrollTop);

        // スクロール位置が規定以下 or 最後のスクロール位置未満 or 最後のスクロールも合わせて最下部にある場合
        if (
            (remaining < this.lengthThreshold &&
                remaining - this.lastRemaining < 0) ||
            (remaining === 0 && this.lastRemaining === 0)
        ) {
            this._autoLoad();
        }
        this.lastRemaining = remaining;

        const scrollAmount: {
            top: number;
            left: number;
            width: number;
            height: number;
        } = {
            top: tbodyEl.scrollTop,
            left: tbodyEl.scrollLeft,
            width: tbodyEl.scrollWidth,
            height: tbodyEl.scrollHeight,
        };
        this.scrolled.emit(scrollAmount);
    }

    private _autoLoad() {
        if (!this.params) {
            return;
        }

        const pageCount: number = parseInt(this.params.pageCount, 10);
        // 取得したデータが表示件数未満の場合は自動ロードしない
        if (
            this.lists.visibleList.length < pageCount &&
            pageCount * (this.params.pageNo - 1) + this.params.lastIndexList <
            pageCount * (this.params.pageNo - 1) + this.lists.originList.length
        ) {
            this._concatList();
        }
    }

    private _concatList() {
        const _p: any = this.params;
        let endIndex: number;
        // 取得データの総件数が自動ロード開始位置+自動ロード数未満の場合、取得終了位置を総件数とする
        if (
            parseInt(this.params.pageCount, 10) <
            _p.lastIndexList + _p.autoLoadCount
        ) {
            endIndex = parseInt(this.params.pageCount, 10);
        } else {
            endIndex = _p.lastIndexList + _p.autoLoadCount;
        }
        this.lists.visibleList = this.lists.visibleList.concat(
            this.lists.originList.slice(_p.lastIndexList, endIndex)
        );
        // 次に取得するインデックスの設定
        this.params.lastIndexList = _p.lastIndexList + _p.autoLoadCount;
    }
}
