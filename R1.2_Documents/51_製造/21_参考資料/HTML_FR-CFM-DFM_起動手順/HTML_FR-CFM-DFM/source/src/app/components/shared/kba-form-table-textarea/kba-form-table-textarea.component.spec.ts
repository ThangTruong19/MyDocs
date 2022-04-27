import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';

import { KbaFormTableTextareaComponent } from './kba-form-table-textarea.component';

import { HasErrorPipe } from '../../../pipes/has-error.pipe';

@Component({
  selector: 'app-kba-form-table-text-test',
  template: `
    <form [formGroup]="testForm">
      <tr
        app-kba-form-table-textarea
        [formGroup]="testForm"
        [kbaName]="'name'"
        [kbaParams]="params"
        [kbaResource]="resource"
        [kbaLabel]="label"
        [colspan]="3"
        [required]="required"
        [maxLength]="100"
      ></tr>
    </form>
  `,
})
class KbaFormTableTextareaTestComponent {
  params: any = {
    name: null,
  };
  resource: any = {
    name: { name: '氏名' },
  };
  required = false;
  testForm: FormGroup = new FormGroup({});
}

describe('KbaFormTableTextareaComponent', () => {
  let component: KbaFormTableTextareaTestComponent;
  let fixture: ComponentFixture<KbaFormTableTextareaTestComponent>;
  let inputDebug: DebugElement;
  let labelDebug: DebugElement;
  let inputEl: HTMLElement;
  let labelEl: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        KbaFormTableTextareaTestComponent,
        KbaFormTableTextareaComponent,
        HasErrorPipe,
      ],
      imports: [FormsModule, ReactiveFormsModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KbaFormTableTextareaTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    labelDebug = fixture.debugElement.query(By.css('.KBA-form-table__label'));
    labelEl = labelDebug.nativeElement;
    inputDebug = fixture.debugElement.query(By.css('textarea'));
    inputEl = inputDebug.nativeElement;
  });

  describe('ラベルについて', () => {
    it('ラベルが表示されること', () => {
      expect(labelEl.innerHTML).toMatch(/氏名/);
    });
  });

  describe('必須について', () => {
    beforeEach(() => {
      component.required = true;
      fixture.detectChanges();
    });

    it('必須マークが表示されること', () => {
      expect(labelEl.classList).toContain('KBA-form-table__required');
    });
  });

  describe('必須なしについて', () => {
    beforeEach(() => {
      component.required = false;
      fixture.detectChanges();
    });

    it('必須マークが表示されないこと', () => {
      expect(labelEl.classList).not.toContain('KBA-form-table__required');
    });
  });
});
