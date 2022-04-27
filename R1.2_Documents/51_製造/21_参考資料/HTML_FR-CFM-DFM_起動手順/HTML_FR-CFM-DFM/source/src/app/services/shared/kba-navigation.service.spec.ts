import * as _ from 'lodash';
import {
  TestBed,
  inject,
  async,
  ComponentFixture,
} from '@angular/core/testing';
import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { Title } from '@angular/platform-browser';

import { KbaCommonModule } from '../../modules/shared/kba-common.module';

import { KbaAbstractBaseComponent } from '../../components/shared/kba-abstract-component/kba-abstract-base-compoenent';

import { KbaNavigationService } from './kba-navigation.service';
import { ResourceService } from '../api/resource.service';
import { KbaStorageService } from '../shared/kba-storage.service';
import { ApiService } from '../api/api.service';
import { UserSettingService } from '../api/user-setting.service';
import { KbaAlertService } from '../../services/shared/kba-alert.service';
import { CommonHeaderService } from './common-header.service';

@Component({
  template: '',
})
class KbaNavigationTestComponent extends KbaAbstractBaseComponent {
  dummyHomeMenu = [
    {
      code: '10000',
      name: 'Dummy Navi 1',
      options: [],
      functions: [],
    },
    {
      code: '10100',
      name: 'Dummy Navi 2',
      options: [],
      functions: [],
    },
    {
      code: '10200',
      name: 'Dummy Navi 3',
      options: [],
      functions: [],
    },
  ];

  constructor(
    nav: KbaNavigationService,
    title: Title,
    private api: ApiService
  ) {
    super(nav, title);

    const screenCodeDummy = '99999';

    this.api.currentScreenCode = screenCodeDummy;
    this.api.callApisForInitialize(screenCodeDummy, 'TEST').then(res => {
      res['functions']['result_data']['functions'][0][
        'functions'
      ] = this.dummyHomeMenu;
      this.initialize(res);
    });
  }
}

describe('NavigationService', () => {
  let service: KbaNavigationService;
  let fixture: ComponentFixture<KbaNavigationTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KbaNavigationTestComponent],
      imports: [HttpClientModule, KbaCommonModule, RouterTestingModule],
      providers: [
        KbaAlertService,
        CommonHeaderService,
        ApiService,
        UserSettingService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KbaNavigationTestComponent);
    service = fixture.componentInstance['navigationService'];
    service['storage'].delete('order');
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create navigations', () => {
    expect(service.navigationsMenu).toBeTruthy();
  });

  it('should create navigations order', () => {
    service.saveNavigationOrder();
    const order: string[] = service['_loadNavigationOrder']();
    const expected = ['10000', '10100', '10200'];
    const test = (() => _.isEqual(order, expected))();
    expect(test).toBeTruthy();
  });

  it('should memory navigations order', () => {
    const temp = service.navigationsMenu[0];
    service.navigationsMenu[0] = service.navigationsMenu[1];
    service.navigationsMenu[1] = temp;
    service.saveNavigationOrder();
    const order: string[] = service['_loadNavigationOrder']();
    const expected = ['10100', '10000', '10200'];
    const test = (() => _.isEqual(order, expected))();
    expect(test).toBeTruthy();
  });
});
