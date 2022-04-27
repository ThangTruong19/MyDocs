import { Component, DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { KbaChangeTableHeightDirective } from './kba-change-table-height.directive';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <div
      id="test-change-height"
      appKbaChangeTableHeight
      [collapsed]="collapsed"
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
class KbaChangeTableHeightDirectiveTestComponent {
  private collapsed = false;
}

describe('KbaScrollLoadDirective', () => {
  let component: KbaChangeTableHeightDirectiveTestComponent;
  let fixture: ComponentFixture<KbaChangeTableHeightDirectiveTestComponent>;
  let scrollElDebug: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        KbaChangeTableHeightDirective,
        KbaChangeTableHeightDirectiveTestComponent,
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(
      KbaChangeTableHeightDirectiveTestComponent
    );
  }));

  describe('アコーディオンの開閉によって行われるクラスの付け替えについて', () => {
    describe('アコーディオンが開いている場合', () => {
      it('対象要素に kba-lg-height クラスが付与されていないこと', async(() => {
        component = fixture.componentInstance;
        scrollElDebug = fixture.debugElement.query(
          By.css('#test-change-height')
        );
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(scrollElDebug.classes['kba-lg-height']).toBe(false);
        });
      }));
    });

    describe('アコーディオンが閉じている場合', () => {
      it('対象要素に kba-lg-height クラスが付与されていること', async(() => {
        component = fixture.componentInstance;
        component['collapsed'] = true;
        scrollElDebug = fixture.debugElement.query(
          By.css('#test-change-height')
        );
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(scrollElDebug.classes['kba-lg-height']).toBe(true);
        });
      }));
    });
  });
});
