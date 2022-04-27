import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, Component } from '@angular/core';
import { By } from '@angular/platform-browser';

import {
  KbaAccordionComponent,
  KbaAccordionHeaderComponent,
} from './kba-accordion.component';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { fakeAsync, tick } from '@angular/core/testing';

@Component({
  selector: 'app-kba-accordion-test',
  template: `
    <app-kba-accordion [collapsed]="collapsed" [useCustomHeader]="true">
      <h1 data-kba-accordion-header>
        Test Header
      </h1>
      <p data-kba-accordion-body>
        Test Body
      </p>
    </app-kba-accordion>
  `,
})
class KbaAccordionTestComponent {
  collapsed = true;
}

describe('KbaAccordionComponent', () => {
  let component: KbaAccordionComponent;
  let fixture: ComponentFixture<KbaAccordionComponent>;
  let debugElement: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        KbaAccordionComponent,
        KbaAccordionHeaderComponent,
        NgbCollapse,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KbaAccordionComponent);
    component = fixture.componentInstance;
    component.labels = {
      open: '開く',
      close: '閉じる',
    };
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display accordion title', () => {
    debugElement = fixture.debugElement.query(By.css('.KBA-accordion-header'));
    el = debugElement.nativeElement;

    component.title = 'Test Title';
    fixture.detectChanges();
    expect(el.textContent).toContain('Test Title');
  });

  it('should fire onChangeState event', async(() => {
    debugElement = fixture.debugElement.query(By.css('.KBA-accordion-header'));
    spyOn(component.onChangeState, 'emit');
    component.toggleAccordion().then(() => {
      expect(component.onChangeState.emit).toHaveBeenCalled();
    });
  }));
});

describe('KbaAccordionTestComponent', () => {
  let component: KbaAccordionTestComponent;
  let fixture: ComponentFixture<KbaAccordionTestComponent>;
  let debugElement: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        KbaAccordionComponent,
        KbaAccordionHeaderComponent,
        NgbCollapse,
        KbaAccordionTestComponent,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KbaAccordionTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should transclude custom accordion header', () => {
    debugElement = fixture.debugElement.query(
      By.css('.KBA-accordion-header-container')
    );
    el = debugElement.nativeElement;
    expect(el.textContent).toContain('Test Header');
  });

  it('should transclude accordion body', () => {
    debugElement = fixture.debugElement.query(By.css('.KBA-panel-body'));
    el = debugElement.nativeElement;
    expect(el.textContent).toContain('Test Body');
  });

  it('should calcurate contents height', () => {
    debugElement = fixture.debugElement.query(By.css('.KBA-panel-body'));
    el = debugElement.nativeElement;

    component.collapsed = false;

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(el.clientHeight).toBeGreaterThan(0);
    });
  });
});
