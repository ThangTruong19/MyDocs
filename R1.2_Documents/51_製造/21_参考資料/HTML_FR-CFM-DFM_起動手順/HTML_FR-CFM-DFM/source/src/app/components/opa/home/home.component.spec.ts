import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { KbaSidemenuModule } from '../../../modules/shared/kba-sidemenu.module';
import { KbaCommonModule } from '../../../modules/shared/kba-common.module';

import { CommonConfig } from '../../../vendor/k-common-module/interfaces';

import { UserSettings } from '../../../types/user-setting';

import { HomeComponent } from './home.component';

import { KbaNavigationService } from '../../../services/shared/kba-navigation.service';
import { ApiService } from '../../../services/api/api.service';

import { ResourceService } from '../../../services/api/resource.service';
import { KbaStorageService } from '../../../services/shared/kba-storage.service';
import { KbaAlertService } from '../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../services/shared/common-header.service';
import {
  KbaHomeMenuComponent,
  KbaHomeMenuItemComponent,
} from './home-menu/home-menu.component';
import { DndModule } from 'ngx-dnd';
import { RouterTestingModule } from '@angular/router/testing';
import { UserSettingService } from '../../../services/api/user-setting.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  const settings = {
    lang_code: 'ja',
    date_format_code: '3',
    distance_unit_code: '1',
    temperature_unit_code: '0',
    division_display_kind: '0',
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        HomeComponent,
        KbaHomeMenuComponent,
        KbaHomeMenuItemComponent,
      ],
      imports: [
        KbaSidemenuModule,
        HttpClientModule,
        KbaCommonModule,
        RouterTestingModule,
        DndModule.forRoot(),
      ],
      providers: [
        KbaNavigationService,
        ApiService,
        UserSettingService,
        ResourceService,
        KbaStorageService,
        KbaAlertService,
        CommonHeaderService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
