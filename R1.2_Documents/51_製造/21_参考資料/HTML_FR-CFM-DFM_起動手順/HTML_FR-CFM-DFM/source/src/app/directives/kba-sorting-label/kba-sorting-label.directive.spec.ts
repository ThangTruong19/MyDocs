import { KbaSortingLabelDirective } from './kba-sorting-label.directive';
import { Component, ElementRef, DebugElement } from '@angular/core';
import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <ul>
      <li
        appKbaSortingLabel
        class="th-test1"
        [(sortingParams)]="params"
        [labelName]="'test1'"
        [sortableThList]="sortableThList"
      ></li>
      <li
        appKbaSortingLabel
        class="th-test2"
        [(sortingParams)]="params"
        [labelName]="'test2'"
        [sortableThList]="sortableThList"
      ></li>
      <li
        appKbaSortingLabel
        class="th-test3"
        [(sortingParams)]="params"
        [labelName]="'test3'"
        [sortableThList]="sortableThList"
      ></li>
    </ul>
  `,
})
class KbaSortingLabelTestComponent {
  params = {
    sort: 'test1',
  };

  sortableThList = ['test1', 'test2'];
}

describe('KbaSortingLabelDirective', () => {
  let component: KbaSortingLabelTestComponent;
  let fixture: ComponentFixture<KbaSortingLabelTestComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KbaSortingLabelDirective, KbaSortingLabelTestComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KbaSortingLabelTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display sort mark', () => {
    de = fixture.debugElement.query(By.css('.th-test1'));
    el = de.nativeElement;

    expect(el.className).toContain('KBA-sortable-label-asc');
  });

  it('should change order', () => {
    de = fixture.debugElement.query(By.css('.th-test1'));
    el = de.nativeElement;
    el.click();
    fixture.detectChanges();

    expect(component.params.sort).toBe('-test1');
  });

  it('should order by another column', () => {
    de = fixture.debugElement.query(By.css('.th-test2'));
    el = de.nativeElement;
    el.click();
    fixture.detectChanges();

    expect(component.params.sort).toBe('test2');
  });

  it('should not change order', () => {
    de = fixture.debugElement.query(By.css('.th-test3'));
    el = de.nativeElement;
    el.click();
    fixture.detectChanges();

    expect(component.params.sort).toBe('test1');
  });
});
