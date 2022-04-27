import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';

import { KbaTableComponent } from './kba-table.component';
import {
  KbaAccordionComponent,
  KbaAccordionHeaderComponent,
} from '../kba-accordion/kba-accordion.component';

import { KbaScrollLoadDirective } from '../../../directives/kba-scroll-load/kba-scroll-load.directive';
import { KbaChangeTableHeightDirective } from '../../../directives/kba-change-table-height/kba-change-table-height.directive';
import { KbaTableCheckboxDirective } from '../../../directives/kba-table-checkbox/kba-table-checkbox.directive';
import { KbaSortingLabelDirective } from '../../../directives/kba-sorting-label/kba-sorting-label.directive';

@Component({
  selector: 'app-kba-table-test',
})
class KbaTableTestComponent {
  private lists: any = {
    visibleList: [
      { UserId: 1, UserName: 'user1' },
      { UserId: 2, UserName: 'user2' },
      { UserId: 3, UserName: 'user3' },
    ],
    originList: [
      {
        name: 'UserId',
        label: 'ユーザID',
      },
      {
        name: 'UserName',
        label: 'ユーザ名',
      },
    ],
  };
  private pageParams = {
    pageNo: 1,
    pageCount: 10,
    autoLoadCount: 10,
    lastIndexList: 10,
  };
  private thList: any[] = [
    {
      name: 'UserId',
      shortName: 'UserId',
      label: 'ユーザID',
      displayable: true,
      sortable: true,
    },
    {
      name: 'UserName',
      shortName: 'UserName',
      label: 'ユーザ名',
      displayable: true,
      sortable: true,
    },
  ];
  private labels: any = {
    datail: '詳細',
    delete: '削除',
    edit: '変更',
  };
  private collapsed = true;
  private detailedly = true;
  private updatable = true;
  private deletable = true;
  private selectable = false;
  private selectedList: any[] = [];
  private data: any[] = ['1', '2', '3'];
  private checkAll = false;
  private sortingParams = { sort: 'dummy' };
}

describe('KbaTableTestComponent', () => {
  const defTemplate = `
    <app-kba-table
    [customTableBtnContent]=""
    [customTableRowContent]=""
    [customTableThBtnContent]=""
    [lists]="lists"
    [params]="pageParams"
    [sortingParams]="sortingParams"
    [thList]="thList"
    [labels]="labels"
    [collapsed]="collapsed"
    [detailedly]="detailedly"
    [updatable]="updatable"
    [deletable]="deletable"
    [selectable]="selectable"
    [selectedList]="selectedList"
    [checkAll]="checkAll"
    [checkIdName]="checkIdName"
    (detail)="onClickDetail($event)"
    (delete)="onClickDelete($event)"
    (edit)="onClickEdit($event)">
  `;
  const customTemplate = `
    <app-kba-table
    [customTableBtnContent]="customTableBtnContent"
    [customTableRowContent]="customTableRowContent"
    [customTableThBtnContent]="customTableThBtnContent"
    [lists]="lists"
    [params]="pageParams"
    [sortingParams]="sortingParams"
    [thList]="thList"
    [labels]="labels"
    [collapsed]="collapsed"
    [detailedly]="detailedly"
    [updatable]="updatable"
    [deletable]="deletable"
    [selectable]="selectable"
    [selectedList]="selectedList"
    [checkAll]="checkAll"
    [checkIdName]="checkIdName"
    (detail)="onClickDetail($event)"
    (delete)="onClickDelete($event)"
    (edit)="onClickEdit($event)">
    </app-kba-table>
    <ng-template #customTableThBtnContent>
      <th class="th-custom-btn">カスタムボタン</th>
    </ng-template>
    <ng-template #customTableRowContent>
      <td class="td-custom-data KBA-index-th">外部引き渡しテスト</td>
      <td class="td-custom-data KBA-index-th">外部引き渡しテスト</td>
    </ng-template>
    <ng-template #customTableBtnContent>
      <td *ngIf="detailedly" class="td-custom-button KBA-index-th KBA-table__small kba-sm-link text-center">
        <button>カスタムボタン</button>
      </td>
    </ng-template>
  `;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        KbaTableTestComponent,
        KbaTableComponent,
        KbaAccordionComponent,
        KbaAccordionHeaderComponent,
        NgbCollapse,
        KbaScrollLoadDirective,
        KbaChangeTableHeightDirective,
        KbaTableCheckboxDirective,
        KbaSortingLabelDirective,
      ],
    });
  }));

  describe('カスタム要素を渡していない場合について', () => {
    let defFixture: ComponentFixture<KbaTableTestComponent>;

    beforeEach(async(() => {
      TestBed.overrideComponent(KbaTableTestComponent, {
        set: { template: defTemplate },
      }).compileComponents();
      defFixture = TestBed.createComponent(KbaTableTestComponent);
      defFixture.detectChanges();
    }));

    it('デフォルトのボタンタイトル要素が表示されていること', async(() => {
      defFixture.whenStable().then(() => {
        const debugElement = defFixture.debugElement.query(
          By.css('.KBA-table-thead .fixed')
        );
        const el = debugElement.nativeElement;
        expect(el.classList).toContain('fixed');
      });
    }));

    it('デフォルトのデータ行要素が表示されていること', async(() => {
      defFixture.whenStable().then(() => {
        const debugElement = defFixture.debugElement.query(
          By.css('.KBA-table-tbody .td-UserName')
        );
        const el = debugElement.nativeElement;
        expect(el.classList).toContain('td-UserName');
      });
    }));

    it('デフォルトのボタン要素が表示されていること', async(() => {
      defFixture.whenStable().then(() => {
        const debugElement = defFixture.debugElement.query(
          By.css('.KBA-table-tbody .fixed')
        );
        const el = debugElement.nativeElement;
        expect(el.classList).toContain('fixed');
      });
    }));
  });

  describe('カスタム要素を渡している場合について', () => {
    let customFixture: ComponentFixture<KbaTableTestComponent>;

    beforeEach(async(() => {
      TestBed.overrideComponent(KbaTableTestComponent, {
        set: { template: customTemplate },
      }).compileComponents();
      customFixture = TestBed.createComponent(KbaTableTestComponent);
      customFixture.detectChanges();
    }));

    it('カスタムしたボタンタイトル要素が表示されていること', async(() => {
      customFixture.whenStable().then(() => {
        const debugElement = customFixture.debugElement.query(
          By.css('.KBA-table-thead .th-custom-btn')
        );
        const el = debugElement.nativeElement;
        expect(el.classList).toContain('th-custom-btn');
      });
    }));

    it('カスタムしたデータ行要素が表示されていること', async(() => {
      customFixture.whenStable().then(() => {
        const debugElement = customFixture.debugElement.query(
          By.css('.KBA-table-tbody .td-custom-data')
        );
        const el = debugElement.nativeElement;
        expect(el.classList).toContain('td-custom-data');
      });
    }));

    it('カスタムしたボタン要素が表示されていること', () => {
      customFixture.whenStable().then(() => {
        const debugElement = customFixture.debugElement.query(
          By.css('.KBA-table-tbody .td-custom-button')
        );
        const el = debugElement.nativeElement;
        expect(el.classList).toContain('td-custom-button');
      });
    });
  });
});
