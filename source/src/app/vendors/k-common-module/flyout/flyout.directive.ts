import {
  Directive,
  ChangeDetectorRef,
  ElementRef,
  OnInit,
  OnDestroy,
  HostBinding,
  Input,
} from '@angular/core';
import { fromEvent, merge, Observable, Subscription, zip } from 'rxjs';
import { filter, take, withLatestFrom } from 'rxjs/operators';

import { FlyoutService } from './flyout.service';

interface Subscriptions {
  hasToggleOpened: Subscription;
  hasToggleClosed: Subscription;
  onClickOuter: Subscription;
  onClickInner: Subscription;
  onKeydownEscape: Subscription;
}

/**
 * クリッカブル要素は下記属性で指定。
 */
const clickableItemSelector = '[commonFlyoutItem]';

/**
 * 同一のスタック文脈内のzIndexに、これ以上の値はまず出てこないという想定でこの値を指定。
 */
const flyoutZIndex = '100';

/**
 * Flyout配置時に上部にスペースを空けることを可能にしており、デフォルトは3px。
 */
const defaultTopSpace = 3;

/**
 * Flyout要素をappendする要素を特定するセレクターを指定可能で、デフォルトはbody。
 */
const defaultTargetSelector = 'body';

const KEY_CODE_ESCAPE = 27;

const minimumMargin = 10;

/**
 * 特定の要素がFlyoutDirectiveに含まれるかの判定
 * Flyoutの外側クリックの判定利用
 */
const isFlyoutElement = (element: HTMLElement): boolean => {
  if (element.hasAttribute('commonFlyout')) {
    return true;
  }

  if (!element.parentElement) {
    return false;
  }

  return isFlyoutElement(element.parentElement)
}

@Directive({
  /* tslint:disable directive-selector */
  selector: '[commonFlyout]',
})
export class FlyoutDirective implements OnInit, OnDestroy {
  /* tslint:disable */
  @Input('attr-aria-controls')
  @HostBinding('attr-aria-controls')
  flyoutId: string;
  /* tslint:enable */

  @Input() isAlignRight = false;
  @Input() topSpace = defaultTopSpace;
  @Input() targetSelector = defaultTargetSelector;
  @Input() context: string | undefined;

  @HostBinding('class.is-opened') private isOpenedClass = false;
  @HostBinding('class.is-closed') private isClosedClass = true;

  private document: Document;
  private element: HTMLElement;
  private triggerClientRect: ClientRect;
  private subscriptions: Subscriptions;
  private isAppended = false;
  private _isOpened = false;

  constructor(
    private cdRef: ChangeDetectorRef,
    private el: ElementRef,
    private flyoutService: FlyoutService,
  ) {
    this.document = window.document;
    this.subscriptions = {
      hasToggleOpened: null,
      hasToggleClosed: null,
      onClickOuter: null,
      onClickInner: null,
      onKeydownEscape: null,
    };
  }

  ngOnInit() {
    this.element = this.el.nativeElement;

    console.assert(this.flyoutId !== undefined, 'flyoutIdが未指定です');
    this.flyoutService.registerFlyout(this.flyoutId, this.context);

    const toggleStream$ = this.flyoutService
      .getIsOpened$(this.flyoutId)
      .pipe(filter(current => current !== this.isOpened));

    // 開閉の切り替わりの処理をそれぞれopen時とclose時に切り分けており、open時にのみ座標情報が必要となる。
    // 切り分けないと、close時にも不必要な座標情報をnullや空インスタンスを指定してStreamに流さなければいけなくなってしまう。
    this.prepareToggleOpened(
      toggleStream$,
      this.flyoutService.getTriggerClientRect$(this.flyoutId),
    );
    this.prepareToggleClosed(toggleStream$);
  }

  ngOnDestroy() {
    if (this.isAppended) {
      this.element.parentNode.removeChild(this.element);
    }
    this.subscriptions.hasToggleOpened.unsubscribe();
    this.subscriptions.hasToggleClosed.unsubscribe();
  }

