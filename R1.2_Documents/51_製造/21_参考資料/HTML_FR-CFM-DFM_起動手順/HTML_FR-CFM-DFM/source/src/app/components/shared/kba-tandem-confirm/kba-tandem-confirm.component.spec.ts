import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KbaTandemConfirmComponent } from './kba-tandem-confirm.component';
import { KbaCommonModule } from '../../../modules/shared/kba-common.module';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('KbaTandemConfirmComponent', () => {
  let component: KbaTandemConfirmComponent;
  let fixture: ComponentFixture<KbaTandemConfirmComponent>;
  let el: HTMLElement;
  let labelDebugs: DebugElement[];
  let valueDebugs: DebugElement[];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [KbaCommonModule],
    }).compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(KbaTandemConfirmComponent);
    component = fixture.componentInstance;
    component.desc = [
      { label: '見出しA', name: 'contentA' },
      { label: '見出しB', name: 'contentB' },
    ];
    component.val = { contentA: '内容A', contentB: '内容B' };
    fixture.detectChanges();
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display th label', () => {
    const result = ['見出しA', '見出しB'];
    labelDebugs = fixture.debugElement.queryAll(
      By.css('.KBA-form-table__label')
    );
    labelDebugs.forEach((d, index) => {
      el = d.nativeElement;
      expect(el.innerHTML).toEqual(result[index]);
    });
  });

  it('should display value', () => {
    const result = ['内容A', '内容B'];
    valueDebugs = fixture.debugElement.queryAll(
      By.css('.KBA-form-table__value > p')
    );

    valueDebugs.forEach((v, index) => {
      el = v.nativeElement;
      expect(el.innerHTML).toEqual(result[index]);
    });
  });
});
