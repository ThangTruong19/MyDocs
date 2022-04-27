import {
    Component,
    Input,
    Output,
    EventEmitter,
    TemplateRef,
    OnInit,
    ElementRef,
    ChangeDetectorRef,
} from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { MimeType } from 'app/constants/mime-types';
import { Api, Labels } from 'app/types/common';
import { FileUploadService } from 'app/services/shared/file-upload.service';

@Component({
    selector: 'app-file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.scss'],
    providers: [FileUploadService],
})
export class FileUploadComponent implements OnInit {

    @Input() public apiId: string;
    @Input() public labels: Labels;
    @Input() public collapsed: boolean;
    @Input() public isLoading: boolean;
    @Input() public json: string | { [x: string]: any };
    @Input() public layout: 'batch' | 'index';
    @Input() public uploadOnChange = false;
    @Input() public conditionsContent: TemplateRef<null>;
    @Input() public screenCode: string;

    @Output() public uploadStart: EventEmitter<File> = new EventEmitter();
    @Output() public uploadEnd: EventEmitter<Api> = new EventEmitter();
    @Output() public uploadFail: EventEmitter<any> = new EventEmitter();

    public uploader: FileUploader;
    public hasDropZoneOver = false;
    public currentItem: File | null;
    public hasError = false;
    private hostElement: HTMLElement;
    private uploadElement: HTMLInputElement;

    constructor(
        private fileUploadService: FileUploadService,
        private ref: ChangeDetectorRef,
        private elementRef: ElementRef
    ) {
        const ua: string = navigator.userAgent.toLowerCase();
        const isIE: boolean = ua.indexOf('trident') > 0 || ua.indexOf('edge') > 0;
        const uploadOptions = isIE
            ? {
                allowedFileType: ['xls'],
            }
            : {
                allowedMimeType: [MimeType.excel],
            };

        this.hostElement = elementRef.nativeElement;
        this.uploader = new FileUploader(uploadOptions);
    }

    ngOnInit(): void {
        this.ref.detectChanges();
        this.uploadElement = this.hostElement.querySelector(
            '.app-input-file'
        ) as HTMLInputElement;
        this.uploadElement.addEventListener('change', this.onChange);
    }

    /**
    * ファイルドラッグコールバック
    *
    * ドロップエリアにファイルをドラッグした時とエリア外に移動したさいに呼び出される
    *
    * @param e イベント値
    */
    public fileOver(e: boolean): void {
        this.hasDropZoneOver = e;
    }

    /**
     * ファイル情報変更コールバック
     */
    public onChange = (): void => {
        this.ref.detectChanges();
        const items: any[] = this.uploader.getNotUploadedItems();
        this.uploader.clearQueue();

        if (items.length <= 0) {
            this.currentItem = null;
            this.hasError = true;
            return;
        }
        this.currentItem = items[0].some;
        this.hasError = false;
        if (this.uploadOnChange) {
            this._upload(this.currentItem);
        }
    }

    /**
     * ファイルアップロード（手動）
     */
    public uploadManually(): void {
        this._upload(this.currentItem);
    }

    /**
     * ファイルアップロード
     * @param file ファイル
     */
    private async _upload(file: File): Promise<void> {
        try {
            this.uploadStart.emit(file);
            const res: Api = await this.fileUploadService.upload(
                this.apiId,
                file,
                typeof this.json === 'string' ? this.json : JSON.stringify(this.json),
                this.screenCode
            );
            this.uploadEnd.emit(res);
            this.currentItem = null;
            this.uploadElement.removeEventListener('change', this.onChange);
            this.uploader.clearQueue();
            this.uploadElement.value = '';
            this.uploadElement.addEventListener('change', this.onChange);
        } catch (errorData) {
            this.uploadFail.emit(errorData);
            throw errorData;
        }
    }

}