  close() {
    // close するかどうかは FlyoutService が決定するので、 close されたことを検知してから unsubscribe する。
    this.flyoutService.getClosed$(this.flyoutId).pipe(take(1)).subscribe(_ => {
      this.unsubscribeStreamsWhileOpening();
    });
    this.flyoutService.close(this.flyoutId);
  }

  private set isOpened(v: boolean) {
    this._isOpened = v;
    this.isClosedClass = !this._isOpened;
    this.isOpenedClass = this._isOpened;
    this.prepareFlyoutHandling();
  }

  private get isOpened(): boolean {
    return this._isOpened;
  }

  private prepareFlyoutHandling() {
    if (this._isOpened) {
      this.prepareOpen();
      this.prepareOnClickInner();
      this.prepareOnClickOuter();
      this.prepareOnKeydownEscape();
      return;
    }
    this.unsubscribeStreamsWhileOpening();
  }

  private prepareToggleOpened(
    toggleStream$: Observable<boolean>,
    triggerClientRect$: Observable<ClientRect>,
  ) {
    const opened$ = toggleStream$.pipe(filter(isOpened$ => isOpened$ === true));

    this.subscriptions.hasToggleOpened =
      // combineLatestだとtriggerClientRect$のキャッシュが利用されてしまうので、withLatestFromにする
      opened$.pipe(withLatestFrom(triggerClientRect$)).subscribe(([opened, triggerClientRect]) => {
        this.triggerClientRect = triggerClientRect;
        this.isOpened = opened;
      });
  }

  private prepareToggleClosed(toggleStream$: Observable<boolean>) {
    const closed$ = toggleStream$.pipe(filter((isOpened$ => isOpened$ === false)));
    this.subscriptions.hasToggleClosed = closed$.subscribe(closed => {
      this.isOpened = closed;
    });
  }

  private prepareOpen() {
    if (!this.isAppended) {
      this.appendForStackingContext();
    }
    this.adjustPosition();
    this.isAppended = true;
  }

  /**
   * 重なり順の影響を受けないように、Flyout要素を移動する
   */
  private appendForStackingContext() {
    this.element.style.zIndex = flyoutZIndex;
    this.element.style.position = 'absolute';
    this.document.querySelector(this.targetSelector).appendChild(this.element);
  }

  /**
   * 移動したFlyout要素を、Trigger要素を基準に位置調整を行う
   */
  private adjustPosition() {
    this.element.style.top = `${this.getDistanceFromTop()}px`;
    if (this.isAlignRight) {
      this.element.style.right = `${this.getDistanceFromRight()}px`;
      return;
    }

    this.adjustLeftPosition();
  }

  private adjustLeftPosition() {
    const elementWidth = this.getFlyoutElementWidth(this.element);
    const flyoutRightEdge = this.getDistanceFromLeft() + elementWidth;

    if (flyoutRightEdge > this.document.body.clientWidth) {
      const left =
        this.getDistanceFromLeft() -
        (flyoutRightEdge - this.document.body.clientWidth) -
        minimumMargin;
      this.element.style.left = `${left}px`;
      return;
    }

    this.element.style.left = `${this.getDistanceFromLeft()}px`;
  }

  /**
   * ビューポート上端から、配置するFlyout要素の上端までの距離を取得
   */
  private getDistanceFromTop(): number {
    const flyoutElementHeight = this.getFlyoutElementHeight(this.element);
    const distance = this.flyoutService.getDistanceFromTop(
      this.triggerClientRect.top,
      this.triggerClientRect.height,
      this.topSpace,
      flyoutElementHeight,
      window.pageYOffset,
      window.innerHeight,
    );
    return distance;
  }

  /**
   * ビューポート左端から、配置するFlyout要素の左端までの距離を取得
   */
  private getDistanceFromLeft(): number {
    return this.triggerClientRect.left + window.pageXOffset;
  }

