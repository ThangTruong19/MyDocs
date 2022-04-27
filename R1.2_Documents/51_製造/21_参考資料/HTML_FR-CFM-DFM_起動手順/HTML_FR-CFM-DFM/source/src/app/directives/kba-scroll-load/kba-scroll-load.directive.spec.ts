import { Component, DebugElement } from '@angular/core';
import {
  async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { KbaScrollLoadDirective } from './kba-scroll-load.directive';

@Component({
  template: `
    <div
      id="test-scroll-el"
      (appKbaScrollLoad)="onScroll($event)"
      (autoLoad)="concatList()"
      [lists]="lists"
      [params]="pageParams"
      style="min-height: 10px; max-height: 50px; overflow-y:scroll;"
    >
      <ul>
        <li>項目1</li>
        <li>項目2</li>
        <li>項目3</li>
        <li>項目4</li>
        <li>項目5</li>
      </ul>
    </div>
  `,
})
class KbaScrollLoadDirectiveTestComponent {
  private lists: any = {
    visibleList: Array.apply(null, { length: 10 }).map(Number.call, Number),
    originList: Array.apply(null, { length: 20 }).map(Number.call, Number),
  };
  private pageParams = {
    pageNo: 1,
    pageCount: '20',
    autoLoadCount: 10,
    lastIndexList: 10,
  };

  concatList() {
    return { calls: null };
  }
}

describe('KbaScrollLoadDirective', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        KbaScrollLoadDirective,
        KbaScrollLoadDirectiveTestComponent,
      ],
    });
  }));

  describe('最下部までスクロールを行うことについて', () => {
    describe('表示データの数が表示件数以下かつ取得開始位置がデータの総数を超えていない場合', () => {
      it('表示データ件数が20件となっていること', async(() => {
        TestBed.compileComponents().then(() => {
          const fixture = TestBed.createComponent(
            KbaScrollLoadDirectiveTestComponent
          );
          const directiveEl = fixture.debugElement.query(
            By.directive(KbaScrollLoadDirective)
          );
          const directiveInstance = directiveEl.injector.get(
            KbaScrollLoadDirective
          );
          directiveEl.nativeElement.scrollTop = 1000;
          const inputEl = { srcElement: directiveEl.nativeElement };
          fixture.detectChanges();
          fixture.whenStable().then(() => {
            directiveInstance.onScroll(inputEl);
            expect(directiveInstance.lists.visibleList.length).toBe(20);
          });
        });
      }));
    });

    describe('自動ロードを行うと表示件数である50件以上を抜き出してしまう場合', () => {
      it('表示データ件数が50件となっていること', async(() => {
        TestBed.compileComponents().then(() => {
          const fixture = TestBed.createComponent(
            KbaScrollLoadDirectiveTestComponent
          );
          const component = fixture.componentInstance;
          component['lists'].visibleList = Array.apply(null, {
            length: 40,
          }).map(Number.call, Number);
          component['lists'].originList = Array.apply(null, {
            length: 100,
          }).map(Number.call, Number);
          component['pageParams'].pageCount = '50';
          component['pageParams'].autoLoadCount = 20;
          component['pageParams'].lastIndexList = 40;
          const directiveEl = fixture.debugElement.query(
            By.directive(KbaScrollLoadDirective)
          );
          const directiveInstance = directiveEl.injector.get(
            KbaScrollLoadDirective
          );
          directiveEl.nativeElement.scrollTop = 1000;
          const inputEl = { srcElement: directiveEl.nativeElement };
          fixture.detectChanges();
          fixture.whenStable().then(() => {
            directiveInstance.onScroll(inputEl);
            expect(directiveInstance.lists.visibleList.length).toBe(50);
          });
        });
      }));
    });

    describe('表示データの数が表示件数以上の場合', () => {
      it('表示データ件数が変化していないこと', async(() => {
        TestBed.compileComponents().then(() => {
          const fixture = TestBed.createComponent(
            KbaScrollLoadDirectiveTestComponent
          );
          const component = fixture.componentInstance;
          component['pageParams'].pageCount = '10';
          const directiveEl = fixture.debugElement.query(
            By.directive(KbaScrollLoadDirective)
          );
          const directiveInstance = directiveEl.injector.get(
            KbaScrollLoadDirective
          );
          directiveEl.nativeElement.scrollTop = 1000;
          const inputEl = { srcElement: directiveEl.nativeElement };
          fixture.detectChanges();
          fixture.whenStable().then(() => {
            directiveInstance.onScroll(inputEl);
            expect(directiveInstance.lists.visibleList.length).toBe(10);
          });
        });
      }));
    });

    describe('オリジナルデータの取得開始位置が表示件数以上の場合', () => {
      it('表示データ件数が表示件数と同じこと', async(() => {
        TestBed.compileComponents().then(() => {
          const fixture = TestBed.createComponent(
            KbaScrollLoadDirectiveTestComponent
          );
          const component = fixture.componentInstance;
          component['pageParams'].lastIndexList = 20;
          const directiveEl = fixture.debugElement.query(
            By.directive(KbaScrollLoadDirective)
          );
          const directiveInstance = directiveEl.injector.get(
            KbaScrollLoadDirective
          );
          directiveEl.nativeElement.scrollTop = 1000;
          const inputEl = { srcElement: directiveEl.nativeElement };
          fixture.detectChanges();
        });
      }));
    });
  });
});
