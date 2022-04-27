import * as _ from 'lodash';
import {
  TestBed,
  inject,
  async,
  ComponentFixture,
} from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { KbaCommonModule } from '../../../modules/shared/kba-common.module';

import { KbaAbstractIndexComponent } from './kba-abstract-index-component';

import { CommonHeaderService } from '../../../services/shared/common-header.service';
import { KbaNavigationService } from '../../../services/shared/kba-navigation.service';
import { KbaAlertService } from '../../../services/shared/kba-alert.service';
import { ApiService } from '../../../services/api/api.service';
import { UserSettingService } from '../../../services/api/user-setting.service';

@Component({
  template: '',
})
class KbaAbstractIndexTestComponent extends KbaAbstractIndexComponent {
  resource = {
    count: {
      values: [
        { value: '10', name: '10', kind: 'D' },
        { value: '20', name: '20', kind: 'D' },
        { value: '40', name: '40', kind: 'D' },
        { value: '50', name: '50', kind: 'D' },
        { value: '100', name: '100', kind: 'D' },
      ],
    },
  };
  thList = [
    {
      id: 1,
      label: 'テスト１',
      name: 'test_1',
      sortKey: 'test_1',
      sortable: true,
      displayable: true,
    },
    {
      id: 2,
      label: 'テスト２',
      name: 'test_2',
      sortKey: 'test_2',
      sortable: false,
      displayable: true,
    },
    {
      id: 3,
      label: 'テスト３',
      name: 'test_3',
      sortKey: 'test_3',
      sortable: true,
      displayable: true,
    },
  ];

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService
  ) {
    super(navigationService, title, router, ref, header);
  }

  fetchList() {
    return new Promise(resolve => {
      resolve();
    });
  }

  protected _fetchDataForInitialize() {
    return new Promise(resolve => {
      resolve();
    });
  }
}

describe('KbaAbstractIndexTestComponent', () => {
  let component: KbaAbstractIndexTestComponent;
  let fixture: ComponentFixture<KbaAbstractIndexTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KbaAbstractIndexTestComponent],
      imports: [HttpClientModule, RouterTestingModule, KbaCommonModule],
      providers: [
        ApiService,
        UserSettingService,
        KbaAlertService,
        CommonHeaderService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KbaAbstractIndexTestComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('sortableThLists', async () => {
    it('result is ["test_1", "test_3"]', () => {
      expect(component.sortableThLists(component.thList)).toEqual([
        'test_1',
        'test_3',
      ]);
    });
  });

  describe('dateFormat', () => {
    it('result is "2017/07/13"', () => {
      const dateTimeString = '2017/07/13 15:51:30';
      const dateString = component.dateFormat(dateTimeString);
      expect(dateString).toEqual('2017/07/13');
    });

    it('result is "07/13/2017"', () => {
      const dateTimeString = '07/13/2017 15:51:30';
      const dateString = component.dateFormat(dateTimeString);
      expect(dateString).toEqual('07/13/2017');
    });

    it('result is "13/07/2017"', () => {
      const dateTimeString = '13/07/2017 15:51:30';
      const dateString = component.dateFormat(dateTimeString);
      expect(dateString).toEqual('13/07/2017');
    });

    it('result is "2017-07-13"', () => {
      const dateTimeString = '2017-07-13T15:51:30Z';
      const dateString = component.dateFormat(dateTimeString);
      expect(dateString).toEqual('2017-07-13');
    });
  });

  describe('dateTimeFormat', () => {
    it('result is "2017/09/13 16:58"', () => {
      const dateTimeString = '2017/09/13 16:58:30';
      const dateString = component.dateTimeFormat(dateTimeString);
      expect(dateString).toEqual('2017/09/13 16:58');
    });

    it('result is "09/13/2017 16:58"', () => {
      const dateTimeString = '09/13/2017 16:58:30';
      const dateString = component.dateTimeFormat(dateTimeString);
      expect(dateString).toEqual('09/13/2017 16:58');
    });

    it('result is "13/09/2017 16:58"', () => {
      const dateTimeString = '13/09/2017 16:58:30';
      const dateString = component.dateTimeFormat(dateTimeString);
      expect(dateString).toEqual('13/09/2017 16:58');
    });

    it('result is "2017-09-13 16:58"', () => {
      const dateTimeString = '2017-09-13T16:58:30Z';
      const dateString = component.dateTimeFormat(dateTimeString);
      expect(dateString).toEqual('2017-09-13 16:58');
    });
  });
});