  /**
   * ビューポート右端から、配置するFlyout要素の右端までの距離を取得
   */
  private getDistanceFromRight(): number {
    const targetWidth = this.document.querySelector(this.targetSelector).clientWidth;
    // triggerRect.rightはビューポートからの相対であるため、
    // 横スクロールが発生していることを想定すると、window.pageXOffsetによる減算が必要
    const triggerDistanceFromBodyRight =
      targetWidth - this.triggerClientRect.right - window.pageXOffset;
    // ビューポートの右端から、trigger要素までの距離を取得するため、
    // ここでもwindow.pageXOffsetによる減算が必要
    return triggerDistanceFromBodyRight - window.pageXOffset;
  }

  /**
   * Flyout要素を一時的に表示状態にして、要素の高さを得る
   */
  private getFlyoutElementHeight(flyoutEl: HTMLElement) {
    const isDisplayNone = window.getComputedStyle(flyoutEl).display === 'none';
    if (isDisplayNone) {
      flyoutEl.classList.add('is-opened');
    }
    const height = flyoutEl.offsetHeight;
    if (isDisplayNone) {
      flyoutEl.classList.remove('is-opened');
    }
    return height;
  }

  /**
   * Flyout要素を一時的に表示状態にして、要素の幅を得る
   */
  private getFlyoutElementWidth(flyoutEl: HTMLElement) {
    const isDisplayNone = window.getComputedStyle(flyoutEl).display === 'none';
    if (isDisplayNone) {
      flyoutEl.classList.add('is-opened');
    }
    const width = flyoutEl.offsetWidth;
    if (isDisplayNone) {
      flyoutEl.classList.remove('is-opened');
    }
    return width;
  }

  /**
   * flyoutの外のクリックイベントを購読。
   * クリックされたらflyoutを閉じる。
   * flyoutの中でflyoutを開いたときに、子のflyoutクリックで親のflyoutを閉じないように、
   * クッリクされた要素がflyoutに含まれる場合は除外
   */
  private prepareOnClickOuter() {
    this.subscriptions.onClickOuter = merge(
      fromEvent<MouseEvent>(this.document, 'click'),
      fromEvent<MouseEvent>(this.document, 'touchend'),
    )
      .pipe(
        filter(ev => !this.element.contains(ev.target as HTMLElement)),
        filter(ev => !isFlyoutElement(ev.target as HTMLElement)),
      )
      .subscribe(_ => this.close());
  }

  /**
   * flyoutのクリッカブル要素のクリックイベントを購読
   * クリッカブル要素は動的に増減するため、documentのクリックイベントから判定
   */
  private prepareOnClickInner() {
    this.subscriptions.onClickInner = fromEvent<MouseEvent>(this.document, 'click')
      .pipe(
        filter(ev => {
          const clickableItems = Array.from(
            this.element.querySelectorAll(clickableItemSelector),
          ) as HTMLElement[];
          return clickableItems.some(item => item.contains(ev.target as HTMLElement))
        }),
      )
      .subscribe(_ => this.close());
  }

  /**
   * window の ESC キーを購読。
   * ESC キーが押されたら flyout を閉じる。
   */
  private prepareOnKeydownEscape() {
    this.subscriptions.onKeydownEscape = fromEvent<KeyboardEvent>(
      this.document,
      'keydown',
    )
      .pipe(filter(ev => KEY_CODE_ESCAPE === ev.keyCode))
      .subscribe(_ => this.close());
  }

  private unsubscribeStreamsWhileOpening() {
    if (this.subscriptions.onClickOuter) {
      this.subscriptions.onClickOuter.unsubscribe();
    }

    if (this.subscriptions.onKeydownEscape) {
      this.subscriptions.onKeydownEscape.unsubscribe();
    }

    if (this.subscriptions.onClickInner) {
      this.subscriptions.onClickInner.unsubscribe();
    }

    // 明示的に呼ばないと、コンポーネントに対して割り当てられたイベントを適切に解除できない。
    this.cdRef.markForCheck();
  }
}
