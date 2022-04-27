import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';

import { BusinessTypeNewComponent } from './business-type-new.component';

import { ApiService } from '../../../../services/api/api.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { BusinessTypeService } from '../../../../services/opa/business-type/business-type.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('BusinessTypeNewComponent', () => {
  let component: BusinessTypeNewComponent;
  let fixture: ComponentFixture<BusinessTypeNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BusinessTypeNewComponent],
      imports: [KbaCommonModule, RouterTestingModule],
      providers: [
        BusinessTypeService,
        CommonHeaderService,
        KbaAlertService,
        ApiService,
        UserSettingService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessTypeNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
