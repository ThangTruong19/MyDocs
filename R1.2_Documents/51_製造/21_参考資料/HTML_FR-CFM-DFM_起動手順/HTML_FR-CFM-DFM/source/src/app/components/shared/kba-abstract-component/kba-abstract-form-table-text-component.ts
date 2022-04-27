import { Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as _ from 'lodash';

export abstract class KbaAbstractFormTableTextComponent implements OnInit {
  isVisible: boolean;
  patternRegexp: string;
  name: string;
  viewData: string;
  abstract defaultSize;
  @Input() formGroup: FormGroup;
  @Input() kbaName: string;
  @Input() kbaParams: any;
  @Input() kbaResource: any;
  @Input() kbaLabel: any;
  @Input() display: string;
  @Input() notEditable: boolean;
  @Input() colspan: number;
  @Input() required: boolean;
  @Input() maxLength: number;
  @Input() number: number;
  @Input() size: 'small' | 'middle' | 'large';
  @Input() path;
  @Input() errorData;
  @Output() change: EventEmitter<any> = new EventEmitter();

  get sizeClass() {
    return `KBA-input__${this.size || this.defaultSize}`;
  }

  ngOnInit() {
    if (this._checkVisible()) {
      this._setInitItems();
      this._setInitExtra();

      if (!this.notEditable) {
        const control = this.formGroup.get(this.name);

        if (control != null) {
          control.setValue(this.kbaParams[this.kbaName]);
        }
      }
    } else {
      _.unset(this.kbaParams, this.kbaName);
    }
  }

  handleChange(value: string) {
    this.kbaParams[this.kbaName] = value;
    this.change.emit();
  }

  /**
   * 入力時コールバック
   */
  changeValue() {
    this.change.emit();
  }

  applyValue() {
    const control = this.formGroup.get(this.name);

    if (control != null) {
      control.setValue(this.kbaParams[this.kbaName]);
    }
  }

  protected abstract _setInitExtra();

  /**
   * 表示可能かの判定
   */
  private _checkVisible(): boolean {
    this.isVisible = _.has(this.kbaResource, this.kbaName);
    return this.isVisible;
  }

  /**
   * 表示用のデータを返す
   */
  private _setViewData() {
    this.viewData = _.isEmpty(this.display)
      ? this.kbaParams[this.kbaName]
      : this.kbaParams[this.display];
  }

  /**
   * 初期状態のセット
   */
  private _setInitItems() {
    let value;
    if (_.isEmpty(this.kbaParams[this.kbaName])) {
      value = '';
    } else {
      value = this.kbaParams[this.kbaName];
    }
    this.name = _.isUndefined(this.number)
      ? this.kbaName
      : this.kbaName + this.number;
    if (!this.notEditable) {
      const fc = this.required
        ? new FormControl(value, Validators.required)
        : new FormControl();
      this.formGroup.addControl(this.name, fc);
    }
    this._setViewData();
  }

  private _checkErrorOccurrence(errorData, path): boolean {
    return _.some(errorData, data => _.includes(data.keys, path));
  }
}
