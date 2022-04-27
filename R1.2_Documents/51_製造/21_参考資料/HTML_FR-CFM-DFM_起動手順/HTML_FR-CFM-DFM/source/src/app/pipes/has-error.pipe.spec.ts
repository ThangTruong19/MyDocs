import * as _ from 'lodash';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { async, TestBed, ComponentFixture } from '@angular/core/testing';

import { KbaCommonModule } from '../modules/shared/kba-common.module';

import { ErrorData } from '../types/error-data';

import { HasErrorPipe } from './has-error.pipe';

@Component({
  selector: 'app-kba-has-error-test',
  template: `
    <div
      id="has-error-test-class"
      [ngClass]="{ error: errorData | hasError: path }"
    ></div>
  `,
})
class HasErrorPipeTestComponent {
  errorData: ErrorData;
  path: string;
}

describe('HasErrorPipe', () => {
  let fixture: ComponentFixture<HasErrorPipeTestComponent>;
  let component: HasErrorPipeTestComponent;
  let valueDebugs: DebugElement[];

  it('create an instance', () => {
    const pipe = new HasErrorPipe();
    expect(pipe).toBeTruthy();
  });

  describe('エラーデータが存在している', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [HasErrorPipeTestComponent],
        imports: [KbaCommonModule],
      }).compileComponents();
      fixture = TestBed.createComponent(HasErrorPipeTestComponent);
      component = fixture.componentInstance;
    }));

    describe('エラーデータのキーにパスが含まれている場合', () => {
      it('エラークラスが加えられること', () => {
        component.errorData = [{ keys: ['a.b'], message: '', code: 'CODE' }];
        component.path = 'a.b';
        fixture.detectChanges();
        valueDebugs = fixture.debugElement.queryAll(By.css('.error'));
        expect(valueDebugs.length).toEqual(1);
      });
    });

    describe('エラーデータのキーにパスが含まれていない場合', () => {
      it('エラークラスが加えられないこと', () => {
        component.errorData = [{ keys: ['a.b'], message: '', code: 'CODE' }];
        component.path = 'a.c';
        fixture.detectChanges();
        valueDebugs = fixture.debugElement.queryAll(By.css('.error'));
        expect(valueDebugs.length).toEqual(0);
      });
    });
  });

  describe('エラーデータが存在していない', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [HasErrorPipeTestComponent],
        imports: [KbaCommonModule],
      }).compileComponents();
      fixture = TestBed.createComponent(HasErrorPipeTestComponent);
      component = fixture.componentInstance;
    }));

    it('エラークラスが加えられないこと', () => {
      component.errorData = null;
      component.path = 'a.c';
      fixture.detectChanges();
      valueDebugs = fixture.debugElement.queryAll(By.css('.error'));
      expect(valueDebugs.length).toEqual(0);
    });
  });
});
