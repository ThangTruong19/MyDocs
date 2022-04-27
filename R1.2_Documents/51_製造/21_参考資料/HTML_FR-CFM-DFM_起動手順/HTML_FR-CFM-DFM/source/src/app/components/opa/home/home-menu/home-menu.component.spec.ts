import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {
  KbaHomeMenuComponent,
  KbaHomeMenuItemComponent,
} from './home-menu.component';
import { DndModule } from 'ngx-dnd';
import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from '../../../../services/api/api.service';
import { HttpClientModule } from '@angular/common/http';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HomeComponent } from '../../../../components/opa/home/home.component';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('KbaHomeMenuComponent', () => {
  let homeComponentFixture: ComponentFixture<HomeComponent>;
  let component: KbaHomeMenuComponent;
  let fixture: ComponentFixture<KbaHomeMenuComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        HomeComponent,
        KbaHomeMenuComponent,
        KbaHomeMenuItemComponent,
      ],
      imports: [
        KbaCommonModule,
        DndModule.forRoot(),
        HttpClientModule,
        RouterTestingModule,
      ],
      providers: [
        ApiService,
        UserSettingService,
        KbaAlertService,
        CommonHeaderService,
      ],
    }).compileComponents();

    homeComponentFixture = TestBed.createComponent(HomeComponent);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KbaHomeMenuComponent);
    component = fixture.componentInstance;

    component['navigationService']['storage'].delete('order');
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should show navigation title', () => {
    de = fixture.debugElement.query(By.css('h4'));
    el = de.nativeElement;
    expect(el.textContent).toContain('システム通知管理');
  });

  it('should show navigation contents', () => {
    de = fixture.debugElement.query(By.css('.KBA-menu-list__item'));
    el = de.nativeElement;
    expect(el.textContent).toContain('システム通知管理 一覧');
  });

  it('should set navigation anchor', () => {
    de = fixture.debugElement.query(By.css('.KBA-menu-list__item a'));
    expect(de.attributes['ng-reflect-router-link']).toContain(
      '/system_notifications'
    );
  });

  it('can change navigation order', () => {
    component['navigationService'].navigationsMenu = component[
      'navigationService'
    ].navigationsMenu.reverse();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      de = fixture.debugElement.query(By.css('h4'));
      el = de.nativeElement;
      expect(el.textContent).toContain('ユーザ画面設定管理');
    });
  });

  it('can change navigation order when sidemenu updated', () => {
    component['navigationService'].navigationsSideMenu = component[
      'navigationService'
    ].navigationsSideMenu.reverse();
    component['navigationService'].saveNavigationOrder(
      component['navigationService'].navigationsSideMenu
    );
    component['navigationService'].refresh();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      de = fixture.debugElement.query(By.css('h4'));
      el = de.nativeElement;
      expect(el.textContent).toContain('ユーザ画面設定管理');
    });
  });
});
