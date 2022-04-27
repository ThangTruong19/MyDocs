import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({ template: '' })
export abstract class AbstractModalComponent {

    public readonly CLOSE_TIMEOUT = 300;

    @Input() public index: number;

    constructor(protected activeModal: NgbActiveModal) { }

    /**
     * モーダルを閉じる
     * @param result 結果
     */
    protected _close(result: any): void {
        this.getModalElements(this.index).forEach((el: Element) =>
            el.classList.remove('_show')
        );
        setTimeout(() => this.activeModal.close(result), this.CLOSE_TIMEOUT);
    }

    /**
     * 指定 index に対応するモーダル要素を取得
     * @param index インデックス
     */
    private getModalElements(index: number): Element[] {
        const modal: Element = document.querySelector(`.modal-${index}`);
        const backdrop: Element = modal.previousElementSibling;
        return [modal, backdrop];
    }

}
