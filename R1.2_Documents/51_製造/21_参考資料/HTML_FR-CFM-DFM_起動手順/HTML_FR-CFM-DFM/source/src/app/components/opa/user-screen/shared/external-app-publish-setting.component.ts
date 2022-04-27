import {
  Component,
  Input,
  EventEmitter,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { PublishKind } from '../../../../constants/opa/user-screen';
import { Labels } from '../../../../types/common';

@Component({
  selector: 'app-external-app-publish-setting',
  templateUrl: './external-app-publish-setting.component.html',
  styleUrls: ['./external-app-publish-setting.component.scss'],
})
export class ExternalAppPublishSettingComponent implements OnChanges {
  @Input() publishKind: string;
  @Input() editable: boolean;
  @Input() index: number;
  @Input() labels;
  @Input() isConfirm: boolean;
  @Output() change: EventEmitter<any> = new EventEmitter();

  publishLabel: string;
  publishClass: string;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.publishKind.currentValue === PublishKind.unpublish) {
      this.publishLabel = this.labels.off_btn;
      this.publishClass = 'off';
    } else {
      this.publishLabel = this.labels.on_btn;
      this.publishClass = 'on';
    }
  }

  /**
   * ボタン押下時コールバック
   */
  onClickPublish(): void {
    if (!this.editable) {
      return;
    }

    this.change.emit(this.index);
  }
}
