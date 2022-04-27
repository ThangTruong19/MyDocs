import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceContractComponent } from './service-contract.component';
import { KbaCommonModule } from '../../../modules/shared/kba-common.module';
import { RouterTestingModule } from '@angular/router/testing';
import { ServiceContractService } from '../../../services/opa/service-contract/service-contract.service';
import { CommonHeaderService } from '../../../services/shared/common-header.service';
import { KbaAlertService } from '../../../services/shared/kba-alert.service';
import { ApiService } from '../../../services/api/api.service';
import { UserSettingService } from '../../../services/api/user-setting.service';

describe('ServiceContractComponent', () => {
  let component: ServiceContractComponent;
  let fixture: ComponentFixture<ServiceContractComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ServiceContractComponent],
      imports: [KbaCommonModule, RouterTestingModule],
      providers: [
        ServiceContractService,
        CommonHeaderService,
        KbaAlertService,
        ApiService,
        UserSettingService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
