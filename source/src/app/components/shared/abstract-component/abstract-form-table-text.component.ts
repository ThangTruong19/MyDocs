import { Input, Output, OnInit, EventEmitter, Component } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import * as _ from 'lodash';

@Component({ template: '' })
export abstract class AbstractFormTableTextComponent implements OnInit {

    @Input() public formGroup: FormGroup;
    @Input() public itemName: string;
    @Input() public itemParams: any;
    @Input() public itemResource: any;
    @Input() public itemLabel: any;
    @Input() public display: string;
    @Input() public notEditable: boolean;
    @Input() public colspan: number;
    @Input() public required: boolean;
    @Input() public maxLength: number;
    @Input() public number: number;
    @Input() public size: 'small' | 'middle' | 'large';
    @Input() public path: string;
    @Input() public errorData: any;

    @Output() public change: EventEmitter<any> = new EventEmitter();

    public isVisible: boolean;
    public patternRegexp: string;
    public name: string;
    public viewData: string;

    protected abstract defaultSize: string;

    public get sizeClass(): string {
        return `app-input__${this.size || this.defaultSize}`;
    }

    ngOnInit(): void {
        if (this._checkVisible()) {
            this._setInitItems();
            this._setInitExtra();

            if (!this.notEditable) {
                const control = this.formGroup.get(this.name);

                if (control != null) {
                    control.setValue(this.itemParams[this.itemName]);
                }
            }
        } else {
            _.unset(this.itemParams, this.itemName);
        }
    }

    public handleChange(value: string): void {
        this.itemParams[this.itemName] = value;
        this.change.emit();
    }

    /**
     * 入力時コールバック
     */
    public changeValue(): void {
        this.change.emit();
    }

    public applyValue(): void {
        const control: AbstractControl = this.formGroup.get(this.name);

        if (control != null) {
            control.setValue(this.itemParams[this.itemName]);
        }
    }

    protected abstract _setInitExtra(): void;

    /**
     * 表示可能かの判定
     */
    private _checkVisible(): boolean {
        this.isVisible = _.has(this.itemResource, this.itemName);
        return this.isVisible;
    }

    /**
     * 表示用のデータを返す
     */
    private _setViewData(): void {
        this.viewData = _.isEmpty(this.display)
            ? this.itemParams[this.itemName]
            : this.itemParams[this.display];
    }

    /**
     * 初期状態のセット
     */
    private _setInitItems(): void {
        let value;
        if (_.isEmpty(this.itemParams[this.itemName])) {
            value = '';
        } else {
            value = this.itemParams[this.itemName];
        }
        this.name = _.isUndefined(this.number)
            ? this.itemName
            : this.itemName + this.number;
        if (!this.notEditable) {
            const fc = this.required
                ? new FormControl(value, Validators.required)
                : new FormControl();
            this.formGroup.addControl(this.name, fc);
        }
        this._setViewData();
    }

}
