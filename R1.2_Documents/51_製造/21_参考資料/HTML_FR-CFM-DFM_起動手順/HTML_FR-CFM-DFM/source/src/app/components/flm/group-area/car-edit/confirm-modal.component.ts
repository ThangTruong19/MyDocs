import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';

import { OptionKind } from '../../../../constants/flm/group-area';
import { ResourceType } from '../../../../constants/resource-type';

@Component({
  selector: 'app-group-area-confirm-modal-content',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
})
export class GroupAreaCarConfirmModalComponent {
  @Input() resource;
  @Input() labels;
  @Input() selectType;
  @Input() params;
  @Input() carIdentifierLabel;
  @Input() polyPoints;
  @Input() rectData;
  @Input() others;
  @Input() submit;

  menuOpen = false;

  constructor(public activeModal: NgbActiveModal) {}

  /**
   * 閉じるボタン押下時コールバック
   */
  onClickClose() {
    this.activeModal.close('close');
  }

  /**
   * 登録ボタン押下時コールバック
   */
  onClickSubmit() {
    this.submit();
    this.activeModal.close('submit');
  }

  /**
   * 現在指定している選択種別名を取得
   */
  get selectTypeLabel(): string {
    const resType = _.find(
      this.resource.car_area.feature.geometry.type.values,
      v => {
        return v.value === this.selectType;
      }
    );
    return resType ? resType.name : '';
  }
}
