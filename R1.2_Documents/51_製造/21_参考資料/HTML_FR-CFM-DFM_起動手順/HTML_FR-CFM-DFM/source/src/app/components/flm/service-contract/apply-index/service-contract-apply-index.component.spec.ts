import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';
import { KbaSidemenuModule } from '../../../../modules/shared/kba-sidemenu.module';
import { KbaAccordionModule } from '../../../../modules/shared/kba-accordion.module';

import { ServiceContractApplyIndexComponent } from './service-contract-apply-index.component';
import { ChangeServiceDistributorComponent } from './change-service-distributor.component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { ApiService } from '../../../../services/api/api.service';
import { UserService } from '../../../../services/flm/user/user.service';
import { KbaStorageService } from '../../../../services/shared/kba-storage.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';
import { ServiceContractService } from '../../../../services/flm/service-contract/service-contract.service';

describe('ServiceContractApplyIndexComponent', () => {
  let component: ServiceContractApplyIndexComponent;
  let fixture: ComponentFixture<ServiceContractApplyIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ServiceContractApplyIndexComponent,
        ChangeServiceDistributorComponent,
      ],
      imports: [
        KbaCommonModule,
        KbaSidemenuModule,
        HttpClientModule,
        KbaAccordionModule,
        RouterTestingModule,
      ],
      providers: [
        KbaNavigationService,
        ApiService,
        UserSettingService,
        UserService,
        KbaStorageService,
        KbaAlertService,
        CommonHeaderService,
        ServiceContractService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceContractApplyIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
