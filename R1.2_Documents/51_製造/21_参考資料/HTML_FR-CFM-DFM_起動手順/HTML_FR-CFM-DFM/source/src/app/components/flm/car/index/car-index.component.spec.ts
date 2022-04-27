import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';

import { CarIndexComponent } from './car-index.component';

import { CarService } from '../../../../services/flm/car/car.service';
import { LandmarkService } from '../../../../services/flm/landmark/landmark.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('CarIndexComponent', () => {
  let component: CarIndexComponent;
  let fixture: ComponentFixture<CarIndexComponent>;
  let el: HTMLElement;
  let de: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CarIndexComponent],
      imports: [NgbModule, RouterTestingModule, KbaCommonModule],
      providers: [
        CarService,
        LandmarkService,
        KbaAlertService,
        CommonHeaderService,
        ApiService,
        UserSettingService,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CarIndexComponent);
    component = fixture.componentInstance;
    component.activeTab = 'targetCar';
    component.modelCarTypeCheck = false;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display initial value', () => {
    fixture.whenStable().then(() => {
      de = fixture.debugElement.query(By.css('.KBA-page-title'));
      el = de.nativeElement;
      expect(el.innerHTML).toEqual('車両管理 一覧');
    });
  });
});
