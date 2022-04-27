import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ElementRef,
} from '@angular/core';
import { some, filter } from 'lodash';
import { KbaMimeType } from '../../../constants/mime-types';
import { DisplayCode } from '../../../constants/display-code';

@Component({
  selector: 'app-kba-popover',
  templateUrl: './kba-popover.component.html',
})
export class KbaPopoverComponent implements OnInit {
  @Input() labels;
  @Input() title: string;
  @Input() download: boolean;
  @Input() set downloadType(downloadType) {
    this._downloadTypes = downloadType;
    this.selectedDownloadType = downloadType && downloadType.values[0].value;
  }

  get downloadType() {
    return this._downloadTypes;
  }

  @Input()
  get isVisible() {
    return this.visible;
  }

  set isVisible(val) {
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

  get resource() {
    return this._resource;
  }

  @Output() isVisibleChange: EventEmitter<any> = new EventEmitter();

  @Input() set resource(val) {
    if (val == null) {
      return;
    }

    const filteredVal = val.map(resource => ({
      ...resource,
      name: resource.name.replace(/##/g, ''),
    }));

    this._resource = filteredVal;
    this.selectableFields = filteredVal.filter(
      field => parseInt(field.display_code, 10) > parseInt(DisplayCode.none, 10)
    );
  }

  @Input() set fields(val) {
    if (val == null) {
      return;
    }
    this._fields = val;
    val.forEach(f => {
      if (parseInt(f.display_code, 10) > parseInt(DisplayCode.none, 10)) {
        this.checkedItems[f.path] = true;
      }
    });
    this.onCheck();
  }

  @Output() ok: EventEmitter<any> = new EventEmitter();

  @Input() set promise(_promise: Promise<void | void[]>) {
    if (_promise) {
      this.isLoading = true;
      _promise.then(() => this.isLoading = false);
    }
  }

  checkAll;
  selectableFields = [];
  checkedItems = {};
  visible;
  afterVisualize;
  _resource;
  _fields;
  selectedDownloadType;
  _downloadTypes;
  el: HTMLElement;
  kbaMimeType = KbaMimeType;
  displayCodes = DisplayCode;
  isLoading = false;

  constructor(elRef: ElementRef) {
    this.el = elRef.nativeElement;
  }

  get okButtonEnabled() {
    return some(this.checkedItems, v => v);
  }

  ngOnInit() {
    document.body.addEventListener('click', e => {
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
  onCheckAll(check) {
    if (check) {
      this.selectableFields.forEach(
        val => (this.checkedItems[val.path] = true)
      );
    } else {
      this.selectableFields.forEach(val => {
        if (+val.display_code !== +DisplayCode.inactiveDisplay) {
          this.checkedItems[val.path] = false;
        }
      });
    }
  }

  /**
   * チェックボックス切り替え時の処理
   */
  onCheck() {
    this.checkAll = this.selectableFields.every(f => this.checkedItems[f.path]);
  }

  /**
   * OK ボタン押下時の処理
   */
  onClickOk() {
    const fields = filter(
      this.resource,
      r => r.display_code !== DisplayCode.display || this.checkedItems[r.path]
    ).map(r => ({ path: r.path, display_sequence_no: r.display_sequence_no }));
    const result: any = { fields };

    if (this.download) {
      result.fileType = this.selectedDownloadType;
    }
    this.isVisible = false;
    this.ok.emit(result);
  }
}
