import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';

import * as _ from 'lodash';

import { KbaSelectedComponent } from '../kba-selected/kba-selected.component';

@Component({
  selector: 'app-kba-time-difference',
  templateUrl: './kba-time-difference.component.html',
  styleUrls: ['./kba-time-difference.component.scss'],
})
export class KbaTimeDifferenceComponent {
  @ViewChild('timeDifferenceSelect', { static: false })
  timeDifferenceSelect: KbaSelectedComponent;
  @ViewChild('timeDifferenceMinuteSelect', { static: false })
  timeDifferenceMinuteSelect: KbaSelectedComponent;

  timeSettingConstant = {
    all: '0',
    select: '1',
  };

  @Input()
  set value(v: string) {
    if (v === '') {
      this.timeDifferenceSetting = this.timeSettingConstant.all;
    } else {
      this.timeDifferenceSetting = this.timeSettingConstant.select;
      this._reflectTimeDifference(v);
    }
  }
  @Input() resource: any;
  @Input() labels: { [key: string]: string };
  @Output() changeTimeDifference: EventEmitter<string> = new EventEmitter<
    string
  >();

  timeDifference = {
    time_difference: '',
    time_difference_minute: '',
  };
  defaultTimeDiffrence = '+0000';
  timeDifferenceSetting = this.timeSettingConstant.all;

  constructor(private cdRef: ChangeDetectorRef) {}

  /**
   * 時差設定ラジオボタン変更時コールバック
   */
  onChangeTimeDifferenceSetting() {
    if (this.timeDifferenceSetting === this.timeSettingConstant.all) {
      this.changeTimeDifference.emit('');
    } else {
      this.changeTimeDifference.emit(this.defaultTimeDiffrence);
      this._reflectTimeDifference(this.defaultTimeDiffrence);
    }
  }

  /**
   * 時差プルダウン変更時の処理
   * @param elem 時 / 分
   * @param value 値
   */
  onTimeDiffrenceChange() {
    if (this.timeDifferenceSetting === this.timeSettingConstant.select) {
      const str =
        this.timeDifference.time_difference +
        this.timeDifference.time_difference_minute;
      if (/[+-]\d{4}/.test(str)) {
        this.changeTimeDifference.emit(str);
      }
    }
  }

  /**
   * 項目をリフレッシュする
   */
  refresh() {
    if (this.timeDifferenceSelect) {
      this.timeDifferenceSelect.refresh();
    }
    if (this.timeDifferenceMinuteSelect) {
      this.timeDifferenceMinuteSelect.refresh();
    }
    this.timeDifferenceSetting = this.timeSettingConstant.all;
    this.changeTimeDifference.emit('');
  }

  /**
   * 時差のパラメータを解釈しプルダウンに反映する
   * @param diff 時差（文字列形式）
   */
  private _reflectTimeDifference(diff: string) {
    diff = diff || this.defaultTimeDiffrence;

    this.timeDifference = {
      time_difference: diff.slice(0, 3),
      time_difference_minute: diff.slice(3),
    };
  }
}
