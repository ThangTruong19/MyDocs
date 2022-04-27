import { AtPipe } from './at.pipe';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { KbaCommonModule } from '../modules/shared/kba-common.module';
import * as _ from 'lodash';

@Component({
  selector: 'app-kba-at-test',
  template: `
    <div class="test-value">{{ testObj | at: key }}</div>
  `,
})
class AtPipeTestComponent {
  testObj: Object;
  key: string;
}

@Component({
  selector: 'app-kba-at-test',
  template: `
    <div *ngFor="let value of testObj | at: key">
      <p class="test-value">{{ value }}</p>
    </div>
  `,
})
class AtPipeArrayTestComponent {
  testObj: Object;
  key: string[];
}

describe('AtPipe', () => {
  it('create an instance', () => {
    const pipe = new AtPipe();
    expect(pipe).toBeTruthy();
  });

  describe('キーが文字列の場合', () => {
    let fixture: ComponentFixture<AtPipeTestComponent>;
    let component: AtPipeTestComponent;
    let valueDebug: DebugElement;
    let valueEl: HTMLElement;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [AtPipeTestComponent],
        imports: [KbaCommonModule],
      }).compileComponents();
    }));

    it('ネストしたオブジェクトの値を取得できること', () => {
      fixture = TestBed.createComponent(AtPipeTestComponent);
      component = fixture.componentInstance;
      component.testObj = { a: { b: 'aaa' } };
      component.key = 'a.b';
      fixture.detectChanges();
      valueDebug = fixture.debugElement.query(By.css('.test-value'));
      valueEl = valueDebug.nativeElement;
      expect(valueEl.innerText).toEqual('aaa');
    });
  });

  describe('キーが配列の場合', () => {
    let fixture: ComponentFixture<AtPipeArrayTestComponent>;
    let component: AtPipeArrayTestComponent;
    let valueDebugs: DebugElement[];
    let valueEl: HTMLElement;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [AtPipeArrayTestComponent],
        imports: [KbaCommonModule],
      }).compileComponents();
    }));

    it('ネストしたオブジェクトの値を配列で取得できること', () => {
      fixture = TestBed.createComponent(AtPipeArrayTestComponent);
      component = fixture.componentInstance;
      component.testObj = { a: { b: 'bbb', c: 'ccc', d: 'ddd' } };
      component.key = ['a.b', 'a.c'];
      fixture.detectChanges();
      valueDebugs = fixture.debugElement.queryAll(By.css('.test-value'));
      const exp = ['bbb', 'ccc'];
      _.each(valueDebugs, (debug, index) => {
        valueEl = debug.nativeElement;
        expect(valueEl.innerText).toEqual(exp[index]);
      });
    });
  });
});
