import { Component, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgDropdownPanelComponent } from '@ng-select/ng-select/lib/ng-dropdown-panel.component';
import * as _ from 'lodash';
import timeout from 'app/utils/timeout';
import { SelectItem } from 'app/types/select-item';

@Component({
    selector: 'app-multiselect',
    templateUrl: './multiselect.component.html',
})
export class MultiselectComponent {

    @Input() public title: string;
    @Input() public options: SelectItem[];
    @Input() public selectedItems: SelectItem[];

    @Output() public selectedItemsChange: EventEmitter<
        SelectItem[]
    > = new EventEmitter();
    @Output() public changeItems: EventEmitter<never> = new EventEmitter<never>();

    @ViewChild(NgSelectComponent, { static: false }) public select: NgSelectComponent;

    public hasSearchResult = true;

    constructor(private ref: ChangeDetectorRef) { }

    public handleChangeSelection(items: SelectItem[]): void {
        this.selectedItemsChange.emit(items.sort((a: SelectItem, b: SelectItem) => (a.id > b.id ? 1 : -1)));
        this.changeItems.emit();
    }

    public handleSearch(searchResult: { term: string; items: SelectItem[] }): void {
        this.hasSearchResult = searchResult.items.length > 0;
    }

    public async handleOpen(): Promise<void> {
        this.hasSearchResult = true;

        this.ref.detectChanges();
        const panel: NgDropdownPanelComponent = this.select.dropdownPanel;
        const {
            width,
            position,
        } = this._getDropdownStyles();

        const dropdown: HTMLElement = document.querySelector('ng-dropdown-panel') as HTMLElement;

        if (panel.appendTo != null) {
            await timeout();
        }

        const { left: parentLeft, width: partentWidth } = this.select.element.getBoundingClientRect();

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

        if (panel.virtualScroll && (width + 3) > partentWidth) {
            dropdown.style.width = `${width + 3}px`;
        }
    }

    /**
     * ドロップダウンのスタイルを取得する
     */
    private _getDropdownStyles(): { width: number; position: string } {
        return {
            width: this._getDropdownWidth(),
            position: this._getDropdownPosition(),
        };
    }

    /**
     * ドロップダウンの幅を取得する
     */
    private _getDropdownWidth(): number {
        const maxItem: SelectItem = _.maxBy(this.options, (item: SelectItem) => item.name.length);
        const mesureItem: HTMLDivElement = document.createElement('div');
        mesureItem.style.padding = '8px 10px';
        mesureItem.style.visibility = 'hidden';
        mesureItem.style.position = 'fixed';
        mesureItem.innerHTML = maxItem.name;
        document.body.appendChild(mesureItem);
        const width = mesureItem.clientWidth;
        document.body.removeChild(mesureItem);

        return Math.max(width, this.select.element.clientWidth);
    }

    /**
     * ドロップダウンの位置を取得する
     */
    private _getDropdownPosition(): string {
        let position = 'left';
        const screenWidth: number = document.body.clientWidth;
        const { left: parentLeft, right: parentRight } = this.select.element.getBoundingClientRect();

        if (screenWidth - (parentLeft + this._getDropdownWidth()) < 0) {
            position = 'right';

            if ((parentRight - this._getDropdownWidth()) < 0) {
                position = 'center';
            }
        }

        return position;
    }
}
