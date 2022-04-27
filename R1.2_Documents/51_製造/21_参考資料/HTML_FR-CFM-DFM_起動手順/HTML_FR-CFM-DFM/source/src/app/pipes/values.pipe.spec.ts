import { ValuesPipe } from './values.pipe';
import { Component, DebugElement } from '@angular/core';
import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { KbaCommonModule } from '../modules/shared/kba-common.module';

@Component({
  selector: 'app-kba-values-test',
  template: `
    <div *ngFor="let v of object | values">
      {{ v }}
    </div>
  `,
})
class ValuesPipeTestComponent {
  object = { key1: 'value1', key2: 'value2', key3: 'value3' };
}

describe('ValuesPipe', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ValuesPipeTestComponent],
      imports: [KbaCommonModule],
    }).compileComponents();
  }));

  it('create an instance', () => {
    const pipe = new ValuesPipe();
    expect(pipe).toBeTruthy();
  });

  it('should order', () => {
    const fixture = TestBed.createComponent(ValuesPipeTestComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    let el = fixture.debugElement.nativeElement;
    const els = el.querySelectorAll('div');
    const exp = ['value1', 'value2', 'value3'];

    for (let i = 0; i < els.length; i++) {
      el = els[i];
      expect(el.textContent).toContain(exp[i]);
    }
  });
});
