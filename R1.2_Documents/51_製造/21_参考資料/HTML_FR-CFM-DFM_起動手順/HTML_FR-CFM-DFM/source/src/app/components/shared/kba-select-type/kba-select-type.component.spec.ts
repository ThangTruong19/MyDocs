import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, Component, ViewChild } from '@angular/core';
import { KbaSelectTypeComponent } from './kba-select-type.component';
import { KbaCommonModule } from '../../../modules/shared/kba-common.module';

@Component({
  selector: 'app-kba-select-type-test',
  template: `
    <app-kba-select-type
      class="test-component"
      [labels]="{}"
      [targets]="targets"
    >
    </app-kba-select-type>
  `,
})
class KbaSelectTypeTestComponent {
  @ViewChild(
    KbaSelectTypeComponent,
    /* TODO: add static flag */ {},
    { static: false }
  )
  selecteTypeComponent: KbaSelectTypeComponent;

  targets = {
    name: 'テスト',
    values: [
      { value: '-99', name: 'すべて' },
      { value: '-2', name: 'なし' },
      { value: '0', name: '顧客1' },
      { value: '1', name: '顧客2' },
      { value: '2', name: '顧客3' },
    ],
  };
}

describe('KbaSelectTypeComponent', () => {
  let component: KbaSelectTypeTestComponent;
  let fixture: ComponentFixture<KbaSelectTypeTestComponent>;
  let radioDebugs: DebugElement[];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KbaSelectTypeTestComponent],
      imports: [KbaCommonModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KbaSelectTypeTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('ラジオボタンについて', () => {
    it('初期表示でラジオボタンが3つ表示されること', () => {
      radioDebugs = fixture.debugElement.queryAll(
        By.css('.KBA-input-radio__label')
      );
      expect(radioDebugs.length).toEqual(3);
    });

    it('リソースに「なし」がない場合はラジオボタンが2つ表示されること', () => {
      component.targets = {
        name: 'テスト',
        values: [
          { value: '-99', name: 'すべて' },
          { value: '0', name: '顧客1' },
          { value: '1', name: '顧客2' },
          { value: '2', name: '顧客3' },
        ],
      };
      fixture.detectChanges();
      radioDebugs = fixture.debugElement.queryAll(
        By.css('.KBA-input-radio__label')
      );
      expect(radioDebugs.length).toEqual(2);
    });

    it('リソースに「すべて」がない場合はラジオボタンが2つ表示されること', () => {
      component.targets = {
        name: 'テスト',
        values: [
          { value: '-2', name: 'なし' },
          { value: '0', name: '顧客1' },
          { value: '1', name: '顧客2' },
          { value: '2', name: '顧客3' },
        ],
      };
      fixture.detectChanges();
      radioDebugs = fixture.debugElement.queryAll(
        By.css('.KBA-input-radio__label')
      );
      expect(radioDebugs.length).toEqual(2);
    });

    it('リソースに「なし」と「すべて」がない場合はラジオボタンが1つ表示されること', () => {
      component.targets = {
        name: 'テスト',
        values: [
          { value: '0', name: '顧客1' },
          { value: '1', name: '顧客2' },
          { value: '2', name: '顧客3' },
        ],
      };
      fixture.detectChanges();
      radioDebugs = fixture.debugElement.queryAll(
        By.css('.KBA-input-radio__label')
      );
      expect(radioDebugs.length).toEqual(1);
    });
  });

  describe('paramsについて', () => {
    it('すべてが選択されている場合、paramsは-99となる', () => {
      component.selecteTypeComponent.selectedOption = 'all';
      expect(component.selecteTypeComponent.getSelectedParam()).toEqual([
        '-99',
      ]);
    });

    it('なしが選択されている場合、paramsは-2となる', () => {
      component.selecteTypeComponent.selectedOption = 'non';
      expect(component.selecteTypeComponent.getSelectedParam()).toEqual(['-2']);
    });

    it('リストから選択が選択されている場合、paramsはリストの選択内容となる', () => {
      component.selecteTypeComponent.selectedOption = 'selections';
      component.selecteTypeComponent.selectedListItems = [
        { id: '0', name: '顧客1' },
      ];
      expect(component.selecteTypeComponent.getSelectedParam()).toEqual(['0']);
    });
  });
});
