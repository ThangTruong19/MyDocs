import { Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

export abstract class KbaAbstractModalComponent {
  CLOSE_TIMEOUT = 300;
  @Input() index;

  constructor(protected activeModal: NgbActiveModal) {}

  /**
   * モーダルを閉じる
   * @param result 結果
   */
  protected _close(result) {
    this.getModalElements(this.index).forEach(el =>
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
    const backdrop = modal.previousElementSibling;
    return [modal, backdrop];
  }
}
