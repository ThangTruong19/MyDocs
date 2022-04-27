import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KbaAuthoritySelectModalComponent } from './kba-authority-select-modal.component';
import { KbaCommonModule } from '../../../modules/shared/kba-common.module';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('KbaAuthoritySelectModalComponent', () => {
  let component: KbaAuthoritySelectModalComponent;
  let fixture: ComponentFixture<KbaAuthoritySelectModalComponent>;
  let el: HTMLElement;
  let labelDebugs: DebugElement[];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [KbaCommonModule],
    }).compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(KbaAuthoritySelectModalComponent);
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
