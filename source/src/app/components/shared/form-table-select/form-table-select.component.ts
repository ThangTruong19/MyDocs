import {
    Component,
    EventEmitter,
    Input,
    Output,
    OnInit,
    ViewChild,
    ChangeDetectorRef,
} from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import * as _ from 'lodash';
import timeout from 'app/utils/timeout';
import { ResourceKind } from 'app/constants/resource-type';
import { SelectItem } from 'app/types/select-item';
import { Resource, Resources, ResourceValue } from 'app/types/common';
import { NgDropdownPanelComponent } from '@ng-select/ng-select/lib/ng-dropdown-panel.component';

@Component({
    selector: '[app-form-table-select]',
    styleUrls: ['./form-table-select.component.scss'],
    templateUrl: './form-table-select.component.html',
})
export class FormTableSelectComponent implements OnInit {

    @ViewChild(NgSelectComponent, { static: false }) public select: NgSelectComponent;
    @Input() public itemName: string;
    @Input() public display: string;
    @Input() public itemParams: any = {};
    @Input() public notEditable: boolean;
    @Input() public required: boolean;
    @Input() public colspan: number;
    @Output() public onChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() public open: EventEmitter<void> = new EventEmitter<void>();
    @Input() public emitInitialRefresh = true;
    @Input() public itemResource: Resources;

    public get isVisible(): boolean {
        return this.items.length > 0;
    }

    public items: SelectItem[];
    public hasSearchResult = true;
    public dropdownWidth: number | null = null;
    private initialItem: SelectItem;
    private dropdownActualWidth: number | null = null;
    private viewVal: SelectItem[] = [];

    constructor(private ref: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.refresh(false);

        this.initialItem = this._getInitialItem();

        if (this.initialItem == null) {
            return;
        }

        this.viewVal = [this.initialItem];
        this.itemParams[this.itemName] = this.initialItem.id;

        if (this.emitInitialRefresh) {
            this.onChange.emit(this.itemParams[this.itemName]);
        }
    }

    /**
     * 表示用のデータを返す
     *
     * @return 表示用データ
     */
    public viewData(): string {
        return this.display == null
            ? this.itemParams[this.itemName]
            : this.itemParams[this.display];
    }

    /**
     * 選択項目変更コールバック
     *
     * @param value 選択項目
     */
    public onSelectItem(value: SelectItem): void {
        this.viewVal = [value];
        this.onChange.emit(value.id);
    }

    public handleSearch(searchResult: { term: string; items: SelectItem[] }): void {
        this.hasSearchResult = searchResult.items.length > 0;
    }

    public async handleOpen(): Promise<void> {
        const scrollBarWidth = 17;
        this.hasSearchResult = true;

        this.ref.detectChanges();
        const panel: NgDropdownPanelComponent = this.select.dropdownPanel;
        const {
            width,
            actualWidth,
            position,
        } = this._getDropdownStyles();

        const dropdown: HTMLElement = document.querySelector('ng-dropdown-panel') as HTMLElement;

        if (panel.appendTo != null) {
            await timeout();
        }

        const { left: parentLeft, width: parentWidth } = this.select.element.getBoundingClientRect();

        switch (position) {
            case 'right':
                dropdown.style.left = 'auto';
                dropdown.style.right = '0';
                break;

            case 'center':
                if (this.select.appendTo === 'body') {
                    // テーブル内のドロップダウン要素の場合
                    dropdown.style.left = '50%';
                    dropdown.style.transform = 'translateX(-50%)';
                } else {
                    // その他の場合
                    const margin = Math.max(0, document.body.clientWidth - width) / 2;

                    dropdown.style.left = `-${parentLeft - margin}px`;
                }

                break;

            default:
                break;
        }

        if (panel.virtualScroll && (actualWidth + scrollBarWidth) > parentWidth) {
            dropdown.style.width = `${actualWidth + scrollBarWidth}px`;
        }
    }

