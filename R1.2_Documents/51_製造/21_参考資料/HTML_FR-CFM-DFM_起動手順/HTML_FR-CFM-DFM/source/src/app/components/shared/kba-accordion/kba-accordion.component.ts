import {
  Component,
  OnInit,
  Input,
  ElementRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { AccordionState } from './accordion-states';
import { isNaN, forEach } from 'lodash';

@Component({
  selector: 'app-kba-accordion',
  templateUrl: './kba-accordion.component.html',
  styleUrls: ['./kba-accordion.component.scss'],
})
export class KbaAccordionComponent implements OnInit {
  @Input() collapsed: boolean;
  @Input() title: string;
  @Input() useCustomHeader: boolean;
  @Input() set isLoading(_isLoading: boolean) {
    this._isLoading = _isLoading;
    if (!_isLoading) {
      this._calculateAnimationStyle();
    }
  }
  @Input() labels;

  @Output() onChangeState: EventEmitter<any> = new EventEmitter();

  private el: HTMLElement;
  private contentHeight: string;
  private overflowVisible: boolean;
  private _isLoading: boolean;
  private contentState: AccordionState;
  private transitionDuration: string;

  // アニメーションの秒数のベースとなる数値
  private transitionDurationBase = 0.06;
  // アニメーションの秒数の調節用の数値
  private transitionDurationModifier = 0.3;

  private animationEnabled = false;

  constructor(elRef: ElementRef) {
    this.el = elRef.nativeElement;
  }

  ngOnInit(): void {
    this.overflowVisible = !this.collapsed;
    this.contentState = this.collapsed
      ? AccordionState.CLOSE
      : AccordionState.AUTO;
    // 実際はアコーディオンの内容がロードされた後に実行する
    setTimeout(() => {
      if (this._isLoading) {
        this._calculateAnimationStyle();
      }
    }, 1000);
  }

  /**
   * アコーディオンの開閉状態を切り替えます。
   */
  toggleAccordion(): Promise<any> {
    return new Promise(resolve => {
      this._disableChildAnimation();
      resolve();
    }).then(resolve => {
      this._handleAnimation();
      this.collapsed = !this.collapsed;
      this.overflowVisible = false;
      this.onChangeState.emit(this.collapsed);
    });
  }

  /**
   * トランジション終了時に行われる処理です。
   */
  onTransitionEnd() {
    this.animationEnabled = false;
    if (!this.collapsed) {
      this.overflowVisible = true;
      this.contentState = AccordionState.AUTO;
    }
    this._enableChildAnimation();
  }

  /**
   * アコーディオンのスタイルを取得します。
   */
  get accordionBodyStyle(): object {
    let height = 'auto';
    let opacity = '1';
    let position = 'static';
    let transitionTimingFunction = 'linear';
    const width = '100%';
    const overflow = this.overflowVisible ? 'visible' : 'hidden';
    const transitionDuration = this.transitionDuration;
    const transitionProperty = this.animationEnabled ? 'height' : 'none';

    switch (this.contentState) {
      case AccordionState.CLOSE:
        height = '0';
        break;
      case AccordionState.HIDDEN:
        position = 'absolute';
        opacity = '0';
        break;
      case AccordionState.MANUAL:
        height = this.contentHeight;
        transitionTimingFunction = 'ease-out';
        break;
      case AccordionState.AUTO:
      default:
        break;
    }

    return {
      height,
      opacity,
      position,
      overflow,
      width,
      transitionTimingFunction,
      transitionDuration,
      transitionProperty,
    };
  }

  /**
   * アコーディオンの状態を切り替えます（アニメーション用）。
   * @param state アコーディオンの状態
   */
  private _updateContentStateForAnimation(state: AccordionState): Promise<any> {
    this.contentState = state;

    return new Promise(resolve => {
      setTimeout(() => resolve());
    });
  }

  /**
   * アニメーションの制御を行うメソッドです。
   */
  private _handleAnimation(): void {
    if (this.collapsed) {
      this._updateContentStateForAnimation(AccordionState.HIDDEN)
        .then(() => {
          this._calculateAnimationStyle();
          return this._updateContentStateForAnimation(AccordionState.CLOSE);
        })
        .then(() => {
          new Promise(resolve => {
            this.animationEnabled = true;
            setTimeout(() => resolve(), 50);
          }).then(() => (this.contentState = AccordionState.MANUAL));
        });
    } else {
      const height = parseInt(this.contentHeight, 10);
      if (height <= 0 || isNaN(height)) {
        this._calculateAnimationStyle();
      }

      this._updateContentStateForAnimation(AccordionState.MANUAL).then(() => {
        this._calculateAnimationStyle();
        new Promise(resolve => {
          this.animationEnabled = true;
          setTimeout(() => resolve(), 50);
        }).then(() => (this.contentState = AccordionState.CLOSE));
      });
    }
  }

  /**
   * アニメーションに必要な情報を計算します。
   */
  private _calculateAnimationStyle() {
    const accordionBody = this.el.querySelector('.KBA-panel-body');
    const height = accordionBody.getBoundingClientRect().height;
    this.contentHeight = `${height}px`;
    this.transitionDuration = `${Math.pow(
      height,
      this.transitionDurationModifier
    ) * this.transitionDurationBase}s`;
  }

  /**
   * 子要素のアニメーションを無効化します。
   */
  private _disableChildAnimation() {
    const selector = ':not(.KBA-panel-body)';
    forEach(this.el.querySelectorAll(selector), el => {
      el.style.transition = 'none';
      el.style.animation = 'none';
    });
  }

  /**
   * 子要素のアニメーションを有効化します。
   */
  private _enableChildAnimation() {
    const selector = ':not(.KBA-panel-body)';
    forEach(this.el.querySelectorAll(selector), el => {
      el.style.transition = '';
      el.style.animation = '';
    });
  }
}

@Component({
  selector: 'app-kba-accordion-header',
  templateUrl: './kba-accordion-header.component.html',
  styleUrls: ['./kba-accordion.component.scss'],
})
export class KbaAccordionHeaderComponent {
  @Input() title: string;
  @Input() collapsed: boolean;
  @Input() labels;

  get accordionOperationText(): string {
    return this.collapsed
      ? this.labels.accordion_open
      : this.labels.accordion_close;
  }
}
