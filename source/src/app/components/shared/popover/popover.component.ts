import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    ElementRef,
} from '@angular/core';
import { some, filter } from 'lodash';
import { DisplayCode } from 'app/constants/display-code';
import { Labels } from 'app/types/common';

@Component({
    selector: 'app-popover',
    templateUrl: './popover.component.html',
})
export class PopoverComponent implements OnInit {

    @Input() public labels: Labels;
    @Input() public title: string;
    @Input() public download: boolean;
    @Input() public set downloadType(downloadType) {
        this._downloadTypes = downloadType;
        this.selectedDownloadType = downloadType && downloadType.values[0].value;
    }

    public get downloadType(): any {
        return this._downloadTypes;
    }

    @Input()
    public get isVisible(): boolean {
        return this.visible;
    }

    public set isVisible(val) {
        if (val) {
            this.visible = true;
            this.isVisibleChange.emit(val);
            setTimeout(() => (this.afterVisualize = true), 50);
        } else {
            this.afterVisualize = false;
            setTimeout(() => {
                this.visible = false;
                this.isVisibleChange.emit(val);
            }, 200);
        }
    }

    public get resource(): any {
        return this._resource;
    }

    @Output() public isVisibleChange: EventEmitter<any> = new EventEmitter();

    @Input() public set resource(val) {
        if (val == null) {
            return;
        }

        const filteredVal: any = val.map((resource: any) => ({
            ...resource,
            name: resource.name.replace(/##/g, ''),
        }));

        this._resource = filteredVal;
        this.selectableFields = filteredVal.filter(
            (field: any) => parseInt(field.display_code, 10) > parseInt(DisplayCode.none, 10)
        );
    }

    @Input() public set fields(val: any) {
        if (val == null) {
            return;
        }
        val.forEach((f: any) => {
            if (parseInt(f.display_code, 10) > parseInt(DisplayCode.none, 10)) {
                this.checkedItems[f.path] = true;
            }
        });
        this.onCheck();
    }

    @Output() public ok: EventEmitter<any> = new EventEmitter<any>();

    @Input() public set promise(_promise: Promise<void | void[]>) {
        if (_promise) {
            this.isLoading = true;
            _promise.then(() => this.isLoading = false);
        }
    }

    public isLoading = false;
    public checkAll: boolean;
    public selectableFields: any = [];
    public checkedItems: any = {};
    public visible: boolean;
    public afterVisualize: any;
    public selectedDownloadType: any;
    public displayCodes = DisplayCode;
    private el: HTMLElement;
    private _downloadTypes: any;
    private _resource: any;

    public get okButtonEnabled(): boolean {
        return some(this.checkedItems, v => v);
    }

    constructor(elRef: ElementRef) {
        this.el = elRef.nativeElement;
    }

    ngOnInit(): void {
        document.body.addEventListener('click', (e: MouseEvent) => {
            if (!this.el.parentElement.contains(<Node>e.target)) {
                this.isVisible = false;
            }
        });

        if (this.promise) {
            this.isLoading = true;
            this.promise.then(() => this.isLoading = false);
        }
    }

    /**
     * 全選択切り替え時の処理
     * @param check 全選択チェックボックスの値
     */
    public onCheckAll(check: boolean): void {
        if (check) {
            this.selectableFields.forEach(
                (val: any) => (this.checkedItems[val.path] = true)
            );
        } else {
            this.selectableFields.forEach((val: any) => {
                if (+val.display_code !== +DisplayCode.inactiveDisplay) {
                    this.checkedItems[val.path] = false;
                }
            });
        }
    }

    /**
     * チェックボックス切り替え時の処理
     */
    public onCheck(): void {
        this.checkAll = this.selectableFields.every((f: any) => this.checkedItems[f.path]);
    }

    /**
     * OK ボタン押下時の処理
     */
    public onClickOk(): void {
        const fields: {
            path: string;
            display_sequence_no: string;
        }[] = filter(
            this.resource,
            r => r.display_code !== DisplayCode.display || this.checkedItems[r.path]
        ).map(r => ({ path: r.path, display_sequence_no: r.display_sequence_no }));
        const result: { fields: { path: string; display_sequence_no: string; }[]; fileType?: any  } = { fields };

        if (this.download) {
            result.fileType = this.selectedDownloadType;
        }
        this.isVisible = false;
        this.ok.emit(result);
    }

}
