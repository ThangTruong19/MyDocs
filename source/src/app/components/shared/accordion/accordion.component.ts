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
import { Labels } from 'app/types/common';

@Component({
    selector: 'app-accordion',
    templateUrl: './accordion.component.html',
    styleUrls: ['./accordion.component.scss'],
})
export class AccordionComponent implements OnInit {

    @Input() public collapsed: boolean;
    @Input() public title: string;
    @Input() public useCustomHeader: boolean;
    @Input() public set isLoading(_isLoading: boolean) {
        this._isLoading = _isLoading;
        if (!_isLoading) {
            this._calculateAnimationStyle();
        }
    }
    @Input() public labels: Labels;

    @Output() public onChangeState: EventEmitter<any> = new EventEmitter();

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

    /**
     * アコーディオンのスタイルを取得します。
     */
     public get accordionBodyStyle(): object {
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
    public async toggleAccordion(): Promise<any> {
        return new Promise(resolve => {
            this._disableChildAnimation();
            resolve(null);
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
    public onTransitionEnd(): void {
        this.animationEnabled = false;
        if (!this.collapsed) {
            this.overflowVisible = true;
            this.contentState = AccordionState.AUTO;
        }
        this._enableChildAnimation();
    }

    /**
     * アコーディオンの状態を切り替えます（アニメーション用）。
     * @param state アコーディオンの状態
     */
    private _updateContentStateForAnimation(state: AccordionState): Promise<void> {
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
                        setTimeout(() => resolve(null), 50);
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
                    setTimeout(() => resolve(null), 50);
                }).then(() => (this.contentState = AccordionState.CLOSE));
            });
        }
    }

    /**
     * アニメーションに必要な情報を計算します。
     */
    private _calculateAnimationStyle(): void {
        const accordionBody = this.el.querySelector('.app-panel-body');
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
    private _disableChildAnimation(): void {
        const selector = ':not(.app-panel-body)';
        forEach(this.el.querySelectorAll(selector), (element: Element) => {
            const ele: HTMLElement = <HTMLElement>element;
            ele.style.transition = 'none';
            ele.style.animation = 'none';
        });
    }

    /**
     * 子要素のアニメーションを有効化します。
     */
    private _enableChildAnimation(): void {
        const selector = ':not(.app-panel-body)';
        forEach(this.el.querySelectorAll(selector), (element: Element) => {
            const ele: HTMLElement = <HTMLElement>element;
            ele.style.transition = '';
            ele.style.animation = '';
        });
    }
}

@Component({
    selector: 'app-accordion-header',
    templateUrl: './accordion-header.component.html',
    styleUrls: ['./accordion.component.scss'],
})
export class AccordionHeaderComponent {
    @Input() title: string;
    @Input() collapsed: boolean;
    @Input() labels: Labels;

    public get accordionOperationText(): string {
        return this.collapsed
            ? this.labels.accordion_open
            : this.labels.accordion_close;
    }
}
