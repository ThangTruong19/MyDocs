import {
  async,
  ComponentFixture,
  TestBed,
  fakeAsync,
} from '@angular/core/testing';

import { KbaChildTextComponent } from './kba-child-text.component';
import { FormsModule, FormGroup, FormControl } from '@angular/forms';
import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';
import { Component, OnInit, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

@Component({
  selector: 'app-test',
  template: `
    <div id="root">
      <input type="text" autocomplete="off" id="parent" />
    </div>
    <app-kba-child-text
      [parent]="parentEl"
      [params]="params"
      [formGroup]="formGroup"
      [name]="'test'"
      [labels]="labels"
      [modelPath]="'value'"
      [labelPath]="'key'"
      [root]="rootEl"
    ></app-kba-child-text>
  `,
})
class TestComponent implements OnInit {
  parentEl;
  rootEl;
  params = [
    {
      key: 'test1',
      value: '',
    },
    {
      key: 'test2',
      value: '',
    },
  ];
  formGroup = new FormGroup({
    test1: new FormControl(),
    test2: new FormControl(),
  });
  labels = {
    test1: 'test1',
    test2: 'test2',
  };

  ngOnInit() {
    this.parentEl = document.getElementById('parent');
    this.rootEl = document.getElementById('root');
  }
}

describe('KbaChildTextComponent', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, KbaCommonModule],
      declarations: [TestComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    const _fixture = TestBed.createComponent(KbaChildTextComponent);
    const _component = _fixture.componentInstance;
    _component.formGroup = new FormGroup({});
    expect(_component).toBeTruthy();
  });

  it('should display input elements', fakeAsync(() => {
    fixture.whenRenderingDone().then(() => {
      component.params
        .map(p => p.key)
        .forEach(key => {
          de = fixture.debugElement.query(
            By.css(`#KBA-child-text-test-${key}`)
          );
          el = de.nativeElement;
          expect(el).toBeTruthy();
        });
    });
  }));

  it('should display labels', fakeAsync(() => {
    fixture.whenRenderingDone().then(() => {
      component.params
        .map(p => p.key)
        .forEach(key => {
          de = fixture.debugElement.query(
            By.css(`[for=KBA-child-text-test-${key}]`)
          );
          el = de.nativeElement;
          expect(el.innerHTML).toContain(key);
        });
    });
  }));

  it('should bind params', fakeAsync(() => {
    fixture.whenRenderingDone().then(() => {
      de = fixture.debugElement.query(By.css('#KBA-child-text-test-test1'));
      el = de.nativeElement;
      (el as HTMLInputElement).value = 'test';
      fixture.detectChanges();
      setTimeout(() => {
        expect(component.params[0].value).toBe('test');
      });
    });
  }));
});
