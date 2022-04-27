import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';

import { OperatorIdKeyIndexComponent } from './id-key-index.component';

import { OperatorService } from '../../../../services/flm/operator/operator.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('OperatorIdKeyIndexComponent', () => {
  let component: OperatorIdKeyIndexComponent;
  let fixture: ComponentFixture<OperatorIdKeyIndexComponent>;
  let el: HTMLElement;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OperatorIdKeyIndexComponent],
      imports: [HttpClientModule, RouterTestingModule, KbaCommonModule],
      providers: [
        ApiService,
        UserSettingService,
        OperatorService,
        KbaAlertService,
        KbaModalService,
        CommonHeaderService,
      ],
    }).compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(OperatorIdKeyIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display initial value', () => {
    de = fixture.debugElement.query(By.css('.KBA-page-title'));
    el = de.nativeElement;
    expect(el.innerHTML).toEqual('オペレータ識別管理　IDキー番号一覧');
  });

  describe('ページ更新処理', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.sortingParams = { sort: 'dummy' };
      spyOn(component, 'fetchList');
    });

    describe('ページ移動時', () => {
      beforeEach(() => {
        fixture.debugElement
          .query(By.css('.KBA-table-pagination-move__next'))
          .nativeElement.click();
      });

      it('ボタン押下時にパラメータ「ソートキー」付きでページ更新処理が呼び出されること', done => {
        setTimeout(() => {
          expect(component.fetchList).toHaveBeenCalledWith('dummy');
          done();
        }, 1000);
      });
    });

    describe('検索時', () => {
      beforeEach(() => {
        fixture.debugElement.query(By.css('.search')).nativeElement.click();
      });

      it('ボタン押下時にパラメータ「ソートキー」付きでページ更新処理が呼び出されること', () => {
        expect(component.fetchList).toHaveBeenCalledWith('dummy');
      });
    });
  });
});
