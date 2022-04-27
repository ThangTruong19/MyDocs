import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { KbaTextComponent } from './kba-text.component';

@Component({
  selector: 'app-kba-text-test',
  template: `
    <app-kba-text
      [kbaName]="'phoneNumber'"
      [kbaParams]="params"
      [kbaResource]="element"
    >
    </app-kba-text>
  `,
})
class KbaTextTestComponent {
  params = { phoneNumber: '' };
  element = {
    phoneNumber: { name: '電話番号', values: [] },
  };
}

describe('KbaTextComponent', () => {
  let component: KbaTextTestComponent;
  let fixture: ComponentFixture<KbaTextTestComponent>;
  let inputDebug: DebugElement;
  let labelDebug: DebugElement;
  let inputEl: HTMLInputElement;
  let labelEl: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KbaTextTestComponent, KbaTextComponent],
      imports: [FormsModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KbaTextTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    inputDebug = fixture.debugElement.query(By.css('input'));
    labelDebug = fixture.debugElement.query(By.css('label'));
    inputEl = inputDebug.nativeElement;
    labelEl = labelDebug.nativeElement;
  });

  it('初期値が正しくセットされているか', async(() => {
    fixture.whenStable().then(() => {
      expect(labelEl.innerHTML).toEqual('電話番号');
      expect(inputEl.id).toEqual('KBA-text-phoneNumber');
    });
  }));

  describe('input要素の中身を変更したとき', () => {
    beforeEach(() => {
      component.params = { phoneNumber: 'xxx-xxxx' };
      fixture.detectChanges();
    });

    it('paramsが変更した値になっているか', async(() => {
      fixture.whenStable().then(() => {
        expect(inputEl.value).toEqual('xxx-xxxx');
      });
    }));
  });
});
