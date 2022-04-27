import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KbaGroupSelectModalComponent } from './kba-group-select-modal.component';
import { KbaCommonModule } from '../../../modules/shared/kba-common.module';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('KbaGroupSelectModalComponent', () => {
  let component: KbaGroupSelectModalComponent;
  let fixture: ComponentFixture<KbaGroupSelectModalComponent>;
  let el: HTMLElement;
  let labelDebugs: DebugElement[];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [KbaCommonModule],
    }).compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(KbaGroupSelectModalComponent);
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
    component.selectedGroup = '2';
    component.selectedGroupItems = ['11', '13'];
    fixture.detectChanges();
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display group kind label', () => {
    const result = ['グループA', 'グループB'];
    labelDebugs = fixture.debugElement.queryAll(By.css('.group > label'));
    labelDebugs.forEach((label, i) => {
      el = label.nativeElement;
      expect(el.innerText).toEqual(result[i]);
    });
  });

  it('should display selected group item label', () => {
    const result = ['グループ項目A', 'グループ項目C'];
    labelDebugs = fixture.debugElement.queryAll(
      By.css('.group-item > input:checked')
    );
    labelDebugs.forEach((label, i) => {
      el = label.nativeElement.labels[0];
      expect(el.innerText).toEqual(result[i]);
    });
  });
});
