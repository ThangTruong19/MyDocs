import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KbaGroupSelectComponent } from './kba-group-select.component';
import { KbaCommonModule } from '../../../modules/shared/kba-common.module';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('KbaGroupSelectComponent', () => {
  let component: KbaGroupSelectComponent;
  let fixture: ComponentFixture<KbaGroupSelectComponent>;
  let el: HTMLElement;
  let labelDebugs: DebugElement[];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [KbaCommonModule],
    }).compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(KbaGroupSelectComponent);
    component = fixture.componentInstance;
    component.groups = [
      { name: 'グループA', value: '1' },
      { name: 'グループB', value: '2' },
    ];
    component.groupItems = [
      { name: 'グループ項目A', value: '11' },
      { name: 'グループ項目B', value: '12' },
      { name: 'グループ項目C', value: '13' },
    ];
    component.labels = {
      select: '選択',
    };
    component.selectedItemLabelHidden = false;
    component.selectedGroup = '2';
    component.selectedGroupItems = ['11', '13'];
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

  it('should display selected group label', () => {
    el = fixture.debugElement.query(By.css('.selected-group-label'))
      .nativeElement;
    expect(el.innerText).toContain('グループB');
  });

  it('should display selected group items label', () => {
    const result = ['グループ項目A', 'グループ項目C'];
    labelDebugs = fixture.debugElement.queryAll(
      By.css('.KBA-list-select-tag > span')
    );
    labelDebugs.forEach((label, i) => {
      el = label.nativeElement;
      expect(el.innerText).toEqual(result[i]);
    });
  });
});
