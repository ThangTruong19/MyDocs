import {
    Directive,
    Input,
    Output,
    HostBinding,
    EventEmitter,
    HostListener,
    ElementRef,
    OnInit,
} from '@angular/core';
import { SortingType } from 'app/directives/sorting-label/sorting-type';

@Directive({
    selector: '[appSortingLabel]',
})
export class SortingLabelDirective implements OnInit {

    @Input() sortingParams: { [key: string]: any };
    @Input() labelName: string;
    @Input() sortableThList: string[];

    @Output() sort: EventEmitter<any> = new EventEmitter<any>();

    private hostElement: HTMLElement;
    private sortingType: SortingType;

    constructor(ref: ElementRef) {
        this.hostElement = ref.nativeElement;
    }

    ngOnInit(): void {
        this.sortingType = Array.isArray(this.sortingParams['sort']) ?
            SortingType.MULTIPLE : SortingType.SINGLE;
    }

    @HostBinding('class.app-sortable-label-asc')
    public get labelAsc(): boolean {
        if (!this._isValid()) {
            return false;
        }

        switch (this.sortingType) {
            case SortingType.SINGLE:
                return this.sortingParams['sortLabel'] === this.labelName;
            case SortingType.MULTIPLE:
                return this.sortingParams['sortLabel'].indexOf(this.labelName) >= 0;
            default:
                return false;
        }
    }

    @HostBinding('class.app-sortable-label-desc')
    public get labelDesc(): boolean {
        if (!this._isValid()) {
            return false;
        }

        switch (this.sortingType) {
            case SortingType.SINGLE:
                return this.sortingParams['sortLabel'] === `-${this.labelName}`;
            case SortingType.MULTIPLE:
                return (
                    this.sortingParams['sortLabel'].indexOf(`-${this.labelName}`) >= 0
                );
            default:
                return false;
        }
    }

    @HostListener('click')
    private _onClick(): void {
        if (!this._isSortable()) {
            return;
        }

        switch (this.sortingType) {
            case SortingType.SINGLE:
                this._sortBySingleKey();
                break;
            case SortingType.MULTIPLE:
                this._sortByMultipleKeys();
                break;
            default:
                return;
        }

        this.sort.emit(this.sortingParams['sort']);
    }
    /**
     * パラメータの形式が有効であるかを判定します。
     */
    private _isValid(): boolean {
        return this.sortingParams && this.sortingParams['sortLabel'];
    }

    /**
     * ソート可能な項目かどうがを判定します。
     */
    private _isSortable(): boolean {
        return this.sortableThList.indexOf(this.labelName) !== -1;
    }

    /**
     * 単一のキーによるソートを行うためのパラメータを作成します。
     */
    private _sortBySingleKey(): void {
        const prefix =
            this.sortingParams['sortLabel'] === this.labelName ? '-' : '';
        this.sortingParams['sortLabel'] = `${prefix}${this.labelName}`;
        this.sortingParams['sort'] = `${prefix}${this.labelName}`;
    }

    /**
     * 複数のキーによるソートを行うためのパラメータを作成します。
     */
    private _sortByMultipleKeys(): void {
        this.sortingParams['sortLabel'] = this.sortingParams['sortLabel'].map((p: any) => {
            switch (p.indexOf(this.labelName)) {
                case 0:
                    return `-${this.labelName}`;
                case 1:
                    return this.labelName;
                default:
                    return p;
            }
        });

        if (
            this.sortingParams['sortLabel'].indexOf(this.labelName) < 0 &&
            this.sortingParams['sortLabel'].indexOf(`-${this.labelName}`) < 0
        ) {
            this.sortingParams['sortLabel'].push(this.labelName);
            this.sortingParams['sort'].push(this.labelName);
        }
    }
}
