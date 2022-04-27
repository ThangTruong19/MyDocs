import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { KbaCommonModule } from '../../../../modules/shared/kba-common.module';

import { CustomCarAttributeNewComponent } from './custom-car-attribute-new.component';
import { CustomCarAttributeDetailModalComponent } from '../../../../components/opa/custom-car-attribute/shared/modal/custom-car-attribute-detail-modal.component';

import { ApiService } from '../../../../services/api/api.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { CustomCarAttributeService } from '../../../../services/opa/custom-car-attribute/custom-car-attribute.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

describe('CustomCarAttributeNewComponent', () => {
  let component: CustomCarAttributeNewComponent;
  let fixture: ComponentFixture<CustomCarAttributeNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CustomCarAttributeNewComponent,
        CustomCarAttributeDetailModalComponent,
      ],
      imports: [KbaCommonModule, RouterTestingModule],
      providers: [
        CustomCarAttributeService,
        CommonHeaderService,
        KbaAlertService,
        ApiService,
        UserSettingService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomCarAttributeNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
