import { OrderByPipe } from './order-by.pipe';
import { Component, DebugElement } from '@angular/core';
import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { KbaCommonModule } from '../modules/shared/kba-common.module';

@Component({
  selector: 'app-kba-order-by-test',
  template: `
    <div *ngFor="let item of items | orderBy: 'id':'desc'">
      {{ item.num }}
    </div>
  `,
})
class OrderByPipeTestComponent {
  items = [
    {
      id: 2,
      num: 2,
    },
    {
      id: 1,
      num: 5,
    },
    {
      id: 3,
      num: 0,
    },
  ];
}

describe('OrderByPipe', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OrderByPipeTestComponent],
      imports: [KbaCommonModule],
    }).compileComponents();
  }));

  it('create an instance', () => {
    const pipe = new OrderByPipe();
    expect(pipe).toBeTruthy();
  });

  it('should order', () => {
    const fixture = TestBed.createComponent(OrderByPipeTestComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    let el = fixture.debugElement.nativeElement;
    const els = el.querySelectorAll('div');
    const exp = ['0', '2', '5'];

    for (let i = 0; i < els.length; i++) {
      el = els[i];
      expect(el.textContent).toContain(exp[i]);
    }
  });
});
