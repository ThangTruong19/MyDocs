import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbaGroupSelectCheckboxDirective } from './kba-group-select-checkbox.directive';

@Component({
  template: `
    <div>
      <label>
        <input id="checkAll" type="checkbox" (click)="toggleCheckAll()" />
        全選択/解除
      </label>
    </div>
    <div>
      <input
        (appKbaGroupSelectCheckbox)="onChange($event)"
        [selectedList]="selectedList"
        [(checked)]="checkAll"
        id="check-icon-1"
        value="{{ data[0] }}"
        type="checkbox"
      />
      <label for="check-icon-1"></label>
      <input
        (appKbaGroupSelectCheckbox)="onChange($event)"
        [selectedList]="selectedList"
        [(checked)]="checkAll"
        id="check-icon-2"
        value="{{ data[1] }}"
        type="checkbox"
      />
      <label for="check-icon-1"></label>
      <input
        (appKbaGroupSelectCheckbox)="onChange($event)"
        [selectedList]="selectedList"
        [(checked)]="checkAll"
        id="check-icon-3"
        value="{{ data[2] }}"
        type="checkbox"
      />
      <label for="check-icon-1"></label>
    </div>
  `,
})
class KbaGroupSelectCheckboxDirectiveTestComponent {
  selectedList: any[] = [];
  data: any[] = ['1', '2', '3'];
  checkAll = false;

  toggleCheckAll() {
    this.checkAll = !this.checkAll;
    this.selectedList.splice(0, this.selectedList.length);
    if (this.checkAll) {
      for (let i = 0; i < this.data.length; i++) {
        this.selectedList.push(this.data[i]);
      }
    }
  }
}

describe('KbaGroupSelectCheckboxDirective', () => {
  let component: KbaGroupSelectCheckboxDirectiveTestComponent;
  let fixture: ComponentFixture<KbaGroupSelectCheckboxDirectiveTestComponent>;
  let checkAllEl: any;
  let checkboxEl1: any;
  let checkboxEl2: any;
  let checkboxEl3: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        KbaGroupSelectCheckboxDirectiveTestComponent,
        KbaGroupSelectCheckboxDirective,
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(
      KbaGroupSelectCheckboxDirectiveTestComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  describe('チェックボックスについて', () => {
    beforeEach(() => {
      checkAllEl = fixture.debugElement.query(By.css('#checkAll'))
        .nativeElement;
      checkboxEl1 = fixture.debugElement.query(By.css('#check-icon-1'))
        .nativeElement;
      checkboxEl2 = fixture.debugElement.query(By.css('#check-icon-2'))
        .nativeElement;
      checkboxEl3 = fixture.debugElement.query(By.css('#check-icon-3'))
        .nativeElement;
      checkboxEl1.click();
      checkboxEl2.click();
    });

    it('1番目と2番目のチェックボックスのみ ON となっていること', async(() => {
      fixture.whenStable().then(() => {
        expect(checkboxEl1.checked).toBeTruthy();
        expect(checkboxEl2.checked).toBeTruthy();
        expect(checkboxEl3.checked).not.toBeTruthy();
      });
    }));

    it('1番目と3番目のチェックボックスのみ OFF になっていること', async(() => {
      fixture.whenStable().then(() => {
        checkboxEl1.click();
        expect(checkboxEl1.checked).not.toBeTruthy();
        expect(checkboxEl2.checked).toBeTruthy();
        expect(checkboxEl3.checked).not.toBeTruthy();
      });
    }));

    it('2番目の値のみが selectedList に格納されていること', async(() => {
      fixture.whenStable().then(() => {
        checkboxEl1.click();
        const _selectedList = ['2'];
        expect(component['selectedList']).toEqual(_selectedList);
      });
    }));

    describe('全選択/解除について', () => {
      beforeEach(() => {
        checkAllEl.click();
        fixture.detectChanges();
      });

      it('全選択した場合 selectedList に全ての値が格納されていること & 全選択されていること', async(() => {
        fixture.whenStable().then(() => {
          const _selectedList = ['1', '2', '3'];
          expect(component['selectedList']).toEqual(_selectedList);
          expect(checkboxEl1.checked).toBeTruthy();
          expect(checkboxEl2.checked).toBeTruthy();
          expect(checkboxEl3.checked).toBeTruthy();
        });
      }));

      it('全解除した場合 selectedList が空になっていること & 全解除されていること', async(() => {
        fixture.whenStable().then(() => {
          checkAllEl.click();
          fixture.detectChanges();
          const _selectedList = [];
          expect(component['selectedList']).toEqual(_selectedList);
          expect(checkboxEl1.checked).not.toBeTruthy();
          expect(checkboxEl2.checked).not.toBeTruthy();
          expect(checkboxEl3.checked).not.toBeTruthy();
        });
      }));
    });
  });
});