    /**
     * セレクトボックスのリセット
     */
    public reset(): void {
        if (!this.isVisible) {
            return;
        }

        const item: SelectItem =
            this.initialItem != null && this.items.includes(this.initialItem)
                ? this.initialItem
                : this.items[0];

        if (item != null) {
            this.viewVal = [item];
            this.itemParams[this.itemName] = item.id;
            return;
        }

        this.itemParams[this.itemName] = this.initialItem.id;
    }

    /**
     * セレクトボックスをリセットし、変更イベントを発火
     */
    public resetAndEmit(): void {
        this.reset();
        this.onChange.emit(this.itemParams[this.itemName]);
    }

    /**
     * 項目をリフレッシュする
     */
    public async refresh(emitChangeEvent = true): Promise<void> {
        this.items = this._getItems();
        this.dropdownWidth = null;

        if (this.itemParams == null) {
            await timeout();
        }

        if (
            !this.items.map(item => item.id).includes(this.itemParams[this.itemName])
        ) {
            this.itemParams[this.itemName] = this.items[0] ? this.items[0].id : (this.itemParams[this.itemName] || null);
        }
        this.viewVal = [this.items.find(item => item.id === this.itemParams[this.itemName])];

        if (emitChangeEvent) {
            this.onChange.emit(this.itemParams[this.itemName]);
        }
    }

    /**
     * 初期選択項目取得
     *
     * セレクトボックスの初期選択オプションを取得
     *
     * @return 初期選択項目
     */
    private _getInitialItem(): SelectItem {
        return (
            this.items.find(item => item.id === this.itemParams[this.itemName]) ||
            this.items.find(item => item.isHighlightItem) ||
            this.items[0]
        );
    }

    private _getItems(): SelectItem[] {
        const target: Resources & Resource = this.itemResource ? this.itemResource[this.itemName] : null;

        if (target == null) {
            return [];
        }

        return target.values.map((val: ResourceValue) => ({
            id: val.value || val.name,
            name: val.name,
            isHighlightItem: val.kind === ResourceKind.highlight,
        }));
    }

    /**
     * ドロップダウンのスタイルを取得する
     */
    private _getDropdownStyles(): {
        width: number;
        actualWidth: number;
        position: string;
    } {
        const [width, actualWidth] = this._getDropdownWidth();

        return {
            width,
            actualWidth,
            position: this._getDropdownPosition(),
        };
    }

    /**
     * ドロップダウンの幅を取得する
     */
    private _getDropdownWidth(): number[] {
        if (this.dropdownWidth != null) {
            return [this.dropdownWidth, this.dropdownActualWidth];
        }

        const nameList: string = this.items.map(({ name }) => name).join('\n');
        const mesureItem: HTMLDivElement = document.createElement('div');
        mesureItem.style.padding = '8px 10px 8px 16px';
        mesureItem.style.visibility = 'hidden';
        mesureItem.style.position = 'fixed';
        mesureItem.style.whiteSpace = 'pre-line';
        mesureItem.innerHTML = nameList;
        document.body.appendChild(mesureItem);
        const width: number = mesureItem.clientWidth;
        document.body.removeChild(mesureItem);

        this.dropdownActualWidth = width;
        this.dropdownWidth = Math.max(width, this.select.element.clientWidth);

        return [this.dropdownWidth, this.dropdownActualWidth];
    }

    /**
     * ドロップダウンの位置を取得する
     */
    private _getDropdownPosition(): string {
        let position = 'left';
        const screenWidth: number = document.body.clientWidth;
        const { left: parentLeft, right: parentRight } = this.select.element.getBoundingClientRect();

        if (screenWidth - (parentLeft + this._getDropdownWidth()[0]) < 0) {
            position = 'right';

            if ((parentRight - this._getDropdownWidth()[0]) < 0) {
                position = 'center';
            }
        }

        return position;
    }

}
