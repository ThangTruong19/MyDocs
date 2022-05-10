import { Component, Input, TemplateRef, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { isUndefined } from 'lodash';
import { AbstractModalComponent } from '../abstract-component/abstract-modal.compoenent';
import { Labels } from 'app/types/common';

@Component({
    selector: 'app-modal-content',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss'],
})
export class ModalComponent extends AbstractModalComponent {

    @Input() public title: string;
    @Input() public labels: Labels;
    @Input() public content: TemplateRef<any>;
    @Input() public data: any;
    @Input() public enableOk: boolean;
    @Input() public okBtnLabel: string;
    @Input() public okBtnClass: string;
    @Input() public closeBtnLabel: string;
    @Input() public hasOk: boolean;
    @Input() public showCloseBtn: boolean;

    protected hostElement: HTMLElement;
    protected isIE: boolean;

    constructor(activeModal: NgbActiveModal, elRef: ElementRef) {
        super(activeModal);
        this.hostElement = elRef.nativeElement;
        this.isIE = navigator.userAgent.toLowerCase().includes('trident');
    }

    /**
     * OKボタン押下コールバック
     */
    public onClickOk(): void {
        this._close('ok');
    }

    public createOkBtnLabel(): string {
        return !isUndefined(this.okBtnLabel) ? this.okBtnLabel : this.labels.ok_btn;
    }

    public createCloseBtnLabel(): string {
        return !isUndefined(this.closeBtnLabel)
            ? this.closeBtnLabel
            : this.labels.close;
    }

    public createOkBtnClass(): string {
        return !isUndefined(this.okBtnClass) ? this.okBtnClass : 'btn-primary';
    }

    /**
     * 閉じるボタン押下コールバック
     */
    public onClickClose(): void {
        this._close('ng');
    }
}
