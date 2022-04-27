import { IsNotEmptyPipe } from './is-not-empty.pipe';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { KbaCommonModule } from '../modules/shared/kba-common.module';
import * as _ from 'lodash';

@Component({
  selector: 'app-kba-is-not-empty-test',
  template: `
    <div *ngIf="value | isNotEmpty">
      <p class="test-value">{{ value }}</p>
    </div>
  `,
})
class IsNotEmptyPipeTestComponent {
  value: string;
}

@Component({
  selector: 'app-kba-is-not-empty-test',
  template: `
    <ng-template *ngIf="values | isNotEmpty">
      <div *ngFor="let v of values">
        <p class="test-value">{{ v }}</p>
      </div>
    </ng-template>
  `,
})
class IsNotEmptyArrayPipeTestComponent {
  values: string[];
}

@Component({
  selector: 'app-kba-is-not-empty-test',
  template: `
    <div *ngIf="values | isNotEmpty">
      <p class="test-value">{{ values['key'] }}</p>
    </div>
  `,
})
class IsNotEmptyObjectPipeTestComponent {
  values: Object;
}

describe('IsNotEmptyPipe', () => {
  it('create an instance', () => {
    const pipe = new IsNotEmptyPipe();
    expect(pipe).toBeTruthy();
  });

  describe('キーが文字列の場合', () => {
    let fixture: ComponentFixture<IsNotEmptyPipeTestComponent>;
    let component: IsNotEmptyPipeTestComponent;
    let valueDebug: DebugElement;
    let valueEl: HTMLElement;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [IsNotEmptyPipeTestComponent],
        imports: [KbaCommonModule],
      }).compileComponents();
      fixture = TestBed.createComponent(IsNotEmptyPipeTestComponent);
      component = fixture.componentInstance;
    }));

    it('divタグが生成されること', () => {
      component.value = 'aaa';
      fixture.detectChanges();
      valueDebug = fixture.debugElement.query(By.css('.test-value'));
      valueEl = valueDebug.nativeElement;
      expect(valueEl.innerText).toEqual('aaa');
    });

    describe('divタグが生成されないこと', () => {
      it('空文字の場合', () => {
        component.value = '';
        fixture.detectChanges();
        valueDebug = fixture.debugElement.query(By.css('.test-value'));
        expect(valueDebug).toBeDefined();
      });

      it('nullの場合', () => {
        component.value = null;
        fixture.detectChanges();
        valueDebug = fixture.debugElement.query(By.css('.test-value'));
        expect(valueDebug).toBeDefined();
      });
    });
  });

  describe('キーが配列の場合', () => {
    let fixture: ComponentFixture<IsNotEmptyArrayPipeTestComponent>;
    let component: IsNotEmptyArrayPipeTestComponent;
    let valueDebugs: DebugElement[];
    let valueEl: HTMLElement;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [IsNotEmptyArrayPipeTestComponent],
        imports: [KbaCommonModule],
      }).compileComponents();
      fixture = TestBed.createComponent(IsNotEmptyArrayPipeTestComponent);
      component = fixture.componentInstance;
    }));

    it('divタグが生成されること', () => {
      component.values = ['aaa', 'bbb'];
      fixture.detectChanges();
      valueDebugs = fixture.debugElement.queryAll(By.css('.test-value'));
      const exp = ['aaa', 'bbb'];
      _.each(valueDebugs, (debug, index) => {
        valueEl = debug.nativeElement;
        expect(valueEl.innerText).toEqual(exp[index]);
      });
    });

    it('divタグが生成されないこと', () => {
      component.values = [];
      fixture.detectChanges();
      valueDebugs = fixture.debugElement.queryAll(By.css('.test-value'));
      expect(valueDebugs).toBeDefined();
    });
  });

  describe('キーがオブジェクトの場合', () => {
    let fixture: ComponentFixture<IsNotEmptyObjectPipeTestComponent>;
    let component: IsNotEmptyObjectPipeTestComponent;
    let valueDebug: DebugElement;
    let valueEl: HTMLElement;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [IsNotEmptyObjectPipeTestComponent],
        imports: [KbaCommonModule],
      }).compileComponents();
      fixture = TestBed.createComponent(IsNotEmptyObjectPipeTestComponent);
      component = fixture.componentInstance;
    }));

    it('divタグが生成されること', () => {
      component.values = { key: 'aaa' };
      fixture.detectChanges();
      valueDebug = fixture.debugElement.query(By.css('.test-value'));
      valueEl = valueDebug.nativeElement;
      expect(valueEl.innerText).toEqual('aaa');
    });

    it('divタグが生成されないこと', () => {
      component.values = {};
      fixture.detectChanges();
      valueDebug = fixture.debugElement.query(By.css('.test-value'));
      expect(valueDebug).toBeDefined();
    });
  });
});
