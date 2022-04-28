import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AuthoritySelectModalComponent } from './authority-select-modal.component';
import { CommonModule } from '@angular/common';

describe('KbaAuthoritySelectModalComponent', () => {
  let component: AuthoritySelectModalComponent;
  let fixture: ComponentFixture<AuthoritySelectModalComponent>;
  let el: HTMLElement;
  let labelDebugs: DebugElement[];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule],
    }).compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AuthoritySelectModalComponent);
    component = fixture.componentInstance;
    component.authorities = [
      { name: '権限名A', value: '11' },
      { name: '権限名B', value: '12' },
      { name: '権限名C', value: '13' },
    ];
    component.labels = {
      select_all_or_unlink: '全選択/解除',
    };
    component.selectedAuthorities = ['11', '13'];
    fixture.detectChanges();
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display selected authority item label', () => {
    const result = ['権限名A', '権限名C'];
    labelDebugs = fixture.debugElement.queryAll(
      By.css('.authority > input:checked')
    );
    labelDebugs.forEach((label, i) => {
      el = label.nativeElement.labels[0];
      expect(el.innerText).toEqual(result[i]);
    });
  });
});
