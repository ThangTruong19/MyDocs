import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-kba-text',
  templateUrl: './kba-text.component.html',
  styleUrls: ['./kba-text.component.css'],
})
export class KbaTextComponent implements OnInit {
  isVisible: boolean;
  @Input() kbaResource: any;
  @Input() kbaName: string;
  @Input() kbaParams: string;
  @Input() maxlength: number;
  @Input() type: 'text' | 'number' | 'email' | 'tel' = 'text';
  @Input() showLabel = true;
  @Input() disabled = false;
  @Input() customLabel: string;

  constructor() {}

  ngOnInit() {
    if (!this._checkVisible()) {
      _.unset(this.kbaParams, this.kbaName);
    }
  }

  /**
   * 表示可能判定
   *
   * @return true 表示可能/false 表示不能
   */
  private _checkVisible(): boolean {
    this.isVisible = _.has(this.kbaResource, this.kbaName);
    return this.isVisible;
  }
}
