import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { OptionKind } from '../../../../../constants/flm/group-area';
import { ResourceType } from '../../../../../constants/resource-type';
import * as _ from 'lodash';
import { KbaAbstractModalComponent } from '../../../../shared/kba-abstract-component/kba-abstract-modal-compoenent';

@Component({
  selector: 'app-group-area-confirm-modal-content',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
})
export class GroupAreaConfirmModalComponent extends KbaAbstractModalComponent {
  @Input() resource;
  @Input() labels;
  @Input() selectType;
  @Input() initMap;
  @Input() others;
  @Input() desc;
  @Input() val;
  @Input() polyPoints;
  @Input() rectData;
  @Input() submit;
  @Input() no: string;

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

  /**
   * 現在指定している選択種別名を取得
   */
  get selectTypeLabel(): string {
    const resType = _.find(
      this.resource.group_area.feature.geometry.type.values,
      v => {
        return v.value === this.selectType;
      }
    );
    return resType ? resType.name : '';
  }
}
