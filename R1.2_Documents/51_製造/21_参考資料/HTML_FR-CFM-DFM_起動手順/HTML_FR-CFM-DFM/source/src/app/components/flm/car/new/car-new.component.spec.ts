import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';

import { CarNewComponent } from './car-new.component';

import { ApiService } from '../../../../services/api/api.service';
import { ResourceService } from '../../../../services/api/resource.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CarService } from '../../../../services/flm/car/car.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('CarNewComponent', () => {
  let component: CarNewComponent;
  let fixture: ComponentFixture<CarNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CarNewComponent],
      imports: [HttpClientModule, RouterTestingModule, KbaCommonModule],
      providers: [
        ApiService,
        UserSettingService,
        ResourceService,
        KbaAlertService,
        CommonHeaderService,
        CarService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
