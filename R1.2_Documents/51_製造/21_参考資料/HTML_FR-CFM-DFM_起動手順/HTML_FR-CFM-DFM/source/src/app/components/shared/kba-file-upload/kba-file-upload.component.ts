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
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';

import { KbaMimeType } from '../../../constants/mime-types';
import { Api } from '../../../types/common';

import { KbaFileUploadService } from '../../../services/shared/kba-file-upload.service';
import { KbaAlertService } from '../../../services/shared/kba-alert.service';

@Component({
  selector: 'app-kba-file-upload',
  templateUrl: './kba-file-upload.component.html',
  styleUrls: ['./kba-file-upload.component.scss'],
  providers: [KbaFileUploadService],
})
export class KbaFileUploadComponent implements OnInit {
  @Input() apiId: string;
  @Input() labels;
  @Input() collapsed: boolean;
  @Input() isLoading: boolean;
  @Input() json: string | { [x: string]: any };
  @Input() layout: 'batch' | 'index';
  @Input() uploadOnChange = false;
  @Input() conditionsContent: TemplateRef<null>;
  @Input() screenCode: string;
  @Output() uploadStart: EventEmitter<File> = new EventEmitter();
  @Output() uploadEnd: EventEmitter<Api> = new EventEmitter();
  @Output() uploadFail: EventEmitter<any> = new EventEmitter();

  uploader: FileUploader;
  hasDropZoneOver = false;
  currentItem: File | null;
  hasError = false;
  hostElement: HTMLElement;
  uploadElement: HTMLInputElement;

  constructor(
    private fileUploadService: KbaFileUploadService,
    private alertService: KbaAlertService,
    private ref: ChangeDetectorRef,
    elementRef: ElementRef
  ) {
    const ua = navigator.userAgent.toLowerCase();
    const isIE = ua.indexOf('trident') > 0 || ua.indexOf('edge') > 0;
    const uploadOptions = isIE
      ? {
          allowedFileType: ['xls'],
        }
      : {
          allowedMimeType: [KbaMimeType.excel],
        };

    this.hostElement = elementRef.nativeElement;
    this.uploader = new FileUploader(uploadOptions);
  }

  ngOnInit() {
    this.ref.detectChanges();
    this.uploadElement = this.hostElement.querySelector(
      '.kba-input-file'
    ) as HTMLInputElement;
    this.uploadElement.addEventListener('change', this.onChange);
  }

  /**
  * ファイルドラッグコールバック
  *
  * ドロップエリアにファイルをドラッグした時とエリア外に移動したさいに呼び出される
  *
  * @param e イベント値
  */
  fileOver(e: boolean): void {
    this.hasDropZoneOver = e;
  }

  /**
   * ファイル情報変更コールバック
   */
  onChange = () => {
    this.ref.detectChanges();
    const items = this.uploader.getNotUploadedItems();
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
  uploadManually() {
    this._upload(this.currentItem);
  }

  /**
   * ファイルアップロード
   * @param file ファイル
   */
  private async _upload(file: File) {
    try {
      this.uploadStart.emit(file);
      const res = await this.fileUploadService.upload(
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
