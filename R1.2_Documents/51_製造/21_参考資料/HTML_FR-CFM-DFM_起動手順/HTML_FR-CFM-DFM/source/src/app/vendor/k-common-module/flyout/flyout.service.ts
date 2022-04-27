import { Injectable } from '@angular/core';
import { Event as NavigationEvent, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

/**
 * Flyout は、一連の操作の範疇でのみ、複数の Flyout を開くことができる。
 * このとき、開かれる Flyout 群は、必ず直列となる（A -> B -> C と開いたら、 C -> B -> A の順に閉じる）
 * また、異なる文脈で同時に開くことはできない（A を開いてる間に A' を開くなど）
 * この文脈を表現するため、 registerFlyout() メソッドは contextId を受け取ることができる。
 * contextId には、文脈上の親要素にあたる Flyout の Id を渡す。
 */

export interface Flyout {
  id: string;
  isOpened: boolean;
  contextId: string | null;
  triggerClientRect: ClientRect | null;
}

type FlyoutMap = Map<string, Flyout>;

export const getSerializedContextIds = (flyouts: FlyoutMap, givenId: string): string[] => {
  const flyout = flyouts.get(givenId);
  console.assert(
    !!flyout,
    `指定ID["${givenId}"]によるFlyout要素の登録[registerFlyout()]が行われていません`,
  );

  if (!flyout.contextId) {
    return [givenId];
  }

  return [givenId].concat(getSerializedContextIds(flyouts, flyout.contextId));
};

@Injectable()
export class FlyoutService {
  private flyoutMap: FlyoutMap = new Map();
  private flyoutMap$: BehaviorSubject<FlyoutMap> = new BehaviorSubject(this.flyoutMap);
  private preventCloseQueue = [];

  constructor(private router: Router) {
    fromEvent(window, 'resize').subscribe(() => this.closeAllFlyout());
    this.locationChanged$.subscribe(() => this.closeAllFlyout());
  }

  /**
   * Flyout 要素を service に登録する。
   */
  registerFlyout(id: string, contextId: string = null) {
    if (!!this.flyoutMap.get(id)) {
      return;
    }

    this.flyoutMap.set(id, {
      id,
      contextId,
      isOpened: false,
      triggerClientRect: null,
    });
    this.flyoutMap$.next(this.flyoutMap);
  }

  getIsOpened$(id: string): Observable<boolean> {
    return this.flyoutMap$.pipe(map(flyouts => {
      const flyout = flyouts.get(id);
      console.assert(
        !!flyout,
        `指定ID["${id}"]によるFlyout要素の登録[registerFlyout()]が行われていません`,
      );
      return flyout.isOpened;
    }))
  }

  getOpened$(id: string): Observable<boolean> {
    return this.getIsOpened$(id).pipe(filter(isOpen => !!isOpen));
  }

  getClosed$(id: string): Observable<boolean> {
    return this.getIsOpened$(id)
      .pipe(map(isOpened => !isOpened), filter(isClosed => isClosed));
  }

  getTriggerClientRect$(id: string): Observable<ClientRect> {
    return this.flyoutMap$.pipe(
      map(flyouts => {
        const flyout = flyouts.get(id);
        console.assert(
          !!flyout,
          `指定ID["${id}"]によるFlyout要素の登録[registerFlyout()]が行われていません`,
        );
        return flyout.triggerClientRect;
      }),
      filter(v => !!v) // null の場合は流さない
    );
  }

  open(givenId: string, triggerClientRect: ClientRect) {
    this.closeAllOtherContext(givenId);

    this.flyoutMap.set(givenId, {
      ...this.flyoutMap.get(givenId),
      isOpened: true,
      triggerClientRect,
    });
    this.flyoutMap$.next(this.flyoutMap);
  }

  /**
   * Flyout 外クリックによって、文脈内の要素が close されることを防いでいる
   */
  close(givenId: string) {
    const flyout = this.flyoutMap.get(givenId);
    if (!flyout || !flyout.isOpened) {
      return;
    }

    if (!!flyout.contextId) {
      this.preventCloseQueue = this.preventCloseQueue.concat(flyout.contextId);
    }

    if (this.preventCloseQueue.includes(givenId)) {
      this.preventCloseQueue = this.preventCloseQueue.filter(id => id !== givenId);
      return;
    }

    this.close_(givenId);
  }

  /**
   * ビューポート上端から、配置するFlyout要素の上端までの距離を取得
   */
  getDistanceFromTop(
    triggerElementRectTop: number,
    triggerElementHight: number,
    flyoutTopSpace: number,
    flyoutElementHeight: number,
    windowScrollTop: number,
    windowHeight: number,
  ): number {
    // 下方向の表示位置を算出
    const distance = triggerElementRectTop + triggerElementHight + windowScrollTop + flyoutTopSpace;

    // ビューポートからはみ出してた場合
    if (distance + flyoutElementHeight - windowHeight - windowScrollTop > 0) {
      // 上方向の表示位置を算出
      const adjustedDistance =
        triggerElementRectTop + windowScrollTop - flyoutTopSpace - flyoutElementHeight;

      // ビューポートからはみ出してない場合
      if (adjustedDistance - windowScrollTop >= 0) {
        return adjustedDistance;
      }
    }
    return distance;
  }

  private get locationChanged$(): Observable<NavigationEvent> {
    return this.router.events.pipe(filter(event => event instanceof NavigationEnd));
  }

  private close_(givenId: string) {
    const flyout = this.flyoutMap.get(givenId);

    this.flyoutMap.set(givenId, {
      ...flyout,
      isOpened: false,
      triggerClientRect: null,
    });
    this.flyoutMap$.next(this.flyoutMap);
  }

  private closeAllFlyout() {
    this.preventCloseQueue = [];
    this.flyoutMap.forEach((_, id) => this.close_(id));
  }

  private closeAllOtherContext(givenId: string) {
    const contexts = getSerializedContextIds(this.flyoutMap, givenId);
    this.flyoutMap.forEach((_, id) => {
      if (contexts.includes(id)) {
        return;
      }
      this.close_(id);
    });
  }
}
