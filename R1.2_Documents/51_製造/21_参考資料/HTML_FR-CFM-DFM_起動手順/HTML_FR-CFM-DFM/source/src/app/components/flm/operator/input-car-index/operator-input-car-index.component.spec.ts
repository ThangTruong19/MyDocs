import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';
import { KbaSidemenuModule } from '../../../../modules/shared/kba-sidemenu.module';

import { OperatorInputCarIndexComponent } from './operator-input-car-index.component';
import { OperatorInputCarDetailComponent } from './operator-input-car-detail.component';
import { OperatorInputCarBatchDeleteComponent } from './operator-input-car-batch-delete.component';
import { OperatorInputCarBatchSettingComponent } from './operator-input-car-batch-setting.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { OperatorService } from '../../../../services/flm/operator/operator.service';
import { ApiService } from '../../../../services/api/api.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('OperatorInputCarIndexComponent', () => {
  let component: OperatorInputCarIndexComponent;
  let fixture: ComponentFixture<OperatorInputCarIndexComponent>;
  let el: HTMLElement;
  let de: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        OperatorInputCarIndexComponent,
        OperatorInputCarDetailComponent,
        OperatorInputCarBatchDeleteComponent,
        OperatorInputCarBatchSettingComponent,
      ],
      imports: [
        KbaSidemenuModule,
        HttpClientModule,
        RouterTestingModule,
        KbaCommonModule,
      ],
      providers: [
        KbaNavigationService,
        ApiService,
        UserSettingService,
        KbaAlertService,
        OperatorService,
        CommonHeaderService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatorInputCarIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display initial value', () => {
    fixture.whenStable().then(() => {
      de = fixture.debugElement.query(By.css('.KBA-page-title'));
      el = de.nativeElement;
      expect(el.innerHTML).toEqual('オペレータ識別管理　対象車両一覧(ID入力)');
    });
  });

  describe('ページ更新処理', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.sortingParams = { sort: 'dummy' };
      spyOn(component, 'fetchList');
    });

    describe('ページ移動時', () => {
      beforeEach(() => {
        fixture.whenStable().then(() => {
          fixture.debugElement
            .query(By.css('.KBA-table-pagination-move__next'))
            .nativeElement.click();
        });
      });

      it('ボタン押下時にパラメータ「ソートキー」付きでページ更新処理が呼び出されること', () => {
        fixture.whenStable().then(() => {
          expect(component.fetchList).toHaveBeenCalledWith('dummy');
        });
      });
    });

    describe('検索時', () => {
      beforeEach(() => {
        fixture.whenStable().then(() => {
          fixture.debugElement.query(By.css('.search')).nativeElement.click();
        });
      });

      it('ボタン押下時にパラメータ「ソートキー」付きでページ更新処理が呼び出されること', () => {
        fixture.whenStable().then(() => {
          expect(component.fetchList).toHaveBeenCalledWith('dummy');
        });
      });
    });
  });
});
