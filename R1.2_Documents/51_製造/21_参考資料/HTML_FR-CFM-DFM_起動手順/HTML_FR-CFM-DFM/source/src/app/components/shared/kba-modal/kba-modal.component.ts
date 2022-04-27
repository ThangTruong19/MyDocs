import { KbaModalService } from '../../../services/shared/kba-modal.service';
import { Component, Input, TemplateRef, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { isUndefined } from 'lodash';
import { KbaAbstractModalComponent } from '../kba-abstract-component/kba-abstract-modal-compoenent';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'kba-modal-content',
  templateUrl: './kba-modal.component.html',
  styleUrls: ['./kba-modal.component.scss'],
})
export class KbaModalComponent extends KbaAbstractModalComponent {
  @Input() title: string;
  @Input() labels: any;
  @Input() content: TemplateRef<any>;
  @Input() data: any;
  @Input() enableOk: boolean;
  @Input() okBtnLabel: string;
  @Input() okBtnClass: string;
  @Input() closeBtnLabel: string;
  @Input() hasOk: boolean;
  @Input() showCloseBtn: boolean;

  hostElement: HTMLElement;
  isIE: boolean;

  constructor(activeModal: NgbActiveModal, elRef: ElementRef) {
    super(activeModal);
    this.hostElement = elRef.nativeElement;
    this.isIE = navigator.userAgent.toLowerCase().includes('trident');
  }

  /**
   * OKボタン押下コールバック
   */
  onClickOk(): void {
    this._close('ok');
  }

  createOkBtnLabel(): string {
    return !isUndefined(this.okBtnLabel) ? this.okBtnLabel : this.labels.ok_btn;
  }

  createCloseBtnLabel(): string {
    return !isUndefined(this.closeBtnLabel)
      ? this.closeBtnLabel
      : this.labels.close;
  }

  createOkBtnClass(): string {
    return !isUndefined(this.okBtnClass) ? this.okBtnClass : 'btn-primary';
  }

  /**
   * 閉じるボタン押下コールバック
   */
  onClickClose(): void {
    this._close('ng');
  }
}
