import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {
  KbaSidemenuComponent,
  KbaSideMenuItemComponent,
} from './kba-sidemenu.component';
import { KbaSidemenuModule } from '../../../modules/shared/kba-sidemenu.module';
import { inject } from '@angular/core/testing';
import { KbaNavigationService } from '../../../services/shared/kba-navigation.service';
import { ApiService } from '../../../services/api/api.service';
import { DebugElement, Component } from '@angular/core';
import { By, Title } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { KbaAbstractBaseComponent } from '../../../components/shared/kba-abstract-component/kba-abstract-base-compoenent';
import { KbaCommonModule } from '../../../modules/shared/kba-common.module';
import { KbaAlertService } from '../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../services/shared/common-header.service';
import { UserSettingService } from '../../../services/api/user-setting.service';

@Component({
  selector: 'app-kba-sidemenu-test',
  template: `
    <app-kba-sidemenu></app-kba-sidemenu>
  `,
})
class KbaSidemenuTestComponent extends KbaAbstractBaseComponent {
  firstSideMenu = {
    code: '80000',
    name: 'Dummy SideMenu First',
    options: [],
    functions: [
      {
        code: '80010',
        name: 'Dummy SideMenu First1',
        options: [
          {
            key: 'link',
            value: '/dummy/sidemenu_first_1',
          },
        ],
        functions: [],
      },
      {
        code: '80020',
        name: 'Dummy SideMenu First2',
        options: [
          {
            key: 'link',
            value: '/dummy/sidemenu_first_2',
          },
        ],
        functions: [],
      },
    ],
  };

  lastSideMenu = {
    code: '90000',
    name: 'Dummy SideMenu Last',
    options: [],
    functions: [
      {
        code: '90010',
        name: 'Dummy SideMenu Last1',
        options: [
          {
            key: 'link',
            value: '/dummy/sidemenu_last_1',
          },
        ],
        functions: [],
      },
      {
        code: '90020',
        name: 'Dummy SideMenu Last2',
        options: [
          {
            key: 'link',
            value: '/dummy/sidemenu_last_2',
          },
        ],
        functions: [],
      },
    ],
  };

  constructor(
    nav: KbaNavigationService,
    title: Title,
    private api: ApiService
  ) {
    super(nav, title);

    const screenCodeDummy = '99999';

    this.api.currentScreenCode = screenCodeDummy;
    this.api.callApisForInitialize(screenCodeDummy, 'TEST').then(res => {
      res['functions']['result_data']['functions'][1]['functions'].unshift(
        this.firstSideMenu
      );
      res['functions']['result_data']['functions'][1]['functions'].push(
        this.lastSideMenu
      );
      this.initialize(res);
    });
  }
}

describe('KbaSidemenuComponent', () => {
  let component: KbaSidemenuComponent;
  let fixture: ComponentFixture<KbaSidemenuComponent>;
  let testComponentFixture: ComponentFixture<KbaSidemenuTestComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KbaSidemenuTestComponent],
      imports: [
        KbaSidemenuModule,
        HttpClientModule,
        RouterTestingModule,
        KbaCommonModule,
      ],
      providers: [
        ApiService,
        UserSettingService,
        KbaAlertService,
        CommonHeaderService,
      ],
    }).compileComponents();

    testComponentFixture = TestBed.createComponent(KbaSidemenuTestComponent);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KbaSidemenuComponent);
    component = fixture.componentInstance;
    component['navigationService']['storage'].delete('order');
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should show navigation title', () => {
    de = fixture.debugElement.query(By.css('.panel-title'));
    el = de.nativeElement;
    expect(el.textContent).toContain('Dummy SideMenu First');
  });

  it('should show navigation contents', () => {
    de = fixture.debugElement.query(By.css('.KBA-menu-list__item'));
    el = de.nativeElement;
    expect(el.textContent).toContain('Dummy SideMenu First1');
  });

  it('should set navigation anchor', () => {
    de = fixture.debugElement.query(By.css('.KBA-menu-list__item a'));
    expect(de.attributes['ng-reflect-router-link']).toContain(
      '/dummy/sidemenu_first_1'
    );
  });

  it('can change navigation order', () => {
    component['navigationService'].navigationsSideMenu = component[
      'navigationService'
    ].navigationsSideMenu.reverse();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      de = fixture.debugElement.query(By.css('.panel-title'));
      el = de.nativeElement;
      expect(el.textContent).toContain('Dummy SideMenu Last1');
    });
  });
});
