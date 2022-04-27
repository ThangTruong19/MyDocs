import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KbaAuthoritySelectComponent } from './kba-authority-select.component';
import { KbaCommonModule } from '../../../modules/shared/kba-common.module';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('KbaAuthoritySelectComponent', () => {
  let component: KbaAuthoritySelectComponent;
  let fixture: ComponentFixture<KbaAuthoritySelectComponent>;
  let el: HTMLElement;
  let labelDebugs: DebugElement[];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [KbaCommonModule],
    }).compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(KbaAuthoritySelectComponent);
    component = fixture.componentInstance;
    component.authorities = [
      { name: '権限A', value: '11' },
      { name: '権限B', value: '12' },
      { name: '権限C', value: '13' },
    ];
    component.labels = {
      select: '選択',
    };
    component.selectedAuthorities = ['11', '13'];
    fixture.detectChanges();
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display select btn label', () => {
    el = fixture.debugElement.query(By.css('.btn.btn-primary.select'))
      .nativeElement;
    expect(el.innerText).toContain('選択');
  });

  it('should display selected group items label', () => {
    const result = ['権限A', '権限C'];
    labelDebugs = fixture.debugElement.queryAll(
      By.css('.KBA-list-select-tag > span')
    );
    labelDebugs.forEach((label, i) => {
      el = label.nativeElement;
      expect(el.innerText).toEqual(result[i]);
    });
  });
});
