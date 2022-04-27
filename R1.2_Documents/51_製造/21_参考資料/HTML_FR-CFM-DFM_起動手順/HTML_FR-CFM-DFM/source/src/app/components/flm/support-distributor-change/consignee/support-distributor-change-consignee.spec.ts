import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';

import { SupportDistributorChangeConsigneeComponent } from './support-distributor-change-consignee.component';

import { CarService } from '../../../../services/flm/car/car.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('CarTerminalStartSettingComponent', () => {
  let component: SupportDistributorChangeConsigneeComponent;
  let fixture: ComponentFixture<SupportDistributorChangeConsigneeComponent>;
  let el: HTMLElement;
  let de: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SupportDistributorChangeConsigneeComponent],
      imports: [NgbModule, RouterTestingModule, KbaCommonModule],
      providers: [
        CarService,
        KbaAlertService,
        CommonHeaderService,
        ApiService,
        UserSettingService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(
      SupportDistributorChangeConsigneeComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display initial value', () => {
    fixture.whenStable().then(() => {
      de = fixture.debugElement.query(By.css('.KBA-page-title'));
      el = de.nativeElement;
      expect(el.innerHTML).toEqual('車両管理 引き当て一覧');
    });
  });
});
