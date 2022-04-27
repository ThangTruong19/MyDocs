import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';

import { CustomerIndexComponent } from './customer-index.component';
import { CustomerDetailComponent } from './detail/customer-detail.component';

import { ApiService } from '../../../../services/api/api.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { CustomerService } from '../../../../services/flm/customer/customer.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('CustomerIndexComponent', () => {
  let component: CustomerIndexComponent;
  let fixture: ComponentFixture<CustomerIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CustomerIndexComponent, CustomerDetailComponent],
      imports: [KbaCommonModule, RouterTestingModule],
      providers: [
        CustomerService,
        CommonHeaderService,
        KbaAlertService,
        ApiService,
        UserSettingService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
