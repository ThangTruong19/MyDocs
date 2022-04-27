import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KbaListConfirmComponent } from './kba-list-confirm.component';
import { KbaCommonModule } from '../../../modules/shared/kba-common.module';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('KbaTandemConfirmComponent', () => {
  let component: KbaListConfirmComponent;
  let fixture: ComponentFixture<KbaListConfirmComponent>;
  let el: HTMLElement;
  let labelDebugs: DebugElement[];
  let rowDebugs: DebugElement[];
  let valueDebugs: DebugElement[];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [KbaCommonModule],
    }).compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(KbaListConfirmComponent);
    component = fixture.componentInstance;
    component.desc = ['見出しA', '見出しB'];
    component.val = [{ a: '内容A', b: '内容B' }, { a: '内容C', b: '内容D' }];
    fixture.detectChanges();
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display th label', () => {
    const result = ['見出しA', '見出しB'];
    labelDebugs = fixture.debugElement.queryAll(
      By.css('.KBA-form-table__head')
    );
    labelDebugs.forEach((d, index) => {
      el = d.nativeElement;
      expect(el.innerHTML).toContain(result[index]);
    });
  });

  it('should display value', () => {
    const result = [['内容A', '内容B'], ['内容C', '内容D']];
    rowDebugs = fixture.debugElement.queryAll(
      By.css('.KBA-form-table-tbody > tr')
    );
    rowDebugs.forEach((row, i) => {
      row.queryAll(By.css('.KBA-form-table__value > p')).forEach((v, j) => {
        el = v.nativeElement;
        expect(el.innerHTML).toEqual(result[i][j]);
      });
    });
  });
});
