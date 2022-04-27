import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';

import { ResourceType } from '../../../../../constants/resource-type';

import { KbaAbstractModalComponent } from '../../../../shared/kba-abstract-component/kba-abstract-modal-compoenent';

@Component({
  selector: 'app-landmark-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
})
export class LandmarkConfirmModalComponent extends KbaAbstractModalComponent {
  @Input() resource;
  @Input() labels;
  @Input() initMap;
  @Input() others;
  @Input() desc;
  @Input() val;
  @Input() landmarkData;
  @Input() submit: () => void;

  menuOpen = false;

  constructor(activeModal: NgbActiveModal) {
    super(activeModal);
  }

  /**
   * 閉じるボタン押下時コールバック
   */
  onClickClose() {
    this._close('close');
  }

  /**
   * 登録ボタン押下時コールバック
   */
  onClickSubmit() {
    this.submit();
    this._close('submit');
  }
}
