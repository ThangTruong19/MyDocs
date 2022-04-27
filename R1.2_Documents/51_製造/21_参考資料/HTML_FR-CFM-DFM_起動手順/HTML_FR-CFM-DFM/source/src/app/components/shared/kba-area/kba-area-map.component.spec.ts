import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, Component, ViewChild } from '@angular/core';

import { KbaCommonModule } from '../../../modules/shared/kba-common.module';

import { KbaAreaMapComponent } from './kba-area-map.component';

import { KbaMapWrapperService } from '../../../services/shared/kba-map-wrapper.service';
import { UserSettingService } from '../../../services/api/user-setting.service';

@Component({
  selector: 'app-area-map-test',
  template: `
    <app-kba-area-map
      [initMap]="initMap"
      [labels]="labels"
      [menuWidth]="260"
      [menuOpen]="menuOpen"
      [editable]="true"
    >
    </app-kba-area-map>
  `,
})
class AreaMapTestComponent {
  @ViewChild(
    KbaAreaMapComponent,
    /* TODO: add static flag */ {},
    { static: false }
  )
  areaMapComponent: KbaAreaMapComponent;
  labels = {
    fitBounds: '領域をフィット',
  };
  menuOpen = false;
  initMap = {};
}

describe('KbaAreaMapComponent', () => {
  let component: AreaMapTestComponent;
  let fixture: ComponentFixture<AreaMapTestComponent>;
  let mrService: KbaMapWrapperService;
  let usService: UserSettingService;
  const mr = {
    loadScript: () => {},
    Map: (x, y) => {},
    redraw: () => {},
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AreaMapTestComponent],
      imports: [KbaCommonModule],
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
    fixture = TestBed.createComponent(AreaMapTestComponent);
    component = fixture.componentInstance;
    mrService = TestBed.get(KbaMapWrapperService);
    const resMr = Promise.resolve(mr);
    spyOn(mrService, 'getInstance').and.returnValue(resMr);
    spyOn(mr, 'loadScript').and.returnValue(Promise.resolve());
    spyOn(mr, 'Map');
    spyOn(mr, 'redraw');
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
