import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { SelectModule } from 'ng-select';

import { KbaSelectedComponent } from './kba-selected.component';

@Component({
  selector: 'app-kba-selected-test',
  template: `
    <app-kba-selected
      class="test-component"
      [kbaName]="name"
      [kbaParams]="params"
      [kbaResource]="element"
    >
    </app-kba-selected>
  `,
})
class KbaSelectedTestComponent {
  name = 'agencyForSet';
  params = { agencyForSet: null };
  items = [
    { value: '-99', name: 'すべて', kbn: 'A' },
    { value: '0', name: '担当DB1', kbn: 'D' },
    { value: '1', name: '担当DB2', kbn: 'D' },
    { value: '2', name: '担当DB3', kbn: 'D' },
    { value: '3', name: '担当DB4', kbn: 'D' },
    { value: '4', name: '担当DB5', kbn: 'D' },
    { value: '5', name: '担当DB6', kbn: 'D' },
  ];
  element = {
    agencyForSet: {
      name: '担当DB',
      values: [
        { value: '0', label: 'Aech' },
        { value: '1', label: 'Art3mis' },
        { value: '2', label: 'Daito' },
        { value: '3', label: 'Parzival' },
        { value: '4', label: 'Shoto' },
      ],
    },
  };
}

describe('KbaSelectedTestComponent', () => {
  let component: KbaSelectedTestComponent;
  let fixture: ComponentFixture<KbaSelectedTestComponent>;
  let ngSelectDebug: DebugElement;
  let labelDebug: DebugElement;
  let ngSelectEl: HTMLElement;
  let labelEl: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KbaSelectedComponent, KbaSelectedTestComponent],
      imports: [FormsModule, SelectModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KbaSelectedTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    ngSelectDebug = fixture.debugElement.query(By.css('ng-select'));
    ngSelectEl = ngSelectDebug.nativeElement;
    labelDebug = fixture.debugElement.query(By.css('label'));
    labelEl = labelDebug.nativeElement;
  });

  describe('共通', () => {
    it('要素が存在しているかどうか', () => {
      expect(labelEl).toBeTruthy();
      expect(ngSelectEl).toBeTruthy();
    });
  });

  describe('ラベルについて', () => {
    it('ラベルが表示されること', () => {
      expect(labelEl.innerHTML).toMatch(/担当DB/);
    });
  });

  describe('選択項目について', () => {
    it('ng-select要素の中のoptionsの中身があるかどうか', () => {
      expect(ngSelectDebug.attributes['ng-reflect-items']).toBeDefined();
    });
  });
});
