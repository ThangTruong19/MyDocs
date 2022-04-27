import {
    Component,
    Input,
    Output,
    EventEmitter,
    Renderer2,
    ElementRef,
    OnInit,
    OnDestroy,
} from '@angular/core';
import * as _ from 'lodash';

@Component({
    selector: 'app-autocomplete',
    templateUrl: './autocomplete.component.html',
    styleUrls: ['./autocomplete.component.scss'],
})
export class AutocompleteComponent implements OnInit, OnDestroy {

    @Input() disabled: boolean;
    @Input() searchStr: string;
    @Input() name: string;
    @Input() minLength: number;
    @Input() maxLength: number;
    @Input() initialValue: string;
    @Input() searchData: string[];
    @Input() required: boolean;
    @Input() textSearching: string;
    @Input() textNoResult: string;
    @Input() rowNum: number;
    @Input() identifier?: string;
    @Output() onblurInput: EventEmitter<string> = new EventEmitter<string>();
    @Output() onChangeText: EventEmitter<string> = new EventEmitter<string>();
    @Output() onChangeSelectItem: EventEmitter<string> = new EventEmitter<
        string
    >();
    @Output() onFocus: EventEmitter<string> = new EventEmitter<string>();
    @Input() set scrollTop(_value: number) {
        if (this.tempValue != null) {
            setTimeout(() => {
                this.hideDropdown();
                this.inputElement.blur();
            });
        }
    }

    public dropdownStyle: {
        width: string;
        left: string;
        top: string;
    };
    public selectedIndex: number;
    private filterText: string;
    private tempValue: string;
    private selectedOption: string;
    private containerElement: HTMLElement;
    private dropdownElement: HTMLElement;
    private inputElement: HTMLElement;

    public get isValid(): boolean {
        return (
            _.includes(this.searchData, this.searchStr) ||
            this.searchStr === '' ||
            this.searchStr == null
        );
    }

    public get filteredData(): string[] {
        if (this.filterText == null || this.filterText.length === 0) {
            return [];
        }

        return this.searchData.filter(data => data.includes(this.filterText));
    }

    public get dropdownVisible(): boolean {
        return this.tempValue !== undefined && this.tempValue !== this.filterText;
    }

    constructor(private renderer: Renderer2, private elRef: ElementRef) { }

    ngOnInit(): void {
        this.containerElement = this.elRef.nativeElement;
        this.dropdownElement = this.containerElement.querySelector(
            '.autocomplete-dropdown'
        );
        this.inputElement = this.containerElement.querySelector('input');

        this.renderer.removeChild(this.containerElement, this.dropdownElement);
        this.renderer.appendChild(document.body, this.dropdownElement);
    }

    ngOnDestroy(): void {
        this.renderer.removeChild(document.body, this.dropdownElement);
    }

    public handleFocus(): void {
        this.refreshDropdownPosition();
        this.filterText = this.tempValue = this.searchStr;
        this.selectedIndex = -1;
        this.onFocus.emit(this.searchStr);
    }

    public handleTyped(value: string): void {
        this.searchStr = value;
        this.filterText = value;
    }

    public handleBlur(): void {
        if (this.selectedOption != null) {
            this.searchStr = this.selectedOption;
        }

        const allowEmpty: boolean =
            !this.required && (this.searchStr == null || this.searchStr.length === 0);

        if (!allowEmpty && !this.searchData.includes(this.searchStr)) {
            this.searchStr = this.tempValue;
        }

        this.onblurInput.emit(this.searchStr);
        this.tempValue = undefined;
        this.selectedOption = null;
    }

    public handleHoverOption(option: string, index: number): void {
        this.selectedOption = option;
        this.searchStr = option;
        this.selectedIndex = index;
    }

    public handleSelectOption(option: string, index: number): void {
        this.handleHoverOption(option, index);
        this.onChangeSelectItem.emit(option);
    }

    public handleKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case 'ArrowDown':
                this.selectedIndex = Math.min(
                    this.selectedIndex + 1,
                    this.filteredData.length
                );
                this.selectedOption = this.filteredData[this.selectedIndex];
                break;
            case 'ArrowUp':
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                this.selectedOption = this.filteredData[this.selectedIndex];
                break;
            case 'Enter':
                this.handleSelectOption(this.selectedOption, this.selectedIndex);
                this.inputElement.blur();
                break;
            default:
                break;
        }
    }

    public isEdited(): boolean {
        return _.toString(this.initialValue) !== _.toString(this.searchStr);
    }

    public refreshDropdownPosition(): void {
        const containerRect: DOMRect = this.containerElement.getBoundingClientRect();

        this.dropdownStyle = {
            width: `${containerRect.width}px`,
            left: `${containerRect.left}px`,
            top: `${containerRect.top + containerRect.height}px`,
        };
    }

    public hideDropdown(): void {
        this.searchStr = this.filterText = this.tempValue;
    }

}
