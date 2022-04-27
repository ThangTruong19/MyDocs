import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, Component } from '@angular/core';

import { ContactIndexComponent } from './contact-index.component';
import { KbaSidemenuModule } from '../../../../modules/shared/kba-sidemenu.module';
import { ApiService } from '../../../../services/api/api.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { KbaAccordionModule } from '../../../../modules/shared/kba-accordion.module';
import { KbaStorageService } from '../../../../services/shared/kba-storage.service';
import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';
import { ContactService } from '../../../../services/flm/contact/contact.service';
import { ContactKind } from '../../../../constants/flm/contact-kind';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('ContactIndexComponent', () => {
  let component: ContactIndexComponent;
  let fixture: ComponentFixture<ContactIndexComponent>;
  let el: HTMLElement;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContactIndexComponent],
      imports: [
        KbaSidemenuModule,
        HttpClientModule,
        KbaAccordionModule,
        RouterTestingModule,
        KbaCommonModule,
      ],
      providers: [
        KbaNavigationService,
        ApiService,
        UserSettingService,
        ContactService,
        KbaStorageService,
        KbaAlertService,
        CommonHeaderService,
      ],
    }).compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ContactIndexComponent);
    component = fixture.componentInstance;
    component.params.contact_kind = ContactKind.general;
    fixture.detectChanges();
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display initial value', () => {
    de = fixture.debugElement.query(By.css('.KBA-page-title'));
    el = de.nativeElement;
    expect(el.innerHTML).toEqual('連絡先管理　一覧');
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
