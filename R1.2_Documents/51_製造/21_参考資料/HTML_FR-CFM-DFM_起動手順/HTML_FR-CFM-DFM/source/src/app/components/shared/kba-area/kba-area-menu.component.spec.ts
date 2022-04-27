import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { FormGroup } from '@angular/forms';

import { AreaType } from '../../../constants/flm/group-area';

import { KbaCommonModule } from '../../../modules/shared/kba-common.module';

import { KbaAreaMenuComponent } from './kba-area-menu.component';

import { UserSettingService } from '../../../services/api/user-setting.service';
import { KbaMapWrapperService } from '../../../services/shared/kba-map-wrapper.service';

describe('KbaAreaMenuComponent', () => {
  let component: KbaAreaMenuComponent;
  let fixture: ComponentFixture<KbaAreaMenuComponent>;
  let menuDebug: DebugElement;
  let menuEl: HTMLElement;
  let usService: UserSettingService;
  const areaType = AreaType;
  const resource = {
    car_area: {
      feature: {
        geometry: {
          type: {
            values: [],
          },
          coordinates: [{ name: 'a' }, { name: 'b' }],
        },
        properties: {
          east_west_distance: { name: 'c' },
          north_south_distance: { name: 'd' },
        },
      },
    },
  };
  const params = {
    feature: {
      geometry: {
        type: areaType.polygon,
      },
    },
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [KbaCommonModule, BrowserAnimationsModule],
      providers: [UserSettingService],
    }).compileComponents();
  }));

  beforeEach(() => {
    usService = TestBed.get(UserSettingService);
    spyOn(usService, 'getMapParams').and.returnValue({
      lat: '30',
      lng: '30',
      zoom: '10',
      mapApplication: '0',
    });
    usService.userSettings = {
      map_latitude: '30',
      map_longitude: '30',
      map_magnification: '8',
      lang_code: 'ja',
      date_format_code: '',
      distance_unit_code: '',
    };
    usService.groupSettings = {
      map_mode: '0',
      time_difference: '',
      first_day_of_week_kind: '0',
    };
    fixture = TestBed.createComponent(KbaAreaMenuComponent);
    component = fixture.componentInstance;
    spyOn(component.changeMenuOpen, 'emit');
    component.formGroup = new FormGroup({});
    component.initMap = {};
    component.editable = true;
    component.resource = resource;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('メニューが閉じている時', () => {
    beforeEach(() => {
      component.menuOpen = false;
      component.menuState = 'close';
      fixture.detectChanges();
    });

    it('メニューボタンを押下すると、開く状態となる', () => {
      menuDebug = fixture.debugElement.query(By.css('.toggle-menu'));
      menuEl = menuDebug.nativeElement;
      menuDebug.triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(component.menuState).toBe('open');
      expect(component.changeMenuOpen.emit).toHaveBeenCalledWith(true);
    });
  });

  describe('メニューが開いている時', () => {
    beforeEach(() => {
      component.menuOpen = true;
      component.menuState = 'open';
      fixture.detectChanges();
    });

    it('メニューボタンを押下すると、閉じる状態となる', () => {
      menuDebug = fixture.debugElement.query(By.css('.toggle-menu'));
      menuEl = menuDebug.nativeElement;
      menuDebug.triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(component.menuState).toBe('close');
      expect(component.changeMenuOpen.emit).toHaveBeenCalledWith(false);
    });
  });
});
