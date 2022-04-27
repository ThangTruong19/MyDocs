import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { KbaPaginationComponent } from './kba-pagination.component';

@Component({
  selector: 'app-kba-accordion-test',
  template: `
    <app-kba-pagination
      [count]="count"
      [params]="params"
      [labels]="labels"
      [element]="element"
      (changeState)="fetchList()"
    >
    </app-kba-pagination>
  `,
})
class KbaPaginationTestComponent {
  count = 52;
  params = { pageNo: 3, pageCount: 10 };
  labels = {
    page: 'ページ',
    page_count: '${total}件中${first}件〜${end}件を表示',
    number_of_display: '表示件数:',
  };
  element = {
    pageCount: {
      values: [
        { name: '10', value: 10 },
        { name: '20', value: 20 },
        { name: '30', value: 30 },
      ],
    },
  };

  @ViewChild(
    KbaPaginationComponent,
    /* TODO: add static flag */ {},
    { static: false }
  )
  kbaPaginationComponent: KbaPaginationComponent;
  fetchList() {
    return { calls: null };
  }
}

describe('KbaPaginationComponent', () => {
  let component: KbaPaginationTestComponent;
  let fixture: ComponentFixture<KbaPaginationTestComponent>;
  let countDebug: DebugElement;
  let pageCountDebug: DebugElement;
  let pageNoDebug: DebugElement;
  let displayPageDebug: DebugElement;
  let prevPageDebug: DebugElement;
  let nextPageDebug: DebugElement;
  let countEl: HTMLElement;
  let pageCountEl: HTMLSelectElement;
  let pageNoEl: HTMLSelectElement;
  let displayPageEl: HTMLElement;
  let prevPageEl: HTMLButtonElement;
  let nextPageEl: HTMLButtonElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KbaPaginationTestComponent, KbaPaginationComponent],
      imports: [FormsModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KbaPaginationTestComponent);
    component = fixture.componentInstance;
    spyOn(component, 'fetchList');
    fixture.detectChanges();
    component.kbaPaginationComponent.buildOptions();
    fixture.detectChanges();

    countDebug = fixture.debugElement.query(
      By.css('.KBA-table-pagination-count')
    );
    countEl = countDebug.nativeElement;
    pageCountDebug = fixture.debugElement.query(By.css('select.page-count'));
    pageCountEl = pageCountDebug.nativeElement;
    pageNoDebug = fixture.debugElement.query(By.css('select.page-no'));
    pageNoEl = pageNoDebug.nativeElement;
    displayPageDebug = fixture.debugElement.query(
      By.css('.KBA-table-pagination-move > p')
    );
    displayPageEl = displayPageDebug.nativeElement;
    prevPageDebug = fixture.debugElement.query(
      By.css('.KBA-table-pagination-move__prev')
    );
    prevPageEl = prevPageDebug.nativeElement;
    nextPageDebug = fixture.debugElement.query(
      By.css('.KBA-table-pagination-move__next')
    );
    nextPageEl = nextPageDebug.nativeElement;
    fixture.detectChanges();
  });

  it('初期値が正しくセットされているか', async(() => {
    fixture.whenStable().then(() => {
      expect(countEl.innerHTML).toEqual('52件中21件〜30件を表示');
      expect(pageCountEl.childElementCount).toEqual(
        component.element.pageCount.values.length
      );
      expect(pageCountEl.value).toEqual(
        component.element.pageCount.values[0].value + ''
      );
      expect(pageNoEl.childElementCount).toEqual(6);
      expect(pageNoEl.value).toEqual('3');
      expect(displayPageEl.innerHTML).toEqual('/ 6ページ');
    });
  }));

  describe('前のページボタンについて', () => {
    describe('3/6ページの状態のとき', () => {
      beforeEach(() => {
        prevPageDebug.triggerEventHandler('click', null);
      });

      it('前へボタンが有効となっているか', done => {
        setTimeout(() => {
          fixture.detectChanges();
          expect(prevPageEl.disabled).toBeFalsy();
          done();
        }, 1000);
      });

      it('ボタン押下時にページが前のページとなるか', done => {
        setTimeout(() => {
          fixture.detectChanges();
          expect(countEl.innerHTML).toEqual('52件中11件〜20件を表示');
          expect(pageCountEl.childElementCount).toEqual(
            component.element.pageCount.values.length
          );
          expect(pageCountEl.value).toEqual('10');
          expect(pageNoEl.childElementCount).toEqual(6);
          expect(pageNoEl.value).toEqual('2');
          expect(displayPageEl.innerHTML).toEqual('/ 6ページ');
          done();
        }, 1000);
      });

      it('ボタン押下時にページ更新処理が呼び出されるか', done => {
        setTimeout(() => {
          fixture.detectChanges();
          expect(component.fetchList).toHaveBeenCalledTimes(1);
          done();
        }, 1000);
      });
    });

    describe('1/6ページの状態のとき', () => {
      beforeEach(() => {
        component.params = { pageNo: 1, pageCount: 10 };
        fixture.detectChanges();
      });

      it('前へボタンが無効となっているか', () => {
        expect(prevPageEl.disabled).toBeTruthy();
      });
    });
  });

  describe('次のページボタンについて', () => {
    describe('3/6ページの状態のとき', () => {
      beforeEach(() => {
        nextPageDebug.triggerEventHandler('click', null);
      });

      it('次へボタンが有効となっているか', done => {
        setTimeout(() => {
          fixture.detectChanges();
          expect(nextPageEl.disabled).toBeFalsy();
          done();
        }, 1000);
      });

      it('次のページボタン押下時、ページが次のページとなるか', done => {
        setTimeout(() => {
          fixture.detectChanges();
          expect(countEl.innerHTML).toEqual('52件中31件〜40件を表示');
          expect(pageCountEl.childElementCount).toEqual(
            component.element.pageCount.values.length
          );
          expect(pageCountEl.value).toEqual('10');
          expect(pageNoEl.childElementCount).toEqual(6);
          expect(pageNoEl.value).toEqual('4');
          expect(displayPageEl.innerHTML).toEqual('/ 6ページ');
          done();
        }, 1000);
      });

      it('ボタン押下時にページ更新処理が呼び出されるか', done => {
        setTimeout(() => {
          fixture.detectChanges();
          expect(component.fetchList).toHaveBeenCalledTimes(1);
          done();
        }, 1000);
      });
    });

    describe('6/6ページの状態のとき', () => {
      beforeEach(() => {
        component.params = { pageNo: 6, pageCount: 10 };
        fixture.detectChanges();
      });

      it('次へボタンが無効となっているか', () => {
        expect(nextPageEl.disabled).toBeTruthy();
      });
    });
  });

  describe('1ページあたり件数選択について', () => {
    describe('変更したら', () => {
      beforeEach(() => {
        component.params = { pageNo: 1, pageCount: 20 };
        pageCountDebug.triggerEventHandler('ngModelChange', null);
        fixture.detectChanges();
      });

      it('1ページ目に変わり、表示件数情報が変更されるか', () => {
        expect(countEl.innerHTML).toEqual('52件中1件〜20件を表示');
      });

      it('ページ更新処理が呼び出されるか', () => {
        expect(component.fetchList).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('ページ選択について', () => {
    describe('変更したら', () => {
      beforeEach(() => {
        component.params = { pageNo: 5, pageCount: 10 };
        pageNoDebug.triggerEventHandler('ngModelChange', null);
        fixture.detectChanges();
      });

      it('ページが変わり、表示件数情報が変更されるか', () => {
        expect(countEl.innerHTML).toEqual('52件中41件〜50件を表示');
        expect(pageNoEl.value).toEqual('5');
      });

      it('ページ更新処理が呼び出されるか', () => {
        expect(component.fetchList).toHaveBeenCalledTimes(1);
      });
    });
  });
});
