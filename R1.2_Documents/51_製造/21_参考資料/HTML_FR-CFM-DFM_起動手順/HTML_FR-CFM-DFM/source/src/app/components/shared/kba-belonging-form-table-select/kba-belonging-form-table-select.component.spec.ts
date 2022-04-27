import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { SelectModule } from 'ng-select';

import { KbaCommonModule } from '../../../modules/shared/kba-common.module';
import { KbaBelongingFormTableSelectComponent } from './kba-belonging-form-table-select.component';

@Component({
  selector: 'app-kba-belonging-form-table-select-test',
  template: `
    <tr
      app-kba-belonging-form-table-select
      class="test-component"
      [kbaName]="'agencyForSet'"
      [kbaParams]="params"
      [kbaResource]="resource"
      [colspan]="3"
      [required]="required"
      [display]="display"
      [isBelonging]="isBelonging"
      [belongingName]="selectedBelongingName"
      [belongingNameColor]="selectedBelongingNameClass"
    ></tr>
  `,
})
class KbaFormTableSelectTestComponent {
  name = 'agencyForSet';
  params = { agencyForSet: null, agencyForSetDisplay: 'DB-A' };
  resource = {
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
  required = false;
  isBelonging = false;
  selectedBelongingName = 'selectedBelongingName';
  selectedBelongingNameClass = 'selectedBelongingNameClass';
}

describe('KbaFormTableSelectTestComponent', () => {
  let component: KbaFormTableSelectTestComponent;
  let fixture: ComponentFixture<KbaFormTableSelectTestComponent>;
  let labelDebug: DebugElement;
  let ngSelectDebug: DebugElement;
  let belongingDebug: DebugElement;
  let labelEl: HTMLElement;
  let ngSelectEl: HTMLElement;
  let belongingEl: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        KbaFormTableSelectTestComponent,
        KbaBelongingFormTableSelectComponent,
      ],
      imports: [FormsModule, SelectModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KbaFormTableSelectTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    labelDebug = fixture.debugElement.query(By.css('.KBA-form-table__label'));
    labelEl = labelDebug.nativeElement;
    ngSelectDebug = fixture.debugElement.query(By.css('ng-select'));
    ngSelectEl = ngSelectDebug.nativeElement;
    belongingDebug = fixture.debugElement.query(By.css('.belonging-name'));
  });

  describe('ラベルについて', () => {
    it('ラベルが表示されること', () => {
      expect(labelEl.innerHTML).toMatch(/担当DB/);
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

  describe('選択項目について', () => {
    it('ng-select要素の中のoptionsの中身があるかどうか', () => {
      expect(ngSelectDebug.attributes['ng-reflect-items']).toBeDefined();
    });
  });

  describe('所属セレクトボックスでない場合', () => {
    it('所属用のspan要素が表示されないこと', () => {
      expect(belongingDebug).toBeFalsy();
    });
  });

  describe('所属セレクトボックスの場合', () => {
    beforeEach(() => {
      component.isBelonging = true;
      fixture.detectChanges();
      belongingDebug = fixture.debugElement.query(By.css('.belonging-name'));
      belongingEl = belongingDebug.nativeElement;
    });

    it('所属用のspan要素が表示されていること', () => {
      expect(belongingEl.classList).toContain('belonging-name');
    });

    it('所属名を表すclassが付与されていること', () => {
      expect(belongingEl.classList).toContain(
        component.selectedBelongingNameClass
      );
    });

    it('所属名がspan要素の値として設定されていること', () => {
      expect(belongingEl.innerHTML).toMatch(component.selectedBelongingName);
    });
  });
});
